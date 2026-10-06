import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#e7eee3] text-[#256b4d]">
        <Icon size={24} />
      </div>
      <h3 className="mb-1 font-semibold text-[#17211b]">{title}</h3>
      {description && <p className="mb-5 max-w-xs text-sm text-[#68736a]">{description}</p>}
      {action}
    </div>
  )
}
