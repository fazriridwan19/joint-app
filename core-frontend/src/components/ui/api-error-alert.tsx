import { useEffect, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { getApiError } from '../../lib/api-client'

type ApiErrorAlertProps = {
  error: unknown
}

export function ApiErrorAlert({ error }: ApiErrorAlertProps) {
  const apiError = typeof error === 'string'
    ? { message: error, details: null, requestId: '' }
    : getApiError(error)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!apiError) {
      setIsVisible(false)
      return
    }

    setIsVisible(true)
    const timeoutId = window.setTimeout(() => setIsVisible(false), 6000)
    return () => window.clearTimeout(timeoutId)
  }, [error])

  if (!apiError) return null

  return (
    <div
      className={`fixed top-5 right-5 z-50 w-[min(calc(100vw-2rem),390px)] transition-all duration-300 ease-out ${
        isVisible ? 'toast-enter' : 'pointer-events-none toast-exit'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="overflow-hidden rounded-xl border border-[#f1c2b6] bg-white shadow-[0_18px_45px_-18px_rgba(117,45,29,0.45)]">
        <div className="flex items-start gap-3 border-l-4 border-[#d95f43] px-4 py-3.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fff0eb] text-[#c64e35]">
            <AlertCircle size={17} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[11px] font-bold uppercase tracking-[1.1px] text-[#a64632]">
              Permintaan gagal
            </p>
            <p className="mt-1 text-[13px] leading-5 text-[#4d3029]">{apiError.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="-mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-md text-[#a68b84] transition-colors hover:bg-[#fff0eb] hover:text-[#a64632]"
            aria-label="Tutup pesan error"
            title="Tutup"
          >
            <X size={15} />
          </button>
        </div>
        {apiError.details && apiError.details.length > 0 && (
          <ul className="border-t border-[#f5e4df] bg-[#fffaf8] px-5 py-2.5 pl-12 text-[12px] leading-5 text-[#8f5d52]">
            {apiError.details.map((detail) => (
              <li key={`${detail.field}-${detail.issue}-${detail.message}`}>
                {detail.field ? `${detail.field}: ` : ''}{detail.message}
              </li>
            ))}
          </ul>
        )}
        {apiError.requestId && (
          <p className="border-t border-[#f5e4df] px-5 py-2 text-[10px] text-[#b96859]">
            ID referensi: {apiError.requestId}
          </p>
        )}
      </div>
    </div>
  )
}