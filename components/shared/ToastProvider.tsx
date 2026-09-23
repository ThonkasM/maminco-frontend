'use client'
import { Toaster, toast } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: 'var(--surface)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          padding: '16px',
          borderRadius: '8px',
          boxShadow:
            '0 12px 32px rgba(16, 24, 20, 0.12), 0 4px 8px rgba(16, 24, 20, 0.06)',
          fontSize: '14px',
        },
        success: {
          style: {
            background: 'var(--success)',
            color: '#fff',
            border: '1px solid transparent',
          },
          iconTheme: {
            primary: '#fff',
            secondary: 'var(--success)',
          },
        },
        error: {
          style: {
            background: 'var(--danger)',
            color: '#fff',
            border: '1px solid transparent',
          },
          iconTheme: {
            primary: '#fff',
            secondary: 'var(--danger)',
          },
        },
        loading: {
          style: {
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            border: '1px solid transparent',
          },
        },
      }}
    />
  )
}

export { toast }
