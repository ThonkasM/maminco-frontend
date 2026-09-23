'use client'
import React, { useMemo } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { TopProductDto } from '@/features/dashboard/api'

interface TopProductsBarChartProps {
    data: TopProductDto[]
    loading?: boolean
}

export function TopProductsBarChart({ data, loading = false }: TopProductsBarChartProps) {
    const chartData = useMemo(() => {
        return data.slice(0, 10).map((product) => ({
            name: product.productName,
            revenue: Number(product.totalRevenue),
            quantity: product.quantitySold,
        }))
    }, [data])

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">📊 Top Products por Ingresos</h3>
                <div className="h-80 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">📊 Top Products por Ingresos</h3>

            {chartData.length === 0 ? (
                <div className="h-80 flex items-center justify-center">
                    <p className="text-slate-500 dark:text-slate-400">No hay datos disponibles</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={380}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                            }}
                            formatter={(value: number) => `Bs. ${value.toLocaleString()}`}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#3b82f6" name="Ingresos (Bs.)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
