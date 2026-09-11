import { PRIORITY_LABELS, STATUS_LABELS } from '../lib/utils'
import type { TaskPriority, TaskStatus } from '../types/task'

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`badge badge-status badge-status--${status}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`badge badge-priority badge-priority--${priority}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  )
}