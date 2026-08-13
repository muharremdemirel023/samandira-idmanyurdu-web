import "server-only";

export type PreRegistrationNotificationInput = {
  guardianName: string;
  phone: string;
  email: string | null;
  studentName: string;
  birthYear: string;
  note: string;
  submittedAt: Date;
};

export type PreRegistrationNotificationResult = {
  status: "sent" | "failed" | "skipped";
  attempts: number;
  error?: string;
};

const resendApiUrl = "https://api.resend.com/emails";
const defaultNotifyEmail = "samandiraidmanyurduakademi@gmail.com";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatSubmittedAt(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function resolveFromEmail() {
  return (
    process.env.PRE_REGISTRATION_FROM_EMAIL ??
    "Samandıra İdman Yurdu <onboarding@resend.dev>"
  );
}

// Resend'e 3 denemeli, exponential backoff'lu tek gönderim noktası.
async function sendViaResend(payload: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<PreRegistrationNotificationResult> {
  let lastError = "E-posta bildirimi gönderilemedi.";

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(resendApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${payload.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: payload.from,
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
        }),
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      });

      if (response.ok) return { status: "sent", attempts: attempt };
      lastError = `Resend HTTP ${response.status}`;

      if (response.status < 500 && response.status !== 429) {
        return { status: "failed", attempts: attempt, error: lastError };
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }

    if (attempt < 3) await wait(300 * 2 ** (attempt - 1));
  }

  return { status: "failed", attempts: 3, error: lastError };
}

export async function sendPreRegistrationNotification(
  input: PreRegistrationNotificationInput,
): Promise<PreRegistrationNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { status: "skipped", attempts: 0, error: "RESEND_API_KEY tanımlı değil." };
  }

  const notifyEmail = process.env.PRE_REGISTRATION_NOTIFY_EMAIL ?? defaultNotifyEmail;
  const fromEmail = resolveFromEmail();
  const submittedAt = formatSubmittedAt(input.submittedAt);
  const guardianEmail = input.email?.trim() || "Belirtilmedi";
  const safeNote = input.note.trim() || "Not eklenmedi.";

  const text = [
    "Yeni Akademi Ön Kayıt Başvurusu",
    "",
    `Veli adı: ${input.guardianName}`,
    `Telefon: ${input.phone}`,
    `E-posta: ${guardianEmail}`,
    `Öğrenci adı: ${input.studentName}`,
    `Doğum yılı: ${input.birthYear}`,
    `Not: ${safeNote}`,
    `Başvuru tarihi: ${submittedAt}`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#08142D;line-height:1.55">
      <h1 style="font-size:22px;margin:0 0 16px">Yeni Akademi Ön Kayıt Başvurusu</h1>
      <p><strong>Veli adı:</strong> ${escapeHtml(input.guardianName)}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(input.phone)}</p>
      <p><strong>E-posta:</strong> ${escapeHtml(guardianEmail)}</p>
      <p><strong>Öğrenci adı:</strong> ${escapeHtml(input.studentName)}</p>
      <p><strong>Doğum yılı:</strong> ${escapeHtml(input.birthYear)}</p>
      <p><strong>Not:</strong> ${escapeHtml(safeNote)}</p>
      <p><strong>Başvuru tarihi:</strong> ${escapeHtml(submittedAt)}</p>
    </div>
  `;

  return sendViaResend({
    apiKey,
    from: fromEmail,
    to: notifyEmail,
    subject: "Yeni Akademi Ön Kayıt Başvurusu",
    text,
    html,
  });
}

const acknowledgementSubject = "Ön Kaydınız Alındı | Samandıra İdman Yurdu S.K. Akademi";
const acknowledgementParagraphs = [
  "Merhaba,",
  "Samandıra İdman Yurdu S.K. Akademi web sitesi üzerinden oluşturduğunuz ön kayıt başvurunuz başarıyla tarafımıza ulaşmıştır.",
  "Akademi ekibimiz, başvurunuzdaki iletişim bilgileri üzerinden en kısa sürede sizinle iletişime geçecektir.",
  "İlginiz için teşekkür ederiz.",
];

// Veliye gonderilen "basvurunuz alindi" bilgilendirmesi. Basarisizligi on kayit
// kaydini etkilemez; cagiran taraf sonucu yalnizca loglar.
export async function sendPreRegistrationAcknowledgement(
  email: string,
): Promise<PreRegistrationNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { status: "skipped", attempts: 0, error: "RESEND_API_KEY tanımlı değil." };
  }

  const recipient = email.trim();
  if (!recipient) {
    return { status: "skipped", attempts: 0, error: "Veli e-posta adresi yok." };
  }

  const text = [
    ...acknowledgementParagraphs,
    "",
    "Samandıra İdman Yurdu S.K. Akademi",
    "www.samandiraidmanyurdu.com",
  ].join("\n\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#08142D;line-height:1.55">
      ${acknowledgementParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      <p style="margin-top:24px"><strong>Samandıra İdman Yurdu S.K. Akademi</strong><br />
        <a href="https://www.samandiraidmanyurdu.com">www.samandiraidmanyurdu.com</a>
      </p>
    </div>
  `;

  return sendViaResend({
    apiKey,
    from: resolveFromEmail(),
    to: recipient,
    subject: acknowledgementSubject,
    text,
    html,
  });
}
