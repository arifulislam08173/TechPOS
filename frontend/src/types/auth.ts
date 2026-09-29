export type CurrentUser = {
  id: number
  fullName: string
  email: string
  role: string
  permissions: string[]
}

export type LoginResponse = {
  accessToken: string
  expiresAt: string
  user: CurrentUser
}
