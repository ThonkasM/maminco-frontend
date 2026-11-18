'use client'
import { useSyncExternalStore } from 'react'
import { queryClientRef } from './queryClientRef'
import { uploadFileWithProgress } from './api'

export type UploadStatus = 'queued' | 'uploading' | 'done' | 'error' | 'canceled'

export interface UploadItem {
    id: number
    name: string
    size: number
    parentId: string | null
    status: UploadStatus
    progress: number
    error?: string
    file: File
}

let items: UploadItem[] = []
let counter = 0
let running = false
const controllers = new Map<number, AbortController>()
const listeners = new Set<() => void>()

const emit = () => {
    items = [...items]
    listeners.forEach((listener) => listener())
}
const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}
const getSnapshot = () => items
const EMPTY: UploadItem[] = []

function patch(id: number, changes: Partial<UploadItem>) {
    const item = items.find((entry) => entry.id === id)
    if (!item) return
    Object.assign(item, changes)
    emit()
}

/** Files go one at a time so progress, cancel and retry are per file and the server is never flooded. */
async function pump() {
    if (running) return
    running = true
    try {
        for (;;) {
            const next = items.find((item) => item.status === 'queued')
            if (!next) break
            const controller = new AbortController()
            controllers.set(next.id, controller)
            patch(next.id, { status: 'uploading', progress: 0, error: undefined })
            try {
                await uploadFileWithProgress(next.parentId, next.file, (progress) => patch(next.id, { progress }), controller.signal)
                patch(next.id, { status: 'done', progress: 1 })
                void queryClientRef.current?.invalidateQueries({ queryKey: ['repository'] })
            } catch (error) {
                if (controller.signal.aborted) patch(next.id, { status: 'canceled' })
                else patch(next.id, { status: 'error', error: error instanceof Error ? error.message : 'No se pudo subir' })
            } finally {
                controllers.delete(next.id)
            }
        }
    } finally {
        running = false
    }
}

export const uploadQueue = {
    add(files: File[], parentId: string | null) {
        for (const file of files) {
            items.push({ id: ++counter, name: file.name, size: file.size, parentId, status: 'queued', progress: 0, file })
        }
        emit()
        void pump()
    },
    cancel(id: number) {
        const item = items.find((entry) => entry.id === id)
        if (!item) return
        if (item.status === 'uploading') controllers.get(id)?.abort()
        else if (item.status === 'queued') patch(id, { status: 'canceled' })
    },
    cancelAll() {
        items.filter((item) => item.status === 'queued' || item.status === 'uploading').forEach((item) => this.cancel(item.id))
    },
    retry(id: number) {
        const item = items.find((entry) => entry.id === id)
        if (!item || (item.status !== 'error' && item.status !== 'canceled')) return
        patch(id, { status: 'queued', progress: 0, error: undefined })
        void pump()
    },
    clearFinished() {
        items = items.filter((item) => item.status === 'queued' || item.status === 'uploading')
        emit()
    },
}

export function useUploadQueue() {
    return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY)
}
