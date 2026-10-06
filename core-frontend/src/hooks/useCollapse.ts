import { useState } from 'react'

const DEFAULT_VISIBLE = 3

/**
 * Controls a "show more / show less" pattern for a list.
 * @param total  Total number of items in the list
 * @param limit  How many items to show when collapsed (default: 3)
 */
export function useCollapse(total: number, limit = DEFAULT_VISIBLE) {
  const [expanded, setExpanded] = useState(false)

  const hasMore = total > limit
  const visibleCount = expanded ? total : Math.min(limit, total)
  const hiddenCount = total - limit

  return {
    expanded,
    toggle: () => setExpanded((v) => !v),
    visibleCount,
    hasMore,
    hiddenCount,
  }
}
