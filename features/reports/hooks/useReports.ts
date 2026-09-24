'use client'
import { useQuery } from '@tanstack/react-query'
import {
    getReportBreakdown,
    getReportSummary,
    getReportTimeSeries,
    getReportTopProducts,
    type BreakdownDimension,
    type ReportRangeParams,
} from '../api'

export function useReportSummary(range: ReportRangeParams) {
    return useQuery({
        queryKey: ['reports', 'summary', range],
        queryFn: ({ signal }) => getReportSummary(range, signal),
    })
}

export function useReportTimeSeries(
    range: ReportRangeParams,
    groupBy: 'day' | 'week' | 'month',
) {
    return useQuery({
        queryKey: ['reports', 'timeseries', range, groupBy],
        queryFn: ({ signal }) =>
            getReportTimeSeries({ ...range, groupBy }, signal),
    })
}

export function useReportBreakdown(
    range: ReportRangeParams,
    by: BreakdownDimension,
    limit = 20,
) {
    return useQuery({
        queryKey: ['reports', 'breakdown', range, by, limit],
        queryFn: ({ signal }) =>
            getReportBreakdown({ ...range, by, limit }, signal),
    })
}

export function useReportTopProducts(
    range: ReportRangeParams,
    limit = 10,
) {
    return useQuery({
        queryKey: ['reports', 'top-products', range, limit],
        queryFn: ({ signal }) =>
            getReportTopProducts({ ...range, limit }, signal),
    })
}
