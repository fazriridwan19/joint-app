import { cn } from 'cn'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="grid gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-semibold text-[#39453c]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-md border border-[#d9dfd5] bg-white px-3 py-2 text-sm text-[#17211b] outline-none placeholder:text-[#9aaa9e] focus:border-[#256b4d] focus:ring-4 focus:ring-[#256b4d1f] disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[#ba442d] focus:border-[#ba442d] focus:ring-[#ba442d1f]',
          className,
        )}
        {...props}
      />
      {error && <p className="text-[12px] text-[#ba442d]">{error}</p>}
    </div>
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="grid gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-semibold text-[#39453c]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={3}
        className={cn(
          'w-full resize-y rounded-md border border-[#d9dfd5] bg-white px-3 py-2 text-sm text-[#17211b] outline-none placeholder:text-[#9aaa9e] focus:border-[#256b4d] focus:ring-4 focus:ring-[#256b4d1f] disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[#ba442d] focus:border-[#ba442d] focus:ring-[#ba442d1f]',
          className,
        )}
        {...props}
      />
      {error && <p className="text-[12px] text-[#ba442d]">{error}</p>}
    </div>
  )
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  placeholder?: string
}

export function Select({ label, error, placeholder, className, id, children, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="grid gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-semibold text-[#39453c]">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full rounded-md border border-[#d9dfd5] bg-white px-3 py-2 text-sm text-[#17211b] outline-none focus:border-[#256b4d] focus:ring-4 focus:ring-[#256b4d1f] disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[#ba442d] focus:border-[#ba442d] focus:ring-[#ba442d1f]',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      {error && <p className="text-[12px] text-[#ba442d]">{error}</p>}
    </div>
  )
}
