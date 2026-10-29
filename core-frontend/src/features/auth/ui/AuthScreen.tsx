import { useState, type FormEvent } from 'react'
import { ArrowRight, BriefcaseBusiness, Check, Sparkles } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { getApiMessage } from '../../../lib/api-client'
import { ApiErrorAlert } from '../../../components/ui/api-error-alert'
import { useAuthStore } from '../model/auth-store'

type AuthMode = 'login' | 'register'

export function AuthScreen() {
  const { isLoading, login, register } = useAuthStore()
  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    try {
      if (mode === 'register') await register(email, password, name)
      else await login(email, password)
    } catch (requestError) {
      setError(getApiMessage(requestError))
    }
  }

  return (
    <main className="joint-auth grid min-h-svh bg-[#f4f5f7] md:grid-cols-[minmax(380px,0.95fr)_1.05fr]">
      <section className="relative hidden min-h-svh flex-col justify-between overflow-hidden bg-[#e6ede5] px-10 py-9 text-[#29312b] md:flex md:px-[6vw]">
        <div className="pointer-events-none absolute -right-36 -bottom-48 size-[500px] rounded-full border border-[#55745e]/10" />
        <div className="pointer-events-none absolute -right-16 -bottom-28 size-[340px] rounded-full border border-[#55745e]/10" />
        <div className="pointer-events-none absolute right-[-10px] bottom-[-80px] size-[180px] rounded-full bg-[#a8b58a]/20 blur-[70px]" />

        <div className="relative z-10 inline-flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#a8b58a] text-[#191a14]">
            <BriefcaseBusiness size={19} strokeWidth={2.5} />
          </span>
          <span className="text-[19px] font-semibold tracking-[-0.04em]">joint<span className="text-[#a8b58a]">.</span></span>
        </div>

        <div className="relative z-10 max-w-[500px] py-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#55745e]/15 bg-white/55 px-3 py-1.5 text-[10px] font-medium tracking-wide text-[#62685f]">
            <Sparkles size={13} className="text-[#a8b58a]" />
            WORKSPACE UNTUK PERJALANAN KARIERMU
          </div>
          <h1 className="text-[clamp(42px,5.2vw,72px)] font-semibold leading-[0.99] tracking-[-0.065em]">
            Kesempatan baru, <span className="text-[#a8b58a]">lebih terarah.</span>
          </h1>
          <p className="mt-6 max-w-[390px] text-[14px] leading-7 text-[#62685f]">
            Satukan setiap lamaran, kenalan, dan langkah berikutnya dalam satu workspace yang rapi.
          </p>

          <div className="mt-12 grid max-w-[430px] grid-cols-2 gap-3">
            {['Pantau proses lamaran', 'Siapkan tahap berikutnya', 'Simpan kontak penting', 'Jaga momentum'].map((item) => (
              <div key={item} className="flex items-center gap-2.5 rounded-xl border border-[#55745e]/10 bg-white/45 px-3 py-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#a8b58a]/15 text-[#a8b58a]">
                  <Check size={12} />
                </span>
                <span className="text-[10px] font-medium text-[#62685f]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-[#55745e]/15 pt-5 text-[10px] text-[#858b81]">
          <span>Ruang kerja untuk langkah selanjutnya.</span>
          <span>JOINT WORKSPACE</span>
        </div>
      </section>

      <section className="grid min-h-svh place-items-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[390px]">
          <div className="mb-12 inline-flex items-center gap-2.5 md:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#201f19] text-[#a8b58a]">
              <BriefcaseBusiness size={18} />
            </span>
            <span className="text-[18px] font-semibold tracking-[-0.04em] text-[#20212a]">joint<span className="text-[#a8b58a]">.</span></span>
          </div>

          <div className="rounded-[24px] border border-[#e9e9ed] bg-white p-6 shadow-[0_24px_70px_-45px_rgba(27,29,39,0.28)] sm:p-9">
            <div className="mb-5 inline-flex size-10 items-center justify-center rounded-xl bg-[#303329] text-[#a8b58a]">
              <BriefcaseBusiness size={18} />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#7b9d4c]">
              {mode === 'login' ? 'Selamat datang kembali' : 'Mulai workspace-mu'}
            </div>
            <h2 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.05em] text-[#20212a]">
              {mode === 'login' ? 'Masuk ke Joint' : 'Buat akun'}
            </h2>
            <p className="mt-2 mb-7 text-[12px] leading-5 text-[#858792]">
              {mode === 'login'
                ? 'Lanjutkan mengelola perjalanan lamaranmu.'
                : 'Satu ruang untuk mengatur perjalanan kariermu.'}
            </p>

            <form className="grid gap-4" onSubmit={submit}>
              {mode === 'register' && (
                <label className="grid gap-1.5 text-[11px] font-medium text-[#555762]">
                  Nama lengkap
                  <input
                    className="w-full rounded-xl border border-[#3a392f] bg-[#1a1a15] px-3.5 py-3 text-[12px] text-[#f1eee5] outline-none transition focus:border-[#a8b58a] focus:ring-4 focus:ring-[#a8b58a]/20"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    required
                  />
                </label>
              )}
              <label className="grid gap-1.5 text-[11px] font-medium text-[#555762]">
                Email
                <input
                  className="w-full rounded-xl border border-[#3a392f] bg-[#1a1a15] px-3.5 py-3 text-[12px] text-[#f1eee5] outline-none transition focus:border-[#a8b58a] focus:ring-4 focus:ring-[#a8b58a]/20"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              <label className="grid gap-1.5 text-[11px] font-medium text-[#555762]">
                Password
                <input
                  className="w-full rounded-xl border border-[#3a392f] bg-[#1a1a15] px-3.5 py-3 text-[12px] text-[#f1eee5] outline-none transition focus:border-[#a8b58a] focus:ring-4 focus:ring-[#a8b58a]/20"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={8}
                  required
                />
              </label>
              {error && <ApiErrorAlert error={error} />}
              <Button
                className="mt-1 h-11 w-full rounded-xl bg-[#a8b58a] text-[12px] font-medium text-[#191a14] hover:bg-[#bac69c]"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Memproses...' : mode === 'login' ? 'Masuk ke workspace' : 'Buat akun'}
                <ArrowRight size={16} />
              </Button>
            </form>

            <div className="mt-6 border-t border-[#f0f0f2] pt-5 text-center">
              <button
                className="text-[11px] font-medium text-[#b7b2a3] transition-colors hover:text-[#a8b58a]"
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setError('')
                }}
              >
                {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                <span className="text-[#a8b58a]">{mode === 'login' ? 'Daftar' : 'Masuk'}</span>
              </button>
            </div>
          </div>
          <p className="mt-5 text-center text-[10px] text-[#a2a3ab]">
            Dengan melanjutkan, kamu menyetujui ketentuan penggunaan Joint.
          </p>
        </div>
      </section>
    </main>
  )
}
