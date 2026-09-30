export type Permission = {
  id: number
  code: string
  name: string
  module: string
  description: string | null
}

export type Role = {
  id: number
  name: string
  description: string | null
  isSystem: boolean
  isActive: boolean
  userCount: number
  permissionCodes: string[]
  createdAt: string
}

export type RoleLookup = {
  id: number
  name: string
}
