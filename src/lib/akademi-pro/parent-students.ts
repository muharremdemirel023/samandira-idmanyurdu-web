import "server-only";

import {
  getAkademiProConfig,
  getAkademiProOrganizationId,
} from "@/lib/akademi-pro/config";

// Velinin Akademi Pro'daki öğrencileri, Akademi Pro'nun kendi veli portalıyla
// aynı yoldan okunur: anon anahtar + velinin parent-auth token'ı ile PostgREST.
// Hangi öğrencilerin döneceğini token'daki parent_account_id üzerinden RLS
// belirler (students -> parent_student_links -> current_parent_account_id()).
// Buna ek olarak sorgu, sunucu ortam değişkenindeki organizasyon id'si ile
// daraltılır: velinin başka akademilerdeki öğrencileri bu sitede görünmez.
// Organizasyon filtresi RLS'in yerine geçmez, onun üstüne eklenir. İstemciden
// öğrenci veya akademi id'si alınmaz; service role kullanılmaz.

export type ParentStudent = {
  id: string;
  fullName: string;
  ageGroup: string | null;
  birthDate: string | null;
  trainingDays: string | null;
  trainingTime: string | null;
  coachName: string | null;
};

export type ParentStudentsFailure = {
  ok: false;
  reason: "session" | "unavailable" | "misconfigured";
  message: string;
};

export type ParentStudentsResult =
  | { ok: true; students: ParentStudent[] }
  | ParentStudentsFailure;

type UnknownRecord = Record<string, unknown>;

const STUDENT_COLUMNS =
  "id,full_name,age_group,birth_date,training_days,training_time,coach_name";

const UNAVAILABLE_MESSAGE =
  "Öğrenci bilgileri şu anda alınamıyor. Lütfen biraz sonra tekrar deneyin.";

// Akademi Pro'daki parent_session_status() durumlarının veli karşılıkları.
const SESSION_MESSAGES: Record<string, string> = {
  expired: "Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.",
  missing_session_version:
    "Oturum bilginiz güncel değil. Lütfen tekrar giriş yapın. Sorun sürerse akademiye bildirin.",
  session_revoked:
    "Oturumunuz sonlandırılmış (şifreniz değişmiş olabilir). Lütfen tekrar giriş yapın.",
  password_reset_required:
    "Şifrenizi yenilemeniz gerekiyor. Lütfen Akademi Pro veli portalından yeni şifrenizi belirleyin.",
  account_not_found: "Hesabınız bulunamadı. Lütfen akademi ile iletişime geçin.",
  no_parent_claim: "Oturumunuz geçersiz. Lütfen tekrar giriş yapın.",
};

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function sessionFailure(status: string): ParentStudentsFailure {
  return {
    ok: false,
    reason: "session",
    message: SESSION_MESSAGES[status] ?? SESSION_MESSAGES.no_parent_claim,
  };
}

function unavailable(): ParentStudentsFailure {
  return { ok: false, reason: "unavailable", message: UNAVAILABLE_MESSAGE };
}

/** Token payload'ı (imza doğrulanmaz; yalnızca teşhis içindir). */
function decodeTokenPayload(token: string): UnknownRecord | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return asRecord(JSON.parse(Buffer.from(part, "base64url").toString("utf8")));
  } catch {
    return null;
  }
}

async function restRequest(
  path: string,
  accessToken: string,
  init: { method?: "GET" | "POST"; body?: string } = {},
) {
  const { supabaseUrl, anonKey } = getAkademiProConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method: init.method ?? "GET",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body,
    cache: "no-store",
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { status: response.status, body };
}

function toStudent(row: UnknownRecord): ParentStudent | null {
  const id = asString(row.id);
  if (!id) return null;

  return {
    id,
    fullName: asString(row.full_name) ?? "İsimsiz öğrenci",
    ageGroup: asString(row.age_group),
    birthDate: asString(row.birth_date),
    trainingDays: asString(row.training_days),
    trainingTime: asString(row.training_time),
    coachName: asString(row.coach_name),
  };
}

/**
 * Sorgu boş döndüğünde nedenini belirler. RLS geçersiz oturumda hata vermez,
 * boş sonuç döner; bu yüzden "oturum geçersiz" ile "bağlı öğrenci yok" burada
 * ayrılır. null dönerse liste gerçekten boştur.
 */
