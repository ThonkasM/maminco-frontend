'use client'
import { useRef } from 'react'

/** Touch long-press (500 ms) that selects an item. A press that became a long-press swallows its click. */
export function useLongPress(onLongPress: () => void, enabled: boolean) {
    const timer = useRef<number | null>(null)
    const fired = useRef(false)
    const clear = () => {
        if (timer.current !== null) window.clearTimeout(timer.current)
        timer.current = null
    }
    return {
        consumed: () => {
            const value = fired.current
            fired.current = false
            return value
        },
        handlers: {
            onPointerDown: (event: React.PointerEvent) => {
                if (!enabled || event.pointerType !== 'touch') return
                fired.current = false
                timer.current = window.setTimeout(() => {
                    fired.current = true
                    onLongPress()
                }, 500)
            },
            onPointerUp: clear,
            onPointerLeave: clear,
            onPointerCancel: clear,
            onContextMenu: (event: React.MouseEvent) => {
                if (enabled && fired.current) event.preventDefault()
            },
        },
    }
}
