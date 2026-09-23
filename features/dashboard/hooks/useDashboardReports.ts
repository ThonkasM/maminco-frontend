import { useState, useCallback, useEffect } from 'react'
import {
    getDailyReport,
    DailyReportDto,
} from '@/features/dashboard/api'

export interface DashboardData {
    dailyReport: DailyReportDto | null
}

export interface DashboardState {
    data: DashboardData
    loading: boolean
    error: string | null
}

export function useDashboardReports() {
    const [state, setState] = useState<DashboardState>({
        data: {
            dailyReport: null,
        },
        loading: false,
        error: null,
    })

    const fetchReports = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        try {
            const dailyReport = await getDailyReport(10)
            console.log('[useDashboardReports] Data fetched:', dailyReport)

            setState((prev) => ({
                ...prev,
                data: {
                    dailyReport,
                },
                loading: false,
            }))
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Error al cargar reportes'
            console.error('[useDashboardReports] Error:', errorMsg)
            setState((prev) => ({
                ...prev,
                loading: false,
                error: errorMsg,
            }))
        }
    }, [])

    // Auto-fetch on mount
    useEffect(() => {
        fetchReports()
    }, [fetchReports])

    const refresh = useCallback(() => {
        fetchReports()
    }, [fetchReports])

    return {
        state,
        fetchReports,
        refresh,
    }
}
