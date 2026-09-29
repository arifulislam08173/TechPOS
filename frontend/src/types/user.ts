export type User = {
  id: number
  fullName: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type UserQuery = {
  page: number
  pageSize: number
  search?: string
  role?: string
  isActive?: boolean
}

export type UserInput = {
  fullName: string
  email: string
  role: string
  password?: string
  isActive?: boolean
}
