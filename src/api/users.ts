import { request } from './client'
import type { User } from '../types/user'

interface UserListRaw {
  Id: string
  Username: string
  Email: string
}

function normalizeUser(raw: UserListRaw): User {
  return { id: raw.Id, username: raw.Username, email: raw.Email }
}

export function fetchUserList(): Promise<User[]> {
  return request<UserListRaw[]>('/user/list').then((users) => users.map(normalizeUser))
}