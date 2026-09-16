# 📚 Librerías y Protocolos de Comunicación - Maminco Frontend

---

## 🎯 Stack Tecnológico General

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16.0.1                           │
│          (React Framework + TypeScript)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐     │
│  │ Frontend UI │  │ Data Fetching│  │ Real-time RT  │     │
│  ├─────────────┤  ├──────────────┤  ├───────────────┤     │
│  │ React 19.2  │  │ TanStack RQ  │  │ Socket.io     │     │
│  │ TailwindCSS │  │ Zustand      │  │ WebSocket     │     │
│  │ Lucide Icons│  │ localStorage │  │ Polling       │     │
│  └─────────────┘  └──────────────┘  └───────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Dependencias Principales

### **Producción** (dependencies)

| Librería | Versión | Propósito | Uso |
|----------|---------|----------|-----|
| **next** | 16.0.1 | Framework React fullstack | SSR, API routes, routing |
| **react** | 19.2.0 | Librería UI | Components, hooks |
| **react-dom** | 19.2.0 | Renderizador React | DOM rendering |
| **@tanstack/react-query** | ^5.0.0 | Data fetching | Queries, mutations, caching |
| **zustand** | ^4.4.0 | State management | Global state (auth, UI) |
| **socket.io-client** | ^4.7.2 | WebSocket client | Real-time communication |
| **react-hot-toast** | ^2.6.0 | Notifications | Toast messages (error, success) |
| **lucide-react** | ^0.553.0 | Icon library | UI icons |
| **clsx** | ^1.2.1 | Conditional CSS | className utilities |

### **Desarrollo** (devDependencies)

| Librería | Versión | Propósito |
|----------|---------|----------|
| **typescript** | ^5 | Type checking |
| **tailwindcss** | ^4 | CSS framework |
| **autoprefixer** | ^10 | CSS vendor prefixes |
| **postcss** | ^8 | CSS processing |
| **@tailwindcss/postcss** | ^4.1.16 | Tailwind PostCSS plugin |
| **eslint** | ^9 | Code linting |
| **eslint-config-next** | 16.0.1 | ESLint config para Next.js |
| **@types/react** | ^19 | TypeScript types for React |
| **@types/react-dom** | ^19 | TypeScript types for React DOM |
| **@types/node** | ^20 | TypeScript types for Node.js |

---

## 🌐 Protocolos de Comunicación

### **1. REST API (HTTP)**

#### **Configuración Base**

```typescript
// lib/http/client.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

function getHeaders(additionalHeaders?: Record<string, string>) {
    const token = getAuthToken()
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...additionalHeaders,
    }
}
```

#### **Métodos HTTP Utilizados**

```
GET     /api/areas              → Fetch all areas
POST    /api/areas              → Create new area
PATCH   /api/areas/:id          → Update area
DELETE  /api/areas/:id          → Delete area

GET     /api/tables             → Fetch tables
POST    /api/tables             → Create table
PATCH   /api/tables/:id         → Update table
DELETE  /api/tables/:id         → Delete table

GET     /api/orders             → Fetch orders
POST    /api/orders             → Create order
PATCH   /api/orders/:id         → Update order
DELETE  /api/orders/:id         → Cancel/delete order

GET     /api/products           → Fetch products
POST    /api/categories         → Create category
GET     /api/users              → Fetch users

GET     /api/auth/me            → Get current user
POST    /api/auth/login         → User login
POST    /api/auth/logout        → User logout
```

#### **Ejemplo de Request**

```typescript
const response = await fetch(`${API_BASE}/api/areas`, {
    method: 'GET',
    headers: getHeaders(),
})
const data = await response.json()
```

#### **Authentication Header**

```
Authorization: Bearer <JWT_TOKEN>
```

- **Token Storage:** localStorage (persisted by Zustand)
- **Token Refresh:** Manual (on login, auto-retrieve from localStorage)
- **Expiry Handling:** Token validation en backend

---

### **2. WebSocket (Socket.io)**

#### **Configuración**

