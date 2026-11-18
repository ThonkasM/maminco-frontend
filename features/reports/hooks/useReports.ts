'use client'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
    getReportBreakdown,
    getReportComparison,
    getReportHeatmap,
    getReportSummary,
    getReportTimeSeries,
    getReportTopProducts,
    type BreakdownDimension,
    type ReportRangeParams,
} from '../api'

export function useReportComparison(range: ReportRangeParams) {
    return useQuery({
        placeholderData: keepPreviousData,
        queryKey: ['reports', 'comparison', range],
        queryFn: ({ signal }) => getReportComparison(range, signal),
    })
}

export function useReportHeatmap(range: ReportRangeParams) {
    return useQuery({
        placeholderData: keepPreviousData,
        queryKey: ['reports', 'heatmap', range],
        queryFn: ({ signal }) => getReportHeatmap(range, signal),
    })
}

export function useReportSummary(range: ReportRangeParams) {
    return useQuery({
        placeholderData: keepPreviousData,
        queryKey: ['reports', 'summary', range],
        queryFn: ({ signal }) => getReportSummary(range, signal),
    })
}

export function useReportTimeSeries(
    range: ReportRangeParams,
    groupBy: 'day' | 'week' | 'month',
    enabled = true,
) {
    return useQuery({
        placeholderData: keepPreviousData,
        enabled,
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
        placeholderData: keepPreviousData,
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
        placeholderData: keepPreviousData,
        queryKey: ['reports', 'top-products', range, limit],
        queryFn: ({ signal }) =>
            getReportTopProducts({ ...range, limit }, signal),
    })
}
