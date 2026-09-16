import { useCallback, useEffect, useState } from 'react'
import { fetchProjectList, createProject } from './api/projects'
import { createTask, deleteTask, fetchTask, fetchTaskList, updateTask } from './api/tasks'
import { fetchUserList } from './api/users'
import { ProjectForm } from './components/ProjectForm'
import { ProjectSidebar } from './components/ProjectSidebar'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { TaskDetail } from './components/TaskDetail'
import type { Project, ProjectCreateRequest } from './types/project'
import type { TaskCreateRequest, TaskListResponse, TaskResponse, TaskUpdateRequest } from './types/task'
import type { User } from './types/user'
import logoMain from './assets/logo-flamingo-1.png'
import logoAlt from './assets/logo-flamingo-2.png'
import './App.css'

type ModalState =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'project' }
  | { kind: 'detail'; task: TaskResponse }
  | { kind: 'edit'; task: TaskResponse }

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Unknown error'
}

function App() {
  const [tasks, setTasks] = useState<TaskListResponse[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
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

  const loadReferenceData = useCallback(async () => {
    try {
      const [userList, projectList] = await Promise.all([fetchUserList(), fetchProjectList()])
      setUsers(userList)
      setProjects(projectList)
    } catch (err) {
      setListError(getErrorMessage(err))
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- async load on mount
    void loadTasks()
    void loadReferenceData()
  }, [loadTasks, loadReferenceData])

  const openCreate = () => {
    setFormError(null)
    setModal({ kind: 'create' })
  }

  const openCreateProject = () => {
    setFormError(null)
    setModal({ kind: 'project' })
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

  const handleCreateProject = async (data: ProjectCreateRequest) => {
    setSubmitting(true)
    setFormError(null)
    try {
      await createProject(data)
      await loadReferenceData()
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
        <div className="app__brand">
          <img className="app__logo" src={logoMain} alt="Flamingo Tracker" />
          <h1 className="app__title">Flamingo Tracker</h1>
        </div>
        <div className="app__actions">
          <button type="button" className="btn btn--ghost" onClick={openCreateProject}>
            + New project
          </button>
          <button type="button" className="btn btn--primary" onClick={openCreate}>
            + New task
          </button>
        </div>
      </header>

      {listError && (
        <div className="banner banner--error">
          {listError} — is the backend running on :8080?
        </div>
      )}
      {!listError && !loading && tasks.length === 0 && (
        <div className="banner">No tasks yet. Create your first task.</div>
      )}

      <div className="app__main">
        <ProjectSidebar
          projects={projects}
          tasks={tasks}
          activeProjectId={activeProjectId}
          onSelect={setActiveProjectId}
        />

        {loading ? (
          <div className="app__loading">
            <img className="app__loading-logo" src={logoAlt} alt="Flamingo Tracker" />
            <div>Loading tasks…</div>
          </div>
        ) : (
          <TaskList
            tasks={
              activeProjectId === null
                ? tasks
                : tasks.filter((task) => task.project_id === activeProjectId)
            }
            onSelect={openDetail}
          />
        )}
      </div>

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
                  users={users}
                  projects={projects}
                  submitting={submitting}
                  error={formError}
                  onSubmit={handleSubmit}
                  onCancel={() => setModal({ kind: 'none' })}
                />
              </>
            )}

            {modal.kind === 'project' && (
              <>
                <h2 className="modal__title">New project</h2>
                <ProjectForm
                  users={users}
                  submitting={submitting}
                  error={formError}
                  onSubmit={handleCreateProject}
                  onCancel={() => setModal({ kind: 'none' })}
                />
              </>
            )}

            {modal.kind === 'edit' && (
              <>
                <h2 className="modal__title">Edit task</h2>
                <TaskForm
                  users={users}
                  projects={projects}
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