```typescript
import { io, Socket } from 'socket.io-client'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
socketRef.current = io(`${apiUrl}/orders`, {
    auth: { token },
    transports: ['websocket', 'polling'],  // WebSocket + fallback to HTTP polling
    reconnection: true,
    reconnectionAttempts: 5,
})
```

#### **Eventos Emitidos (Cliente → Servidor)**

```typescript
// Suscribirse a cambios globales
socketRef.current.emit('subscribe:tables:status')

// Desuscribirse
socketRef.current.emit('unsubscribe:tables:status')
```

#### **Eventos Recibidos (Servidor → Cliente)**

```typescript
// Snapshot inicial de todas las mesas
socketRef.current.on('tables:state:snapshot', (data) => {
    // {
    //   tables: [
    //     { id: '1', hasActiveOrder: true, status: 'OCUPADA' },
    //     { id: '2', hasActiveOrder: false, status: 'DISPONIBLE' }
    //   ]
    // }
})

// Cambio de estado global de mesa
socketRef.current.on('tables:status:changed', (data) => {
    // { tableId: '1', status: 'OCUPADA' }
})

// Estado completo de mesa específica
socketRef.current.on('table:state:updated', (data) => {
    // { tableId: '1', orderState: {...} }
})

// Eventos de órdenes (debug)
socketRef.current.on('order:created', (data) => {})
socketRef.current.on('order:item:added', (data) => {})
socketRef.current.on('order:item:removed', (data) => {})
socketRef.current.on('order:status:changed', (data) => {})
socketRef.current.on('order:updated', (data) => {})
```

#### **Características de Socket.io**

| Característica | Valor |
|---|---|
| **Namespace** | `/orders` |
| **Autenticación** | JWT token en `auth` |
| **Transporte Primario** | WebSocket |
| **Fallback** | HTTP Long Polling |
| **Reconexión Automática** | Sí (hasta 5 intentos) |
| **Real-time Sync** | Sí (snapshot + eventos delta) |

#### **Ejemplo de Uso**

```typescript
// app/(negocio)/mesas-negocio/page.tsx
useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    socketRef.current = io(`${apiUrl}/orders`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
    })

    socketRef.current.on('connect', () => {
        console.log('✅ WebSocket conectado')
        socketRef.current?.emit('subscribe:tables:status')
    })

    socketRef.current.on('tables:status:changed', (data) => {
        setActiveOrders(prev => ({
            ...prev,
            [data.tableId]: data.status === 'OCUPADA'
        }))
    })

    return () => {
        socketRef.current?.disconnect()
    }
}, [user, token])
```

---

## 🔄 Data Fetching & State Management

### **TanStack React Query (@tanstack/react-query)**

#### **Propósito**
- Caching automático de queries
- Sincronización con servidor
- Manejo de errores
- Loading states

#### **Configuración**

```typescript
// components/providers/ReactQueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,      // 5 minutos
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

export default function ReactQueryProvider({ children }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
```

#### **Uso Típico**

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'

// Lectura de datos
const { data, isLoading, error } = useQuery({
    queryKey: ['areas'],
    queryFn: () => getAreas(),
})

// Creación/Actualización
const mutation = useMutation({
    mutationFn: (payload) => createArea(payload),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['areas'] })
    },
})
```

---

### **Zustand (State Management)**

#### **Propósito**
- Global state management
- Persistencia en localStorage
- Reducido overhead vs Redux

#### **Configuración**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuth = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            login: (userData, token) => set({ user: userData, token }),
            logout: () => set({ user: null, token: null }),
        }),
        {
            name: 'maminco-auth', // localStorage key
            storage: localStorage,
        }
    )
)
```

#### **Casos de Uso**

1. **useAuth** - User session, token, permissions
2. **useMode** - UI theme (light/dark)
3. **useMesasUI** - Modal states, editing modes
4. **useAreasUI** - Areas list modal states
5. **useOrdersUI** - Orders admin modal states

#### **Acceso al Store**

```typescript
const user = useAuth((s) => s.user)
const token = useAuth((s) => s.token)
const logout = useAuth((s) => s.logout)
```

---

## 🎨 UI Styling & Components

### **TailwindCSS v4**

