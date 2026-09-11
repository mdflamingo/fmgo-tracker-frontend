import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  isValidUUID,
  isoToLocalInput,
  localInputToIso,
} from '../lib/utils'
import type {
  TaskCreateRequest,
  TaskPriority,
  TaskResponse,
  TaskStatus,
  TaskUpdateRequest,
} from '../types/task'

interface TaskFormProps {
  initial?: TaskResponse | null
  submitting: boolean
  error?: string | null
  onSubmit: (data: TaskCreateRequest | TaskUpdateRequest) => void
  onCancel: () => void
}

type FieldName =
  | 'name'
  | 'projectId'
  | 'assignedId'
  | 'reviewerId'
  | 'deadline'

export function TaskForm({ initial, submitting, error, onSubmit, onCancel }: TaskFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'backlog')
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'medium')
  const [projectId, setProjectId] = useState(initial?.project.id ?? '')
  const [assignedId, setAssignedId] = useState(initial?.assignees[0]?.id ?? '')
  const [reviewerId, setReviewerId] = useState(initial?.reviewers[0]?.id ?? '')
  const [deadline, setDeadline] = useState(
    initial?.deadline ? isoToLocalInput(initial.deadline) : '',
  )
  const [markedDone, setMarkedDone] = useState(
    initial?.status === 'done' || Boolean(initial?.completed),
  )
  const [validationErrors, setValidationErrors] = useState<Partial<Record<FieldName, string>>>({})

  const isEdit = Boolean(initial)

  const storeId = (fieldValue: string) => {
    // keep existing ids so update does not drop other assignees/reviewers
    const existing = initial ? initial.assignees.map((u) => u.id) : []
    const ids = new Set(existing)
    if (fieldValue.trim()) ids.add(fieldValue.trim())
    return [...ids]
  }

  const validate = (): boolean => {
    const errors: Partial<Record<FieldName, string>> = {}
    if (!name.trim()) errors.name = 'Name is required'
    if (!isValidUUID(projectId)) errors.projectId = 'Valid project UUID is required'
    if (!isValidUUID(assignedId)) errors.assignedId = 'Valid assignee UUID is required'
    if (!isValidUUID(reviewerId)) errors.reviewerId = 'Valid reviewer UUID is required'
    if (!deadline) errors.deadline = 'Deadline is required'
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (isEdit && initial) {
      const payload: TaskUpdateRequest = {
        name: name.trim(),
        description: description.trim(),
        status,
        priority,
        project_id: projectId.trim(),
        creator_id: initial.creator.id,
        deadline: localInputToIso(deadline),
        completed_at: markedDone ? new Date().toISOString() : null,
        assigned_ids: storeId(assignedId),
        reviewer_ids: storeId(reviewerId),
      }
      onSubmit(payload)
      return
    }

    const payload: TaskCreateRequest = {
      name: name.trim(),
      description: description.trim(),
      status,
      priority,
      project_id: projectId.trim(),
      assigned_id: assignedId.trim(),
      reviewer_id: reviewerId.trim(),
      deadline: localInputToIso(deadline),
    }
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
          <span className="field__label">Project ID</span>
          <input
            className="field__input"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="60601fee-2bf1-4721-ae6f-7636e79a0cba"
          />
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
          {fieldError('deadline')}
        </label>
      </div>

      <div className="form__row">
        <label className="field">
          <span className="field__label">Assignee ID</span>
          <input
            className="field__input"
            value={assignedId}
            onChange={(e) => setAssignedId(e.target.value)}
            placeholder="60601fee-2bf1-4721-ae6f-7636e79a0cba"
          />
          {fieldError('assignedId')}
        </label>

        <label className="field">
          <span className="field__label">Reviewer ID</span>
          <input
            className="field__input"
            value={reviewerId}
            onChange={(e) => setReviewerId(e.target.value)}
            placeholder="60601fee-2bf1-4721-ae6f-7636e79a0cba"
          />
          {fieldError('reviewerId')}
        </label>
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