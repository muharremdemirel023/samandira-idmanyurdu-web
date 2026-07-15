import { LoginForm } from "@/app/admin/login/LoginForm";

export const metadata = {
  title: "Yönetici Girişi",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/75 p-5 shadow-2xl shadow-black/25 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          Yönetim Paneli
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">Yönetici Girişi</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Yönetim paneline erişmek için e-posta adresiniz ve şifrenizle giriş yapın.
        </p>

        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
