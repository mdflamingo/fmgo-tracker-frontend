import type { Project } from './project'
import type { User } from './user'

export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface TaskListResponse {
  id: string
  name: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  project_id: string
  project_name: string
}

export interface TaskResponse {
  id: string
  name: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  project: Project
  creator: User
  assignees: User[]
  reviewers: User[]
  deadline: string | null
  completed: string | null
}

export interface TaskCreateRequest {
  name: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  project_id: string
  deadline: string | null
  assigned_ids: string[]
  reviewer_ids: string[]
}

export interface TaskUpdateRequest {
  name: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  project_id: string
  deadline: string | null
  completed_at: string | null
  assigned_ids: string[]
  reviewer_ids: string[]
}

export interface TaskCreateResponse {
  id: string
}