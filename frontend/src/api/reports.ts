import { api } from './client'
import type { DashboardSummary, ReportOverview } from '../types/report'

export const reportsApi = {
  dashboard: async () => {
    const { data } = await api.get<DashboardSummary>('/reports/dashboard')
    return data
  },
  overview: async (fromDate?: string, toDate?: string) => {
    const { data } = await api.get<ReportOverview>('/reports/overview', {
      params: { fromDate: fromDate || undefined, toDate: toDate || undefined },
    })
    return data
  },
}