```typescript
// postcss.config.mjs
export default {
    plugins: {
        '@tailwindcss/postcss': {},
        autoprefixer: {},
    },
}
```

**Características:**
- Utility-first CSS framework
- Dark mode support (class-based)
- Responsive design (mobile-first)
- Custom colors, spacing, typography

### **Lucide React (Icons)**

```typescript
import { Menu, X, Plus, Edit, Trash2 } from 'lucide-react'

// Uso
<Menu size={24} className="text-blue-600" />
```

### **clsx (Conditional CSS)**

```typescript
import clsx from 'clsx'

const buttonClass = clsx(
    'px-4 py-2 rounded-lg transition-all',
    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-900'
)
```

### **react-hot-toast (Notifications)**

```typescript
import { toast } from '@/components/ToastProvider'

toast.success('Area creada exitosamente')
toast.error('Error al crear área')
toast.loading('Creando área...')
```

---

## 📊 Arquitectura de Comunicación Completa

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js React)                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ REST API (HTTP) ────────────────────────────────────┐   │
│  │                                                      │   │
│  │  getHeaders() + Bearer Token                         │   │
│  │  ├─→ GET    /api/areas                              │   │
│  │  ├─→ POST   /api/areas                              │   │
│  │  ├─→ PATCH  /api/areas/:id                          │   │
│  │  ├─→ DELETE /api/areas/:id                          │   │
│  │  ├─→ GET    /api/orders                             │   │
│  │  ├─→ POST   /api/orders                             │   │
│  │  ├─→ PATCH  /api/orders/:id                         │   │
│  │  └─→ GET    /api/tables                             │   │
│  │                                                      │   │
│  │  Status Codes:                                       │   │
│  │  • 200 OK                                            │   │
│  │  • 201 Created                                       │   │
│  │  • 400 Bad Request                                   │   │
│  │  • 401 Unauthorized                                  │   │
│  │  • 403 Forbidden                                     │   │
│  │  • 404 Not Found                                     │   │
│  │  • 500 Internal Server Error                         │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ WebSocket (Socket.io) ──────────────────────────────┐   │
│  │                                                      │   │
│  │  io(`${API_BASE}/orders`, {                          │   │
│  │    auth: { token },                                  │   │
│  │    transports: ['websocket', 'polling'],             │   │
│  │    reconnection: true                                │   │
│  │  })                                                  │   │
│  │                                                      │   │
│  │  Emit:                                               │   │
│  │  • subscribe:tables:status                           │   │
│  │  • unsubscribe:tables:status                         │   │
│  │                                                      │   │
│  │  Listen:                                             │   │
│  │  • connect                                           │   │
│  │  • tables:state:snapshot                             │   │
│  │  • tables:status:changed                             │   │
│  │  • table:state:updated                               │   │
│  │  • order:*                                           │   │
│  │  • disconnect                                        │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP + WebSocket
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  Backend (NestJS + Prisma)                   │
│              Port: 3000 (API + WebSocket)                    │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL)                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔐 Autenticación & Autorización

### **Flujo de Autenticación**

```
1. Login Request
   POST /api/auth/login
   { email, password }
   ↓
2. Backend Response
   {
     user: { id, name, email, role },
     token: "eyJhbGci..."
   }
   ↓
3. Zustand persist (localStorage)
   Key: "maminco-auth"
   Value: { user, token }
   ↓
4. HTTP Requests
   Authorization: Bearer <token>
   ↓
5. Token Validation (Backend)
   JWT verification on each request
   ↓
6. Logout
   Clear localStorage
   Clear Zustand store
   Redirect to /auth/login
```

### **Token Management**

```typescript
// lib/http/client.ts
function getAuthToken(): string | null {
    try {
        const auth = window.localStorage.getItem('maminco-auth')
        const parsed = JSON.parse(auth)
        return parsed.state?.token || null
    } catch {
        return null
    }
}

// Cada request incluye automáticamente el token
const headers = getHeaders()
// { 'Authorization': 'Bearer ...', 'Content-Type': 'application/json' }
```

---

## 🔄 Ciclo de Vida de Requests

