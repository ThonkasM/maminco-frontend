'use client'
import { useQuery } from '@tanstack/react-query'
import { getErrorMessage } from '@/lib/utils/errors'
import { getDailyReport, type DailyReportDto } from '../api'

export interface DashboardData {
    dailyReport: DailyReportDto | null
}

export interface DashboardState {
    data: DashboardData
    loading: boolean
    error: string | null
}

export function useDashboardReports() {
    const query = useQuery({
        queryKey: ['dashboard', 'daily-report'],
        queryFn: ({ signal }) => getDailyReport(10, signal),
    })

    const refetch = () => {
        void query.refetch()
    }

    return {
        state: {
            data: { dailyReport: query.data ?? null },
            loading: query.isLoading,
            error: query.error
                ? getErrorMessage(query.error, 'Error al cargar reportes')
                : null,
        } as DashboardState,
        fetchReports: refetch,
        refresh: refetch,
    }
}
