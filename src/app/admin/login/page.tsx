import { LoginForm } from "@/app/admin/login/LoginForm";

export const metadata = { title: "Yönetici Girişi" };

const errorMessages: Record<string, string> = {
  credentials: "E-posta adresi veya şifre hatalı.",
  unauthorized: "Bu hesabın yönetim paneline erişim yetkisi yok.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/75 p-5 shadow-2xl shadow-black/25 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">Yönetim Paneli</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Yönetici Girişi</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Yönetim paneline erişmek için yönetici hesabınızla giriş yapın.
        </p>
        {error && errorMessages[error] ? (
          <p role="alert" className="mt-4 rounded-xl border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            {errorMessages[error]}
          </p>
        ) : null}
        <div className="mt-6"><LoginForm /></div>
      </section>
    </main>
  );
}