async function explainEmptyStudents(accessToken: string): Promise<ParentStudentsFailure | null> {
  const { status, body } = await restRequest("rpc/parent_session_status", accessToken, {
    method: "POST",
    body: "{}",
  });

  if (status === 401) return sessionFailure("expired");

  if (status < 200 || status >= 300) {
    // Teşhis fonksiyonu Akademi Pro'da henüz yoksa token'a bakılır:
    // session_version claim'i olmayan token ile RLS hiçbir satır döndürmez.
    const payload = decodeTokenPayload(accessToken);
    if (payload && typeof payload.session_version !== "number") {
      return sessionFailure("missing_session_version");
    }
    return null;
  }

  const result = asRecord(body);
  const sessionStatus = asString(result?.status);
  if (sessionStatus && sessionStatus !== "ok") {
    return sessionFailure(sessionStatus);
  }

  const linked = typeof result?.linked_student_count === "number" ? result.linked_student_count : 0;
  if (linked === 0) return null;

  // Bağlantı var: öğrenciler başka bir akademide mi, yoksa okunamıyor mu?
  // Organizasyon filtresi olmadan RLS'in geçirdiği bir satır varsa veli bu
  // akademide değil, başka bir akademide kayıtlıdır; liste gerçekten boştur.
  const anyStudent = await restRequest("students?select=id&limit=1", accessToken);
  if (anyStudent.status === 401) return sessionFailure("expired");
  if (
    anyStudent.status >= 200 &&
    anyStudent.status < 300 &&
    Array.isArray(anyStudent.body) &&
    anyStudent.body.length > 0
  ) {
    return null;
  }

  // Oturum geçerli ve bağlantı var ama öğrenci satırı okunamadı: izin sorunu.
  console.error("Akademi Pro: veliye bağlı öğrenci var ama students okunamadı.", linked);
  return unavailable();
}

// --- Öğrenci kayıtları (devam, gelişim, ödemeler) ----------------------------
// Akademi Pro'nun veli view'ları security_invoker ile çalışır; altındaki RLS
// yalnızca parent_student_links'te karşılığı olan satırları geçirir. student_id
// filtre olarak gönderilir ama yetkiyi belirleyen o değildir. Çağıran, id'yi
// yalnızca fetchParentStudents'ın döndürdüğü (organizasyon filtreli) listeden
// seçer.

export type ParentAttendanceRow = {
  id: string;
  attendanceDate: string | null;
  status: string | null;
  note: string | null;
};

export type ParentPerformanceRow = {
  id: string;
  evaluationDate: string | null;
  evaluationPeriod: string | null;
  evaluationNote: string | null;
  averageScore: number | null;
  ballControl: number | null;
  dribbling: number | null;
  passing: number | null;
  shooting: number | null;
  physical: number | null;
  discipline: number | null;
};

export type ParentPaymentRow = {
  id: string;
  feeMonth: string | null;
  amount: number | null;
  expectedAmount: number | null;
  dueDate: string | null;
  paymentDate: string | null;
  status: string | null;
  receiptNo: string | null;
};

export type ParentStudentRecords = {
  attendance: ParentAttendanceRow[];
  performance: ParentPerformanceRow[];
  payments: ParentPaymentRow[];
};

export type ParentStudentRecordsResult =
  | ({ ok: true } & ParentStudentRecords)
  | ParentStudentsFailure;

function asNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

class RecordsRequestError extends Error {
  constructor(readonly status: number) {
    super(`Akademi Pro kayıt sorgusu başarısız (${status}).`);
  }
}

async function fetchViewRows<T>(
  accessToken: string,
  view: string,
  studentId: string,
  columns: string,
  orderColumn: string,
  map: (row: UnknownRecord) => T | null,
): Promise<T[]> {
  const { status, body } = await restRequest(
    `${view}?select=${columns}` +
      `&student_id=eq.${encodeURIComponent(studentId)}` +
      `&order=${orderColumn}.desc.nullslast&limit=100`,
    accessToken,
  );

  if (status < 200 || status >= 300 || !Array.isArray(body)) {
    console.error(`Akademi Pro ${view} sorgusu başarısız.`, status, asString(asRecord(body)?.message));
    throw new RecordsRequestError(status);
  }

  return body
    .map((row) => asRecord(row))
    .filter((row): row is UnknownRecord => row !== null)
    .map(map)
    .filter((row): row is T => row !== null);
}

