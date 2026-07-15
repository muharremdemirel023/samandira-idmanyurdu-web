type PreRegistrationNotificationInput = {
  guardianName: string;
  phone: string;
  studentName: string;
  birthYear: string;
  note: string;
  submittedAt: Date;
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

export async function sendPreRegistrationNotification(input: PreRegistrationNotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return;
  }

  const notifyEmail = process.env.PRE_REGISTRATION_NOTIFY_EMAIL ?? defaultNotifyEmail;
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

  const response = await fetch(resendApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Samandıra İdman Yurdu <onboarding@resend.dev>",
      to: notifyEmail,
      subject: "Yeni Akademi Ön Kayıt Başvurusu",
      text,
      html,
    }),
  });

  if (!response.ok) {
    throw new Error("Ön kayıt e-posta bildirimi gönderilemedi.");
  }
}
