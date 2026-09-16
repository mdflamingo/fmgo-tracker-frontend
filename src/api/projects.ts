import { request } from './client'
import type {
  Project,
  ProjectCreateRequest,
  ProjectCreateResponse,
} from '../types/project'

interface ProjectListRaw {
  Id: string
  Name: string
}

function normalizeProject(raw: ProjectListRaw): Project {
  return { id: raw.Id, name: raw.Name }
}

export function fetchProjectList(): Promise<Project[]> {
  return request<ProjectListRaw[]>('/project/list').then((projects) =>
    projects.map(normalizeProject),
  )
}

export function createProject(data: ProjectCreateRequest): Promise<ProjectCreateResponse> {
  return request<ProjectCreateResponse>('/project', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}