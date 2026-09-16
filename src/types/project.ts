export interface Project {
  id: string
  name: string
}

export interface ProjectCreateRequest {
  name: string
  member_ids: string[]
  viewer_ids: string[]
}

export interface ProjectCreateResponse {
  id: string
}