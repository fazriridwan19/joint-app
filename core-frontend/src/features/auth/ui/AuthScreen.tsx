import { useState, type FormEvent } from "react";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { getApiMessage } from "../../../lib/api-client";
import { ApiErrorAlert } from "../../../components/ui/api-error-alert";
import { useAuthStore } from "../model/auth-store";

type AuthMode = "login" | "register";

export function AuthScreen() {
  const { isLoading, login, register } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      if (mode === "register") await register(email, password, name);
      else await login(email, password);
    } catch (requestError) {
      setError(getApiMessage(requestError));
    }
  };

  return (
    <main className="grid min-h-svh bg-[#f5f6f0] md:grid-cols-[minmax(340px,0.9fr)_1.1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#1d4f3a] p-10 text-[#eff5e9] after:absolute after:-right-[120px] after:-bottom-[90px] after:size-[330px] after:rounded-full after:border after:border-[#eff5e938] md:flex md:px-[6vw]">
        <div className="z-10 inline-flex items-center gap-2 font-bold tracking-[0.5px]">
          <BriefcaseBusiness size={20} /> <span>Joint</span>
        </div>
        <div className="z-10 max-w-107.5">
          <div className="text-[11px] font-bold tracking-[1.8px] text-[#ef8156]">
            JOB SEARCH, ORGANIZED
          </div>
          <h1 className="my-4.5 mb-6 font-serif text-[clamp(42px,5vw,72px)] font-medium leading-[0.98] tracking-[-2px]">
            Every opportunity, in one clear view.
          </h1>
          <p className="max-w-80 leading-[1.6] text-[#b9d0be]">
            Catat momentum. Siapkan langkah berikutnya. Tetap memegang kendali.
          </p>
        </div>
        <div className="z-10 text-[11px] tracking-[1.2px] text-[#93b7a0]">
          01 / IDENTITY MODULE
        </div>
      </section>
      <section className="grid min-h-svh place-items-center p-6 md:p-12">
        <div className="w-full max-w-102.5">
          <div className="mb-12 inline-flex items-center gap-2 font-bold tracking-[0.5px] md:hidden">
            <BriefcaseBusiness size={20} /> <span>Joint</span>
          </div>
          <div className="text-[11px] font-bold tracking-[1.8px] text-[#ef8156]">
            {mode === "login" ? "KEMBALI KE WORKSPACE" : "MULAI DENGAN JOINT"}
          </div>
          <h2 className="mt-3 mb-2 font-serif text-[42px] font-medium leading-tight tracking-[-1.2px] text-[#17211b]">
            {mode === "login" ? "Masuk ke akunmu" : "Buat akun baru"}
          </h2>
          <p className="mb-8 text-[#68736a]">
            {mode === "login"
              ? "Lanjutkan dari tempat terakhir kamu berhenti."
              : "Satu tempat untuk seluruh perjalanan lamaranmu."}
          </p>
          <form className="grid gap-4.5" onSubmit={submit}>
            {mode === "register" && (
              <label className="grid gap-2 text-[13px] font-semibold text-[#39453c]">
                Nama lengkap
                <input
                  className="w-full rounded-md border border-[#d9dfd5] bg-white px-[13px] py-3 text-[#17211b] outline-none focus:border-[#256b4d] focus:ring-4 focus:ring-[#256b4d1f]"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
            )}
            <label className="grid gap-2 text-[13px] font-semibold text-[#39453c]">
              Email
              <input
                className="w-full rounded-md border border-[#d9dfd5] bg-white px-[13px] py-3 text-[#17211b] outline-none focus:border-[#256b4d] focus:ring-4 focus:ring-[#256b4d1f]"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="grid gap-2 text-[13px] font-semibold text-[#39453c]">
              Password
              <input
                className="w-full rounded-md border border-[#d9dfd5] bg-white px-[13px] py-3 text-[#17211b] outline-none focus:border-[#256b4d] focus:ring-4 focus:ring-[#256b4d1f]"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </label>
            {error && (
              <ApiErrorAlert error={error} />
            )}
            <Button
              className="mt-1 w-full bg-[#256b4d] text-white hover:bg-[#1b563d]"
              type="submit"
              size="lg"
              disabled={isLoading}
            >
              {isLoading
                ? "Memproses..."
                : mode === "login"
                  ? "Masuk"
                  : "Daftar"}{" "}
              <ArrowRight size={17} />
            </Button>
          </form>
          <button
            className="mx-auto mt-6 block border-0 bg-transparent p-1 text-[13px] text-[#256b4d]"
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login"
              ? "Belum punya akun? Daftar"
              : "Sudah punya akun? Masuk"}
          </button>
        </div>
      </section>
    </main>
  );
}
