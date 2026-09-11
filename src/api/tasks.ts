import { request } from './client'
import type {
  TaskCreateRequest,
  TaskCreateResponse,
  TaskListResponse,
  TaskResponse,
  TaskUpdateRequest,
} from '../types/task'

export function fetchTaskList(): Promise<TaskListResponse[]> {
  return request<TaskListResponse[]>('/task/list')
}

export function fetchTask(id: string): Promise<TaskResponse> {
  return request<TaskResponse>(`/task/${id}`)
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