export async function fetchStudentRecords(
  accessToken: string,
  studentId: string,
): Promise<ParentStudentRecordsResult> {
  try {
    const [attendance, performance, payments] = await Promise.all([
      fetchViewRows(
        accessToken,
        "parent_attendance_view",
        studentId,
        "id,attendance_date,status,note",
        "attendance_date",
        (row): ParentAttendanceRow | null => {
          const id = asString(row.id);
          return id
            ? {
                id,
                attendanceDate: asString(row.attendance_date),
                status: asString(row.status),
                note: asString(row.note),
              }
            : null;
        },
      ),
      fetchViewRows(
        accessToken,
        "parent_performance_view",
        studentId,
        "id,evaluation_date,evaluation_period,evaluation_note,average_score," +
          "ball_control,dribbling,passing,shooting,physical,discipline",
        "evaluation_date",
        (row): ParentPerformanceRow | null => {
          const id = asString(row.id);
          return id
            ? {
                id,
                evaluationDate: asString(row.evaluation_date),
                evaluationPeriod: asString(row.evaluation_period),
                evaluationNote: asString(row.evaluation_note),
                averageScore: asNumber(row.average_score),
                ballControl: asNumber(row.ball_control),
                dribbling: asNumber(row.dribbling),
                passing: asNumber(row.passing),
                shooting: asNumber(row.shooting),
                physical: asNumber(row.physical),
                discipline: asNumber(row.discipline),
              }
            : null;
        },
      ),
      fetchViewRows(
        accessToken,
        "parent_payments_view",
        studentId,
        "id,fee_month,amount,expected_amount,due_date,payment_date,status,receipt_no",
        "fee_month",
        (row): ParentPaymentRow | null => {
          const id = asString(row.id);
          return id
            ? {
                id,
                feeMonth: asString(row.fee_month),
                amount: asNumber(row.amount),
                expectedAmount: asNumber(row.expected_amount),
                dueDate: asString(row.due_date),
                paymentDate: asString(row.payment_date),
                status: asString(row.status),
                receiptNo: asString(row.receipt_no),
              }
            : null;
        },
      ),
    ]);

    return { ok: true, attendance, performance, payments };
  } catch (error) {
    if (error instanceof RecordsRequestError && error.status === 401) {
      return sessionFailure("expired");
    }
    if (!(error instanceof RecordsRequestError)) {
      console.error("Akademi Pro kayıt isteği hatası.", error);
    }
    return {
      ok: false,
      reason: "unavailable",
      message: "Devam, gelişim ve ödeme kayıtları şu anda alınamıyor. Lütfen tekrar deneyin.",
    };
  }
}

export async function fetchParentStudents(accessToken: string): Promise<ParentStudentsResult> {
  const misconfigured: ParentStudentsFailure = {
    ok: false,
    reason: "misconfigured",
    message: "Veli paneli henüz yapılandırılmamış. Lütfen akademi ile iletişime geçin.",
  };

  try {
    getAkademiProConfig();
  } catch (error) {
    console.error("Akademi Pro veli paneli yapılandırması eksik.", error);
    return misconfigured;
  }

  // Organizasyon tanımlı değilse tüm akademilerin öğrencilerini göstermek
  // yerine panel kapalı kalır.
  const organizationId = getAkademiProOrganizationId();
  if (!organizationId) {
    console.error("AKADEMI_PRO_ORGANIZATION_ID eksik veya geçerli bir UUID değil.");
    return misconfigured;
  }

  try {
    const { status, body } = await restRequest(
      `students?select=${STUDENT_COLUMNS}` +
        `&organization_id=eq.${encodeURIComponent(organizationId)}` +
        `&order=full_name.asc`,
      accessToken,
    );

    // PostgREST süresi dolmuş veya imzası geçersiz token için 401 döner.
    if (status === 401) return sessionFailure("expired");

    if (status < 200 || status >= 300 || !Array.isArray(body)) {
      console.error(
        "Akademi Pro students sorgusu başarısız.",
        status,
        asString(asRecord(body)?.message),
      );
      return unavailable();
    }

    const students = body
      .map((row) => asRecord(row))
      .filter((row): row is UnknownRecord => row !== null)
      .map(toStudent)
      .filter((student): student is ParentStudent => student !== null);

    if (students.length === 0) {
      const failure = await explainEmptyStudents(accessToken);
      if (failure) return failure;
    }

    return { ok: true, students };
  } catch (error) {
    console.error("Akademi Pro students isteği hatası.", error);
    return unavailable();
  }
}
