import "server-only";

export type PreRegistrationNotificationInput = {
  guardianName: string;
  phone: string;
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

export async function sendPreRegistrationNotification(
  input: PreRegistrationNotificationInput,
): Promise<PreRegistrationNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return { status: "skipped", attempts: 0, error: "RESEND_API_KEY tanımlı değil." };
  }

  const notifyEmail = process.env.PRE_REGISTRATION_NOTIFY_EMAIL ?? defaultNotifyEmail;
  const fromEmail =
    process.env.PRE_REGISTRATION_FROM_EMAIL ??
    "Samandıra İdman Yurdu <onboarding@resend.dev>";
  const submittedAt = formatSubmittedAt(input.submittedAt);
  const safeNote = input.note.trim() || "Not eklenmedi.";

  const text = [
    "Yeni Akademi Ön Kayıt Başvurusu",
    "",
    `Veli adı: ${input.guardianName}`,
    `Telefon: ${input.phone}`,
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
      <p><strong>Öğrenci adı:</strong> ${escapeHtml(input.studentName)}</p>
      <p><strong>Doğum yılı:</strong> ${escapeHtml(input.birthYear)}</p>
      <p><strong>Not:</strong> ${escapeHtml(safeNote)}</p>
      <p><strong>Başvuru tarihi:</strong> ${escapeHtml(submittedAt)}</p>
    </div>
  `;

  let lastError = "E-posta bildirimi gönderilemedi.";

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(resendApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: notifyEmail,
          subject: "Yeni Akademi Ön Kayıt Başvurusu",
          text,
          html,
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
