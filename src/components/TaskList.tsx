import { STATUS_LABELS, STATUS_ORDER } from '../lib/utils'
import type { TaskListResponse } from '../types/task'
import { PriorityBadge } from './Badges'

interface TaskListProps {
  tasks: TaskListResponse[]
  onSelect: (id: string) => void
}

function TaskCard({ task, onSelect }: { task: TaskListResponse; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      className="task-card"
      onClick={() => onSelect(task.id)}
      title={task.description}
    >
      <div className="task-card__top">
        <PriorityBadge priority={task.priority} />
        <span className="task-card__project">{task.project_name}</span>
      </div>
      <div className="task-card__name">{task.name}</div>
      {task.description && <div className="task-card__desc">{task.description}</div>}
    </button>
  )
}

export function TaskList({ tasks, onSelect }: TaskListProps) {
  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: tasks.filter((t) => t.status === status),
  }))

  return (
    <div className="board">
      {grouped.map(({ status, items }) => (
        <div key={status} className={`board__col board__col--${status}`}>
          <div className="board__col-header">
            <span className="board__col-dot" />
            {STATUS_LABELS[status]}
            <span className="board__col-count">{items.length}</span>
          </div>
          <div className="board__col-body">
            {items.map((task) => (
              <TaskCard key={task.id} task={task} onSelect={onSelect} />
            ))}
            {items.length === 0 && <div className="board__col-empty">No tasks</div>}
          </div>
        </div>
      ))}
    </div>
  )
}