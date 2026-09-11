export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface ProjectDB {
  id: string
  name: string
}

export interface UserDB {
  id: string
  username: string
  email: string
}

export interface TaskListResponse {
  id: string
  name: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  project_name: string
}

export interface TaskResponse {
  id: string
  name: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  project: ProjectDB
  creator: UserDB
  assignees: UserDB[]
  reviewers: UserDB[]
  deadline: string | null
  completed: string | null
}

export interface TaskCreateRequest {
  name: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  project_id: string
  assigned_id: string
  reviewer_id: string
  deadline: string
}

export interface TaskUpdateRequest {
  name: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  project_id: string
  creator_id: string
  deadline: string | null
  completed_at: string | null
  assigned_ids: string[] | null
  reviewer_ids: string[] | null
}

export interface TaskCreateResponse {
  id: string
}