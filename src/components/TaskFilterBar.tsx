import { PRIORITY_LABELS, STATUS_LABELS, STATUS_ORDER } from '../lib/utils'
import type { TaskListFilter, TaskPriority, TaskStatus } from '../types/task'
import type { User } from '../types/user'

interface TaskFilterBarProps {
  users: User[]
  filter: TaskListFilter
  onChange: (filter: TaskListFilter) => void
}

export function TaskFilterBar({ users, filter, onChange }: TaskFilterBarProps) {
  const set = (patch: Partial<TaskListFilter>) => onChange({ ...filter, ...patch })

  const hasActive =
    Boolean(filter.name?.trim()) ||
    Boolean(filter.status) ||
    Boolean(filter.priority) ||
    Boolean(filter.creator_id) ||
    Boolean(filter.assigned_ids?.length) ||
    Boolean(filter.reviewer_ids?.length)

  const reset = () => onChange({})

  return (
    <div className="filters">
      <label className="field filters__search">
        <span className="field__label">Name</span>
        <input
          className="field__input"
          type="search"
          placeholder="Search by name…"
          value={filter.name ?? ''}
          onChange={(e) => set({ name: e.target.value })}
        />
      </label>

      <label className="field">
        <span className="field__label">Status</span>
        <select
          className="field__input"
          value={filter.status ?? ''}
          onChange={(e) => set({ status: (e.target.value || undefined) as TaskStatus | undefined })}
        >
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">Priority</span>
        <select
          className="field__input"
          value={filter.priority ?? ''}
          onChange={(e) =>
            set({ priority: (e.target.value || undefined) as TaskPriority | undefined })
          }
        >
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">Creator</span>
        <select
          className="field__input"
          value={filter.creator_id ?? ''}
          onChange={(e) => set({ creator_id: e.target.value || undefined })}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">Assignee</span>
        <select
          className="field__input"
          value={filter.assigned_ids?.[0] ?? ''}
          onChange={(e) => set({ assigned_ids: e.target.value ? [e.target.value] : undefined })}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">Reviewer</span>
        <select
          className="field__input"
          value={filter.reviewer_ids?.[0] ?? ''}
          onChange={(e) => set({ reviewer_ids: e.target.value ? [e.target.value] : undefined })}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </label>

      {hasActive && (
        <button type="button" className="btn btn--ghost" onClick={reset}>
          Reset filters
        </button>
      )}
    </div>
  )
}