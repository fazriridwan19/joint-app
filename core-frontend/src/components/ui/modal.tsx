import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from 'cn'
import { Button } from './button'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  footer?: ReactNode
}

export function Modal({ open, onClose, title, description, children, size = 'md', footer }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open) {
      el.showModal()
    } else {
      el.close()
    }
  }, [open])

  // Close on backdrop click
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose()
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onClose={onClose}
      className={cn(
        'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 w-[calc(100%-2rem)]',
        'rounded-xl border border-[#d9dfd5] bg-white p-0 shadow-xl',
        'backdrop:bg-black/40 backdrop:backdrop-blur-[2px]',
        'open:flex open:flex-col',
        sizeClasses[size],
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#d9dfd5] px-6 py-4">
        <div>
          <h2 className="font-semibold text-[#17211b]">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-[#68736a]">{description}</p>}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Tutup modal">
          <X size={16} />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="flex items-center justify-end gap-2 border-t border-[#d9dfd5] px-6 py-4">
          {footer}
        </div>
      )}
    </dialog>
  )
}
