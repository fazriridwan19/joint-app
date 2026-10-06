import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from 'cn'

type Props = {
  expanded: boolean
  hiddenCount: number
  onToggle: () => void
  className?: string
}

export function ShowMoreButton({ expanded, hiddenCount, onToggle, className }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#d9dfd5] py-1.5 text-[12px] font-medium text-[#68736a] transition-colors hover:border-[#256b4d] hover:text-[#256b4d]',
        className,
      )}
    >
      {expanded ? (
        <>
          <ChevronUp size={13} /> Sembunyikan
        </>
      ) : (
        <>
          <ChevronDown size={13} /> {hiddenCount} item lainnya
        </>
      )}
    </button>
  )
}
