'use client'
import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/utils/socket'

export function useRealtime<T = any>(namespace = 'default') {
  const [data, setData] = useState<T[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = getSocket()
    // connect lazily
    socket.connect()

    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)
    const handleUpdate = (payload: T[] | T) => {
      // if payload is array, replace, otherwise push
      if (Array.isArray(payload)) setData(payload as T[])
      else setData(prev => [...prev, payload as T])
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on(namespace, handleUpdate)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off(namespace, handleUpdate)
      try {
        socket.disconnect()
      } catch (e) {
        // ignore
      }
    }
  }, [namespace])

  return { data, connected }
}
