import { cn } from 'cn'
import type { ApplicationStatus, PriorityLevel } from '../../types/api'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[#e7eee3] text-[#256b4d]',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  neutral: 'bg-[#f0f0ec] text-[#4a5c4e]',
  purple: 'bg-purple-50 text-purple-700',
}

type BadgeProps = {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusVariantMap: Record<ApplicationStatus, BadgeVariant> = {
  WISHLIST: 'neutral',
  APPLIED: 'info',
  IN_REVIEW: 'info',
  ASSESSMENT: 'warning',
  INTERVIEW: 'warning',
  OFFER: 'purple',
  HIRED: 'success',
  REJECTED: 'danger',
  WITHDRAWN: 'neutral',
  ON_HOLD: 'neutral',
  GHOSTED: 'neutral',
}

const statusLabels: Record<ApplicationStatus, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  IN_REVIEW: 'In Review',
  ASSESSMENT: 'Assessment',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  ON_HOLD: 'On Hold',
  GHOSTED: 'Ghosted',
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge variant={statusVariantMap[status]}>{statusLabels[status]}</Badge>
}

// ─── Priority badge ───────────────────────────────────────────────────────────

const priorityVariantMap: Record<PriorityLevel, BadgeVariant> = {
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'danger',
}

const priorityLabels: Record<PriorityLevel, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
}

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  return <Badge variant={priorityVariantMap[priority]}>{priorityLabels[priority]}</Badge>
}
