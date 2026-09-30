import { api } from './client'
import type { PagedResult } from '../types/api'
import type { Permission, Role, RoleLookup } from '../types/role'

export const rolesApi = {
  list: async () => (await api.get<Role[]>('/roles')).data,

  lookup: async (query: { page: number; pageSize: number; search?: string }) =>
    (await api.get<PagedResult<RoleLookup>>('/roles/lookup', { params: query })).data,

  permissions: async () => (await api.get<Permission[]>('/roles/permissions')).data,

  get: async (id: number) => (await api.get<Role>(`/roles/${id}`)).data,

  create: async (body: { name: string; description?: string; permissionCodes: string[] }) =>
    (await api.post<Role>('/roles', body)).data,

  update: async (id: number, body: { description?: string; isActive: boolean; permissionCodes: string[] }) =>
    (await api.put<Role>(`/roles/${id}`, body)).data,
}
