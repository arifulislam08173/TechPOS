export type Category = {
  id: number
  name: string
  isActive: boolean
  createdAt: string
}

export type CategoryQuery = {
  page: number
  pageSize: number
  search?: string
  isActive?: boolean
}
