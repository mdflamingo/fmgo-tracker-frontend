import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ProjectCreateRequest } from '../types/project'
import type { User } from '../types/user'

interface ProjectFormProps {
  users: User[]
  submitting: boolean
  error?: string | null
  onSubmit: (data: ProjectCreateRequest) => void
  onCancel: () => void
}

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
}

export function ProjectForm({ users, submitting, error, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState('')
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [viewerIds, setViewerIds] = useState<string[]>([])
  const [nameError, setNameError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('Project name is required')
      return
    }
    setNameError(null)

    const payload: ProjectCreateRequest = {
      name: name.trim(),
      member_ids: memberIds,
      viewer_ids: viewerIds,
    }
    onSubmit(payload)
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label className="field">
        <span className="field__label">Name</span>
        <input
          className="field__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mobile app"
        />
        {nameError && <span className="field-error">{nameError}</span>}
      </label>

      <div className="form__row">
        <div className="field">
          <span className="field__label">Members</span>
          {users.length === 0 ? (
            <span className="field__hint">No users available.</span>
          ) : (
            <div className="user-picker">
              {users.map((user) => (
                <label key={user.id} className="user-picker__option">
                  <input
                    type="checkbox"
                    checked={memberIds.includes(user.id)}
                    onChange={() => setMemberIds((ids) => toggleId(ids, user.id))}
                  />
                  <span className="user-picker__name">{user.username}</span>
                  <span className="detail__muted">{user.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <span className="field__label">Viewers</span>
          {users.length === 0 ? (
            <span className="field__hint">No users available.</span>
          ) : (
            <div className="user-picker">
              {users.map((user) => (
                <label key={user.id} className="user-picker__option">
                  <input
                    type="checkbox"
                    checked={viewerIds.includes(user.id)}
                    onChange={() => setViewerIds((ids) => toggleId(ids, user.id))}
                  />
                  <span className="user-picker__name">{user.username}</span>
                  <span className="detail__muted">{user.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create project'}
        </button>
      </div>
    </form>
  )
}