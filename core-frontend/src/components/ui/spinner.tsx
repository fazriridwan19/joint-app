import { cn } from 'cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'size-5 animate-spin rounded-full border-2 border-[#d9dfd5] border-t-[#256b4d]',
        className,
      )}
      role="status"
      aria-label="Memuat..."
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Spinner className="size-8" />
    </div>
  )
}
