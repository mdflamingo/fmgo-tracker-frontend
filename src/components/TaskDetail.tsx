import { formatDate } from '../lib/utils'
import type { TaskResponse } from '../types/task'
import { PriorityBadge, StatusBadge } from './Badges'

interface TaskDetailProps {
  task: TaskResponse
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

function UserList({ users, empty }: { users: { id: string; username: string; email: string }[]; empty: string }) {
  if (users.length === 0) return <span className="detail__muted">{empty}</span>
  return (
    <ul className="user-list">
      {users.map((user) => (
        <li key={user.id}>
          <span className="user-list__name">{user.username}</span>
        </li>
      ))}
    </ul>
  )
}

export function TaskDetail({ task, onEdit, onDelete, onClose }: TaskDetailProps) {
  return (
    <div className="task-detail">
      <div className="task-detail__top">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        <span className="task-detail__project">{task.project.name}</span>
      </div>

      <h2 className="task-detail__name">{task.name}</h2>
      <p className="task-detail__desc">{task.description || 'No description'}</p>

      <div className="task-detail__grid">
        <div className="detail-block">
          <div className="detail-block__title">Project</div>
          <div className="detail-block__value">{task.project.name}</div>
        </div>

        <div className="detail-block">
          <div className="detail-block__title">Created by</div>
          <UserList users={task.creator ? [task.creator] : []} empty="—" />
        </div>

        <div className="detail-block">
          <div className="detail-block__title">Assignees</div>
          <UserList users={task.assignees} empty="No assignees" />
        </div>

        <div className="detail-block">
          <div className="detail-block__title">Reviewers</div>
          <UserList users={task.reviewers} empty="No reviewers" />
        </div>

        <div className="detail-block">
          <div className="detail-block__title">Deadline</div>
          <div className="detail-block__value">{formatDate(task.deadline)}</div>
        </div>

        <div className="detail-block">
          <div className="detail-block__title">Completed</div>
          <div className="detail-block__value">{formatDate(task.completed)}</div>
        </div>
      </div>

      <div className="task-detail__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Close
        </button>
        <button type="button" className="btn btn--primary" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="btn btn--danger" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  )
}