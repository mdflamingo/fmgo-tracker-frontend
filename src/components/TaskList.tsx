import { useState } from 'react'
import { STATUS_LABELS, STATUS_ORDER } from '../lib/utils'
import type { TaskListResponse, TaskStatus } from '../types/task'
import { PriorityBadge } from './Badges'

interface TaskListProps {
  tasks: TaskListResponse[]
  onSelect: (id: string) => void
  onMoveTask: (id: string, status: TaskStatus) => void
}

function TaskCard({
  task,
  onSelect,
  onDragStart,
  onDragEnd,
}: {
  task: TaskListResponse
  onSelect: (id: string) => void
  onDragStart: (id: string) => void
  onDragEnd: () => void
}) {
  return (
    <button
      type="button"
      draggable
      className={
        task.priority === 'critical' ? 'task-card task-card--critical' : 'task-card'
      }
      onClick={() => onSelect(task.id)}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(task.id)
      }}
      onDragEnd={onDragEnd}
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

export function TaskList({ tasks, onSelect, onMoveTask }: TaskListProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null)

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: tasks.filter((t) => t.status === status),
  }))

  const drop = (status: TaskStatus) => {
    if (draggedId) onMoveTask(draggedId, status)
    setDraggedId(null)
    setDragOver(null)
  }

  const clearDrag = () => {
    setDraggedId(null)
    setDragOver(null)
  }

  return (
    <div className="board">
      {grouped.map(({ status, items }) => (
        <div
          key={status}
          className={`board__col board__col--${status}${dragOver === status ? ' board__col--drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            setDragOver(status)
          }}
          onDragEnter={(e) => {
            e.preventDefault()
            setDragOver(status)
          }}
          onDragLeave={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node | null)) return
            setDragOver((s) => (s === status ? null : s))
          }}
          onDrop={(e) => {
            e.preventDefault()
            drop(status)
          }}
        >
          <div className="board__col-header">
            <span className="board__col-dot" />
            {STATUS_LABELS[status]}
            <span className="board__col-count">{items.length}</span>
          </div>
          <div className="board__col-body">
            {items.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onSelect={onSelect}
                onDragStart={setDraggedId}
                onDragEnd={clearDrag}
              />
            ))}
            {items.length === 0 && <div className="board__col-empty">No tasks</div>}
          </div>
        </div>
      ))}
    </div>
  )
}