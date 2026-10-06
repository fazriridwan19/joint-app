import { Modal } from './modal'
import { Button } from './button'

type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  isLoading?: boolean
  variant?: 'danger' | 'default'
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  isLoading = false,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={
              variant === 'danger'
                ? 'bg-[#ba442d] text-white hover:bg-[#9e3824]'
                : 'bg-[#256b4d] text-white hover:bg-[#1b563d]'
            }
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </Button>
        </>
      }
    >
      <></>
    </Modal>
  )
}
