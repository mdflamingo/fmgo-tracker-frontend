import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  isoToLocalInput,
  localInputToIso,
} from '../lib/utils'
import type { Project } from '../types/project'
import type {
  TaskCreateRequest,
  TaskPriority,
  TaskResponse,
  TaskStatus,
  TaskUpdateRequest,
} from '../types/task'
import type { User } from '../types/user'

interface TaskFormProps {
  users: User[]
  projects: Project[]
  initial?: TaskResponse | null
  submitting: boolean
  error?: string | null
  onSubmit: (data: TaskCreateRequest | TaskUpdateRequest) => void
  onCancel: () => void
}

type FieldName = 'name' | 'projectId' | 'assignedIds' | 'reviewerIds'

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
}

export function TaskForm({
  users,
  projects,
  initial,
  submitting,
  error,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'backlog')
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'medium')
  const [projectId, setProjectId] = useState(initial?.project.id ?? '')
  const [assignedIds, setAssignedIds] = useState<string[]>(
    initial?.assignees.map((u) => u.id) ?? [],
  )
  const [reviewerIds, setReviewerIds] = useState<string[]>(
    initial?.reviewers.map((u) => u.id) ?? [],
  )
  const [deadline, setDeadline] = useState(
    initial?.deadline ? isoToLocalInput(initial.deadline) : '',
  )
  const [markedDone, setMarkedDone] = useState(
    initial?.status === 'done' || Boolean(initial?.completed),
  )
  const [validationErrors, setValidationErrors] = useState<Partial<Record<FieldName, string>>>({})

  const isEdit = Boolean(initial)

  const validate = (): boolean => {
    const errors: Partial<Record<FieldName, string>> = {}
    if (!name.trim()) errors.name = 'Name is required'
    if (!projectId) errors.projectId = 'Project is required'
    if (assignedIds.length === 0) errors.assignedIds = 'At least one assignee is required'
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const base = {
      name: name.trim(),
      description: description.trim(),
      status,
      priority,
      project_id: projectId,
      deadline: deadline ? localInputToIso(deadline) : null,
      assigned_ids: assignedIds,
      reviewer_ids: reviewerIds,
    }

    if (isEdit && initial) {
      const payload: TaskUpdateRequest = {
        ...base,
        completed_at: markedDone ? new Date().toISOString() : null,
      }
      onSubmit(payload)
      return
    }

    const payload: TaskCreateRequest = { ...base }
    onSubmit(payload)
  }

  const fieldError = (field: FieldName) =>
    validationErrors[field] ? <span className="field-error">{validationErrors[field]}</span> : null

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form__row">
        <label className="field">
          <span className="field__label">Name</span>
          <input
            className="field__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Update user table"
          />
          {fieldError('name')}
        </label>

        <label className="field">
          <span className="field__label">Status</span>
          <select
            className="field__input"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Priority</span>
          <select
            className="field__input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span className="field__label">Description</span>
        <textarea
          className="field__input"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Some description"
        />
      </label>

      <div className="form__row">
        <label className="field">
          <span className="field__label">Project</span>
          {projects.length === 0 ? (
            <span className="field__hint">No projects yet. Create a project first.</span>
          ) : (
            <select
              className="field__input"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="" disabled>
                Select project…
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
          {fieldError('projectId')}
        </label>

        <label className="field">
          <span className="field__label">Deadline</span>
          <input
            className="field__input"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>
      </div>

      <div className="form__row">
        <div className="field">
          <span className="field__label">Assignees</span>
          {users.length === 0 ? (
            <span className="field__hint">No users available.</span>
          ) : (
            <div className="user-picker">
              {users.map((user) => (
                <label key={user.id} className="user-picker__option">
                  <input
                    type="checkbox"
                    checked={assignedIds.includes(user.id)}
                    onChange={() => setAssignedIds((ids) => toggleId(ids, user.id))}
                  />
                  <span className="user-picker__name">{user.username}</span>
                  <span className="detail__muted">{user.email}</span>
                </label>
              ))}
            </div>
          )}
          {fieldError('assignedIds')}
        </div>

        <div className="field">
          <span className="field__label">Reviewers</span>
          {users.length === 0 ? (
            <span className="field__hint">No users available.</span>
          ) : (
            <div className="user-picker">
              {users.map((user) => (
                <label key={user.id} className="user-picker__option">
                  <input
                    type="checkbox"
                    checked={reviewerIds.includes(user.id)}
                    onChange={() => setReviewerIds((ids) => toggleId(ids, user.id))}
                  />
                  <span className="user-picker__name">{user.username}</span>
                  <span className="detail__muted">{user.email}</span>
                </label>
              ))}
            </div>
          )}
          {fieldError('reviewerIds')}
        </div>
      </div>

      {isEdit && (
        <label className="field field--checkbox">
          <input
            type="checkbox"
            checked={markedDone}
            onChange={(e) => setMarkedDone(e.target.checked)}
          />
          <span>Mark as completed</span>
        </label>
      )}

      {error && <div className="form-error">{error}</div>}

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  )
}