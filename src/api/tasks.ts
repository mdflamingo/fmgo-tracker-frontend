import { request } from './client'
import type {
  TaskCreateRequest,
  TaskCreateResponse,
  TaskListFilter,
  TaskListResponse,
  TaskResponse,
  TaskUpdateRequest,
} from '../types/task'
import type { Project } from '../types/project'
import type { User } from '../types/user'

interface UserDBRaw {
  Id: string
  Username: string
  Email: string
}

interface ProjectDBRaw {
  Id: string
  Name: string
}

interface TaskResponseRaw {
  id: string
  name: string
  description: string
  status: TaskResponse['status']
  priority: TaskResponse['priority']
  project: ProjectDBRaw
  creator: UserDBRaw
  assignees: UserDBRaw[]
  reviewers: UserDBRaw[]
  deadline: string | null
  completed: string | null
}

function normalizeUser(raw: UserDBRaw): User {
  return { id: raw.Id, username: raw.Username, email: raw.Email }
}

function normalizeProject(raw: ProjectDBRaw): Project {
  return { id: raw.Id, name: raw.Name }
}

function normalizeTask(raw: TaskResponseRaw): TaskResponse {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    status: raw.status,
    priority: raw.priority,
    project: normalizeProject(raw.project),
    creator: normalizeUser(raw.creator),
    assignees: raw.assignees.map(normalizeUser),
    reviewers: raw.reviewers.map(normalizeUser),
    deadline: raw.deadline,
    completed: raw.completed,
  }
}

export function fetchTaskList(filter: TaskListFilter = {}): Promise<TaskListResponse[]> {
  const params = new URLSearchParams()
  const set = (key: string, value: string | number | null | undefined) => {
    if (value === undefined || value === null || value === '') return
    params.set(key, String(value))
  }

  set('name', filter.name)
  set('status', filter.status)
  set('priority', filter.priority)
  set('project_id', filter.project_id)
  set('creator_id', filter.creator_id)
  if (filter.assigned_ids?.length) params.set('assigned_ids', filter.assigned_ids.join(','))
  if (filter.reviewer_ids?.length) params.set('reviewer_ids', filter.reviewer_ids.join(','))
  set('limit', filter.limit)
  set('offset', filter.offset)

  const qs = params.toString()
  return request<TaskListResponse[]>(`/task/list${qs ? `?${qs}` : ''}`)
}

export function fetchTask(id: string): Promise<TaskResponse> {
  return request<TaskResponseRaw>(`/task/${id}`).then(normalizeTask)
}

export function createTask(data: TaskCreateRequest): Promise<TaskCreateResponse> {
  return request<TaskCreateResponse>('/task', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateTask(id: string, data: TaskUpdateRequest): Promise<void> {
  return request<void>(`/task/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteTask(id: string): Promise<void> {
  return request<void>(`/task/${id}`, {
    method: 'DELETE',
  })
}