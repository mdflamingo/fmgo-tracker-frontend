import { useCallback, useEffect, useState } from 'react'
import { createTask, deleteTask, fetchTask, fetchTaskList, updateTask } from './api/tasks'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { TaskDetail } from './components/TaskDetail'
import type { TaskCreateRequest, TaskListResponse, TaskResponse, TaskUpdateRequest } from './types/task'
import './App.css'

type ModalState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'detail'; task: TaskResponse }
  | { kind: 'edit'; task: TaskResponse }

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Unknown error'
}

function App() {
  const [tasks, setTasks] = useState<TaskListResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>({ kind: 'none' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    try {
      setTasks(await fetchTaskList())
      setListError(null)
    } catch (err) {
      setListError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- async load on mount
    void loadTasks()
  }, [loadTasks])

  const openCreate = () => {
    setFormError(null)
    setModal({ kind: 'create' })
  }

  const openDetail = async (id: string) => {
    try {
      const task = await fetchTask(id)
      setModal({ kind: 'detail', task })
    } catch (err) {
      setListError(getErrorMessage(err))
    }
  }

  const openEdit = () => {
    if (modal.kind !== 'detail' && modal.kind !== 'edit') return
    setFormError(null)
    setModal({ kind: 'edit', task: modal.task })
  }

  const handleSubmit = async (data: TaskCreateRequest | TaskUpdateRequest) => {
    setSubmitting(true)
    setFormError(null)
    try {
      if (modal.kind === 'edit') {
        await updateTask(modal.task.id, data as TaskUpdateRequest)
      } else {
        await createTask(data as TaskCreateRequest)
      }
      await loadTasks()
      setModal({ kind: 'none' })
    } catch (err) {
      setFormError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    const task = modal.kind === 'detail' ? modal.task : null
    if (!task) return
    if (!window.confirm(`Delete task "${task.name}"?`)) return

    try {
      await deleteTask(task.id)
      await loadTasks()
      setModal({ kind: 'none' })
    } catch (err) {
      setFormError(getErrorMessage(err))
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Task Tracker</h1>
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          + New task
        </button>
      </header>

      {listError && (
        <div className="banner banner--error">
          {listError} — is the backend running on :8080?
        </div>
      )}
      {!listError && !loading && tasks.length === 0 && (
        <div className="banner">No tasks yet. Create your first task.</div>
      )}

      {loading ? (
        <div className="app__loading">Loading tasks…</div>
      ) : (
        <TaskList tasks={tasks} onSelect={openDetail} />
      )}

      {modal.kind !== 'none' && (
        <div className="modal-overlay" onClick={() => setModal({ kind: 'none' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal__close"
              onClick={() => setModal({ kind: 'none' })}
              aria-label="Close"
            >
              ×
            </button>

            {modal.kind === 'create' && (
              <>
                <h2 className="modal__title">New task</h2>
                <TaskForm
                  submitting={submitting}
                  error={formError}
                  onSubmit={handleSubmit}
                  onCancel={() => setModal({ kind: 'none' })}
                />
              </>
            )}

            {modal.kind === 'edit' && (
              <>
                <h2 className="modal__title">Edit task</h2>
                <TaskForm
                  initial={modal.task}
                  submitting={submitting}
                  error={formError}
                  onSubmit={handleSubmit}
                  onCancel={() => setModal({ kind: 'detail', task: modal.task })}
                />
              </>
            )}

            {modal.kind === 'detail' && (
              <TaskDetail
                task={modal.task}
                onEdit={openEdit}
                onDelete={handleDelete}
                onClose={() => setModal({ kind: 'none' })}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App