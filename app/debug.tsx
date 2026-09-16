'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function DebugPage() {
  const token = useAuth((s) => s.token)
  const user = useAuth((s) => s.user)
  const [cookies, setCookies] = useState<string>('')
  const [localStorageData, setLocalStorageData] = useState<string>('')

  useEffect(() => {
    // Read cookies
    setCookies(document.cookie)

    // Read localStorage
    const auth = window.localStorage.getItem('maminco-auth')
    setLocalStorageData(auth || 'No auth data in localStorage')
  }, [token, user])

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">🔍 Debug Page</h1>

        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Zustand State</h2>
          <pre className="bg-slate-900 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(
              {
                token: token ? `${token.substring(0, 30)}...` : null,
                user,
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Cookies</h2>
          <pre className="bg-slate-900 p-4 rounded overflow-auto text-sm">
            {cookies || 'No cookies found'}
          </pre>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">localStorage</h2>
          <pre className="bg-slate-900 p-4 rounded overflow-auto text-sm max-h-96">
            {localStorageData}
          </pre>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Actions</h2>
          <button
            onClick={() => {
              fetch('/api/auth/set-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token || 'TEST_TOKEN' }),
              }).then(() => {
                setCookies(document.cookie)
              })
            }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mr-2"
          >
            Test Set Token API
          </button>
          <button
            onClick={() => {
              setCookies(document.cookie)
              const auth = window.localStorage.getItem('maminco-auth')
              setLocalStorageData(auth || 'No auth data in localStorage')
            }}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Refresh Debug Info
          </button>
        </div>

        <a href="/auth/login" className="inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
          Back to Login
        </a>
      </div>
    </div>
  )
}