### **1. API GET Request**

```
User Component
    ↓
useQuery() [React Query]
    ↓
queryFn: getAreas()
    ↓
fetch(`${API_BASE}/api/areas`, {
    method: 'GET',
    headers: getHeaders()  // Incluye token
})
    ↓
Backend: /areas endpoint
    ↓
Database Query
    ↓
Response: { data: [...], total, page, limit, pages }
    ↓
React Query Cache
    ↓
Component Render
```

### **2. Socket.io Real-time Event**

```
Backend Event: 'tables:status:changed'
    ↓
Socket.io Broadcast
    ↓
Frontend Socket Listener
    ↓
setActiveOrders(state)
    ↓
Component Re-render
```

### **3. Mutación (Create/Update/Delete)**

```
User Form Submit
    ↓
useMutation()
    ↓
mutationFn: handleCreate(payload)
    ↓
fetch(`${API_BASE}/api/areas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
})
    ↓
Backend Create
    ↓
Return new AreaResponse
    ↓
queryClient.invalidateQueries()  // Invalida cache
    ↓
Re-fetch data
    ↓
Component Update
    ↓
toast.success()
```

---

## 📡 Error Handling & Resilience

### **HTTP Error Handling**

```typescript
fetch(url, { headers })
    .then(res => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
    })
    .catch(err => {
        toast.error(err.message || 'Error en la solicitud')
        throw err
    })
```

### **Socket.io Reconnection**

```typescript
io(url, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
})

// Auto-reconnect on disconnect
socket.on('disconnect', () => {
    console.log('❌ Desconectado')
})

socket.on('connect', () => {
    console.log('✅ Reconectado')
    // Re-subscribe to events
})
```

### **Fallback Mechanism**

```typescript
// Si WebSocket falla, usa HTTP polling
io(url, {
    transports: ['websocket', 'polling'],
    // Intenta WebSocket primero
    // Si falla, usa HTTP Long Polling
})
```

---

## 🚀 Performance Optimizations

### **React Query Caching**

```typescript
// Datos cacheados por 5 minutos
staleTime: 1000 * 60 * 5

// No re-fetch cuando la ventana gana focus
refetchOnWindowFocus: false

// Reintentar fallos automáticamente
retry: 1
```

### **Zustand Persistence**

```typescript
// State persiste en localStorage
// Recuperado automáticamente en reload
persist({
    name: 'maminco-auth',
    storage: localStorage,
})
```

### **Socket.io Batching**

```typescript
// Eventos snapshot → Batch updates instead of individual events
tables:state:snapshot: [ { id, status }, { id, status } ]

// Cambios delta en tiempo real
tables:status:changed: { tableId, status }
```

---

## 📚 Resumen Rápido

| Aspecto | Librería/Protocolo | Uso |
|--------|-------------------|-----|
| **Frontend** | React 19.2, Next.js 16 | UI, SSR, routing |
| **Data Fetching** | TanStack React Query | Caching, queries, mutations |
| **State** | Zustand | Global state (auth, UI) |
| **Real-time** | Socket.io WebSocket | Live table status, order updates |
| **HTTP** | Fetch API | REST calls con JWT |
| **Styling** | TailwindCSS v4 | Utility CSS + dark mode |
| **Icons** | Lucide React | 500+ icons |
| **Notifications** | react-hot-toast | Toasts (success, error, loading) |
| **Language** | TypeScript 5 | Type safety |

---

## 🔗 Diagrama de Dependencias

```
maminco-frontend
├── Core
│   ├── next@16.0.1
│   ├── react@19.2.0
│   └── react-dom@19.2.0
│
├── Data & State
│   ├── @tanstack/react-query@5.0.0
│   ├── zustand@4.4.0
│   └── socket.io-client@4.7.2
│
├── UI
│   ├── tailwindcss@4
│   ├── lucide-react@0.553.0
│   └── react-hot-toast@2.6.0
│
├── Utils
│   └── clsx@1.2.1
│
└── Dev Tools
    ├── typescript@5
    ├── eslint@9
    ├── autoprefixer@10
    └── postcss@8
```

