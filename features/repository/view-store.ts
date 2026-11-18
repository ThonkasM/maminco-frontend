'use client'
import { useSyncExternalStore } from 'react'
import { SORT_KEYS, VIEW_MODES, type SortDirection, type SortKey, type ViewMode } from './lib'

const KEY = 'maminco-repository-view'

interface ViewState {
    mode: ViewMode
    sortKey: SortKey
    sortDirection: SortDirection
}

const DEFAULT: ViewState = { mode: 'list', sortKey: 'name', sortDirection: 'asc' }

function load(): ViewState {
    try {
        const raw = window.localStorage.getItem(KEY)
        if (!raw) return DEFAULT
        const saved = JSON.parse(raw) as Partial<ViewState>
        return {
            mode: VIEW_MODES.includes(saved.mode as ViewMode) ? (saved.mode as ViewMode) : DEFAULT.mode,
            sortKey: SORT_KEYS.includes(saved.sortKey as SortKey) ? (saved.sortKey as SortKey) : DEFAULT.sortKey,
            sortDirection: saved.sortDirection === 'desc' ? 'desc' : 'asc',
        }
    } catch {
        return DEFAULT
    }
}

let state: ViewState = DEFAULT
let loaded = false
const listeners = new Set<() => void>()

function ensureLoaded() {
    if (loaded || typeof window === 'undefined') return
    loaded = true
    state = load()
}

function update(patch: Partial<ViewState>) {
    state = { ...state, ...patch }
    try {
        window.localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
        // storage unavailable: the choice still holds for this session
    }
    listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
    ensureLoaded()
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

const getSnapshot = () => {
    ensureLoaded()
    return state
}
const getServerSnapshot = () => DEFAULT

/** View mode and sort order, remembered per browser and shared by every component that uses them. */
export function useRepositoryView() {
    const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
    return {
        ...view,
        setMode: (mode: ViewMode) => update({ mode }),
        setSort: (sortKey: SortKey, sortDirection: SortDirection) => update({ sortKey, sortDirection }),
    }
}
