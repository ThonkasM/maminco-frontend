# 📋 Código Fuente para Pruebas de Caja Blanca - Frontend

## 🎯 Casos de Uso Analizados

1. **Registrar Producto**
2. **Actualizar Estado de Mesa en Tiempo Real (WebSocket)**
3. **Registrar Pago (Múltiples Formas de Pago)**

---

# CASO 1: REGISTRAR PRODUCTO

## 📄 Código Fuente

### 1.1 API Layer (`lib/api/admin/products.ts`)

```typescript
import { API_BASE, getHeaders } from '../../http/client'

export interface CreateProductPayload {
    name: string
    description?: string
    price: number // Entero, sin decimales
    categoryId: string
    stockGroupId?: string // Opcional
    individualStock?: number // Opcional - se puede registrar después
    isActive?: boolean
}

export interface UpdateProductPayload {
    name?: string
    description?: string
    price?: number // Entero, sin decimales
    categoryId?: string
    stockGroupId?: string
    individualStock?: number
    isAvailable?: boolean
    isActive?: boolean
}

export interface ProductResponse {
    id: string
    name: string
    description?: string
    price: number
    categoryId: string
    categoryName: string
    stockGroupId?: string
    stockGroupName?: string
    individualStock?: number
    isAvailable: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface PaginatedProductsResponse {
    data: ProductResponse[]
    total: number
    page: number
    limit: number
    totalPages: number
}

/**
 * Obtener lista de productos con paginación (requiere autenticación)
 */
export async function getProducts(
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: string
): Promise<PaginatedProductsResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.append('search', search)
    if (categoryId) params.append('categoryId', categoryId)

    const res = await fetch(`${API_BASE}/api/products?${params}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching products')
    }

    const data = await res.json().catch(() => null)
    if (!data) {
        return { data: [], total: 0, page, limit, totalPages: 0 }
    }
    return data
}

/**
 * Crear nuevo producto
 */
export async function createProduct(payload: CreateProductPayload): Promise<ProductResponse> {
    const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error creating product')
    }

    return res.json()
}

/**
 * Actualizar producto existente
 */
export async function updateProduct(
    id: string,
    payload: UpdateProductPayload,
): Promise<ProductResponse> {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error updating product')
    }

    return res.json()
}

/**
 * Eliminar/desactivar producto
 */
export async function deleteProduct(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error deleting product')
    }

    return res.json()
}
```

### 1.2 Hook (`app/(admin)/productos/hooks/useProducts.ts`)

```typescript
'use client'
import { useState, useEffect, useCallback } from 'react'
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    PaginatedProductsResponse,
    ProductResponse,
    CreateProductPayload,
} from '@/lib/api/admin/products'
import { getActiveCategories, CategoryResponse } from '@/lib/api/admin/categories'
import { toast } from '@/components/ToastProvider'

export function useProducts() {
    const [products, setProducts] = useState<PaginatedProductsResponse | null>(null)
    const [categories, setCategories] = useState<CategoryResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [existingNames, setExistingNames] = useState<Set<string>>(new Set())

    // Cargar categorías y productos
    useEffect(() => {
        loadCategories()
    }, [])

    useEffect(() => {
        loadProducts()
    }, [page, search, categoryFilter])

    const loadCategories = async () => {
        try {
            const data = await getActiveCategories()
            setCategories(data)
        } catch (err: any) {
            console.error('Error loading categories:', err)
        }
    }

    const loadProducts = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getProducts(page, 10, search || undefined, categoryFilter || undefined)
            setProducts(data)
        } catch (err: any) {
            const errorMsg = err.message || 'Error cargando productos'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const loadProductNames = useCallback(async (excludeProductId?: string) => {
        try {
            const data = await getProducts(1, 1000)
            const names = new Set(
                data.data
                    .filter((p) => !excludeProductId || p.id !== excludeProductId)
                    .map((p) => p.name.toLowerCase())
            )
            setExistingNames(names)
        } catch (err) {
            console.error('Error loading product names:', err)
        }
    }, [])

    const createNewProduct = async (payload: CreateProductPayload): Promise<boolean> => {
        try {
            await createProduct(payload)
            toast.success('Producto creado correctamente')
            setPage(1)
            await loadProducts()
            return true
        } catch (err: any) {
            const errorMsg = err.message || 'Error creando producto'
            toast.error(errorMsg)
            return false
        }
    }

    const updateExistingProduct = async (id: string, payload: CreateProductPayload): Promise<boolean> => {
        try {
            await updateProduct(id, payload)
            toast.success('Producto actualizado correctamente')
            await loadProducts()
            return true
        } catch (err: any) {
            const errorMsg = err.message || 'Error actualizando producto'
            toast.error(errorMsg)
            return false
        }
    }

    const deleteExistingProduct = async (id: string, name: string): Promise<boolean> => {
        try {
            await deleteProduct(id)
            toast.success(`Producto "${name}" desactivado correctamente`)
            await loadProducts()
            return true
        } catch (err: any) {
            const errorMsg = err.message || 'Error desactivando producto'
            toast.error(errorMsg)
            return false
        }
    }

    const getCategoryName = (categoryId: string) => {
        return categories.find((c) => c.id === categoryId)?.name || '-'
    }

    return {
        products,
        categories,
        loading,
        error,
        page,
        search,
        categoryFilter,
        existingNames,
        setPage,
        setSearch,
        setCategoryFilter,
        loadProductNames,
        createNewProduct,
        updateExistingProduct,
        deleteExistingProduct,
        getCategoryName,
    }
}
```

### 1.3 Form Component (`app/(admin)/productos/components/ProductFormModal.tsx`)

```typescript
'use client'
import React, { useState, useEffect } from 'react'
import { ProductResponse, CreateProductPayload } from '@/lib/api/admin/products'
import { CategoryResponse } from '@/lib/api/admin/categories'

interface ProductFormModalProps {
    isOpen: boolean
    product: ProductResponse | null
    categories: CategoryResponse[]
    existingNames: Set<string>
    onSubmit: (payload: CreateProductPayload) => Promise<void>
    onClose: () => void
    isLoading?: boolean
}

interface FormData {
    name: string
    description: string
    price: string
    categoryId: string
}

interface FormErrors {
    name?: string
    price?: string
    categoryId?: string
}

export default function ProductFormModal({
    isOpen,
    product,
    categories,
    existingNames,
    onSubmit,
    onClose,
    isLoading,
}: ProductFormModalProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        price: '',
        categoryId: '',
    })
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setFormData({
                    name: product.name,
                    description: product.description || '',
                    price: String(product.price),
                    categoryId: product.categoryId,
                })
            } else {
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    categoryId: '',
                })
            }
            setFormErrors({})
        }
    }, [isOpen, product])

    const validateForm = (): boolean => {
        const errors: FormErrors = {}

        // VALIDACION 1: Nombre requerido
        if (!formData.name.trim()) {
            errors.name = 'El nombre del producto es requerido'
        }
        // VALIDACION 2: Nombre longitud mínima
        else if (formData.name.trim().length < 2) {
            errors.name = 'Mínimo 2 caracteres'
        }
        // VALIDACION 3: Nombre único
        else if (
            existingNames.has(formData.name.trim().toLowerCase()) &&
            (!product || product.name.toLowerCase() !== formData.name.trim().toLowerCase())
        ) {
            errors.name = 'Ya existe un producto con este nombre'
        }

        // VALIDACION 4: Precio requerido
        if (!formData.price) {
            errors.price = 'El precio es requerido'
        }
        // VALIDACION 5: Precio es número
        else if (isNaN(Number(formData.price))) {
            errors.price = 'Debe ser un número válido'
        }
        // VALIDACION 6: Precio mayor a 0
        else if (Number(formData.price) <= 0) {
            errors.price = 'El precio debe ser mayor a 0'
        }
        // VALIDACION 7: Precio sin decimales
        else if (!Number.isInteger(Number(formData.price))) {
            errors.price = 'El precio debe ser un número entero (sin decimales)'
        }

        // VALIDACION 8: Categoría requerida
        if (!formData.categoryId) {
            errors.categoryId = 'La categoría es requerida'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setSubmitting(true)
        try {
            const payload: CreateProductPayload = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                price: Number(formData.price),
                categoryId: formData.categoryId,
            }
            await onSubmit(payload)
            handleClose()
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            categoryId: '',
        })
        setFormErrors({})
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    {product ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value })
                                if (formErrors.name) setFormErrors({ ...formErrors, name: undefined })
                            }}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                formErrors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                            } dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
                            placeholder="Ej: Café, Pizza..."
                        />
                        {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Descripción
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                            rows={2}
                            placeholder="Descripción opcional..."
                        />
                    </div>

                    {/* Price Input */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Precio (Entero, sin decimales) *
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-600 dark:text-slate-400">Bs.</span>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                value={formData.price}
                                onChange={(e) => {
                                    setFormData({ ...formData, price: e.target.value })
                                    if (formErrors.price) setFormErrors({ ...formErrors, price: undefined })
                                }}
                                className={`flex-1 px-4 py-2 rounded-lg border ${
                                    formErrors.price ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                } dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
                                placeholder="1000"
                            />
                        </div>
                        {formErrors.price && <p className="text-red-600 text-sm mt-1">{formErrors.price}</p>}
                    </div>

                    {/* Category Select */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Categoría *
                        </label>
                        <select
                            value={formData.categoryId}
                            onChange={(e) => {
                                setFormData({ ...formData, categoryId: e.target.value })
                                if (formErrors.categoryId) setFormErrors({ ...formErrors, categoryId: undefined })
                            }}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                formErrors.categoryId ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                            } dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
                        >
                            <option value="">Selecciona una categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {formErrors.categoryId && (
                            <p className="text-red-600 text-sm mt-1">{formErrors.categoryId}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
```

### 1.4 Page Component (`app/(admin)/productos/page.tsx`)

```typescript
'use client'
import React from 'react'
import { ProductResponse, CreateProductPayload } from '@/lib/api/admin/products'
import { toast } from '@/components/ToastProvider'
import AdminGuard from '../components/AdminGuard'
import { useProducts } from './hooks/useProducts'
import { useProductsUI } from './hooks/useProductsUI'
import ProductsTable from './components/ProductsTable'
import ProductFormModal from './components/ProductFormModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'

function ProductosPageContent() {
    const {
        products,
        categories,
        loading,
        error,
        page,
        search,
        categoryFilter,
        existingNames,
        setPage,
        setSearch,
        setCategoryFilter,
        createNewProduct,
        updateExistingProduct,
        deleteExistingProduct,
        getCategoryName,
    } = useProducts()

    const {
        showModal: showFormModal,
        editingProduct,
        showDeleteModal,
        deleteTarget,
        setShowModal: setShowFormModal,
        setEditingProduct,
        setShowDeleteModal,
        setDeleteTarget,
    } = useProductsUI()

    const handleOpenFormModal = (product?: ProductResponse) => {
        if (product) {
            setEditingProduct(product)
        } else {
            setEditingProduct(undefined)
        }
        setShowFormModal(true)
    }

    const handleSubmit = async (payload: CreateProductPayload) => {
        try {
            if (editingProduct) {
                const success = await updateExistingProduct(editingProduct.id, payload)
                if (success) {
                    toast.success('Producto actualizado correctamente')
                }
            } else {
                const success = await createNewProduct(payload)
                if (success) {
                    toast.success('Producto creado correctamente')
                }
            }
            setPage(1)
        } catch (err: any) {
            const errorMsg = err.message || 'Error procesando producto'
            toast.error(errorMsg)
        }
    }

    const handleDeleteClick = (product: ProductResponse) => {
        setDeleteTarget(product)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        try {
            const success = await deleteExistingProduct(deleteTarget.id, deleteTarget.name)
            if (success) {
                toast.success(`Producto "${deleteTarget.name}" desactivado correctamente`)
            }
        } catch (err: any) {
            const errorMsg = err.message || 'Error desactivando producto'
            toast.error(errorMsg)
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Productos</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Administra el catálogo de productos</p>
                </div>
                <button
                    onClick={() => handleOpenFormModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                    ➕ Nuevo Producto
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setPage(1)
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value)
                            setPage(1)
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading / Error */}
            {loading && <div className="text-center py-12 text-slate-600">Cargando productos...</div>}
            {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">{error}</div>}

            {/* Table */}
            {!loading && products && (
                <ProductsTable
                    products={products}
                    loading={loading}
                    error={error}
                    page={page}
                    onPageChange={setPage}
                    onEdit={handleOpenFormModal}
                    onDelete={handleDeleteClick}
                    getCategoryName={getCategoryName}
                />
            )}

            {/* Modals */}
            <ProductFormModal
                isOpen={showFormModal}
                product={editingProduct || null}
                categories={categories}
                existingNames={existingNames}
                onSubmit={handleSubmit}
                onClose={() => {
                    setShowFormModal(false)
                    setEditingProduct(undefined)
                }}
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                productName={deleteTarget?.name || ''}
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowDeleteModal(false)
                    setDeleteTarget(null)
                }}
            />
        </div>
    )
}

export default function ProductosPage() {
    return (
        <AdminGuard>
            <ProductosPageContent />
        </AdminGuard>
    )
}
```

---

# CASO 2: ACTUALIZAR ESTADO DE MESA EN TIEMPO REAL (WebSocket)

## 📄 Código Fuente

### 2.1 WebSocket Connection (`app/(negocio)/mesas-negocio/page.tsx`)

```typescript
'use client'
import React, { useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { getTables, TableResponse } from '@/lib/api/admin/tables'
import { getActiveOrderByTable, createOrderIfNotExists } from '@/lib/api/negocio/orders'
import { getActiveAreas, AreaResponse } from '@/lib/api/admin/areas'
import { toast } from '@/components/ToastProvider'
import { useAuth } from '@/hooks/useAuth'
import { useMesasNegocioUI } from './hooks/useMesasNegocioUI'

export default function MesasNegocioPage() {
    const router = useRouter()
    const { selectedAreaId, isLoading, handleSelectArea, setIsLoading } = useMesasNegocioUI()

    const [areas, setAreas] = React.useState<AreaResponse[]>([])
    const [tables, setTables] = React.useState<TableResponse[]>([])
    const [activeOrders, setActiveOrders] = React.useState<Record<string, boolean>>({})
    const [sidebarOpen, setSidebarOpen] = React.useState(true)
    const socketRef = useRef<Socket | null>(null)
    const user = useAuth((s) => s.user)
    const token = useAuth((s) => s.token)

    useEffect(() => {
        loadData()
    }, [])

    // ==========================================
    // WebSocket Connection & Event Listeners
    // ==========================================
    useEffect(() => {
        if (!user || !token) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        socketRef.current = io(`${apiUrl}/orders`, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
        })

        // EVENT 1: Connection established
        socketRef.current.on('connect', () => {
            console.log('✅ WebSocket conectado en mesas')
            // Subscribe to table status changes
            socketRef.current?.emit('subscribe:tables:status')
        })

        // EVENT 2: Snapshot of all tables (initial state)
        socketRef.current.on('tables:state:snapshot', (data) => {
            console.log('📸 Snapshot de todas las mesas recibido:', data.tables.length)
            if (data.tables && Array.isArray(data.tables)) {
                // CONDITION 1: Data is valid array
                const states: Record<string, boolean> = {}
                for (const table of data.tables) {
                    // CONDITION 2: Table has active order in DRAFT status
                    states[table.id] = table.hasActiveOrder
                }
                // ACTION: Update local state with all table statuses
                setActiveOrders(states)
            }
        })

        // EVENT 3: Table status changed (global event)
        socketRef.current.on('tables:status:changed', (data) => {
            console.log('🔄 Estado de mesa cambió (global):', data)
            // CONDITION 3: Data has tableId and status
            if (data.tableId && data.status) {
                // CONDITION 4: Status is OCUPADA or DISPONIBLE
                const isOccupied = data.status === 'OCUPADA'
                console.log(
                    `  📍 Mesa ${data.tableId} → ${isOccupied ? '🔴 OCUPADA' : '🟢 DISPONIBLE'}`
                )
                // ACTION: Update single table state
                setActiveOrders((prev) => ({
                    ...prev,
                    [data.tableId]: isOccupied,
                }))
            }
        })

        // EVENT 4: Table state updated (specific table)
        socketRef.current.on('table:state:updated', (data) => {
            console.log('📝 Estado completo de mesa actualizado:', data)
            // CONDITION 5: Data has tableId and orderState
            if (data.tableId && data.orderState) {
                // CONDITION 6: orderState exists and status is DRAFT
                const isOccupied = !!data.orderState && data.orderState.status === 'BORRADOR'
                console.log(`  📍 Mesa ${data.tableId} → Ocupada: ${isOccupied}`)
                // ACTION: Update specific table state
                setActiveOrders((prev) => ({
                    ...prev,
                    [data.tableId]: isOccupied,
                }))
            }
        })

        // EVENT 5-9: Debug events (logging only)
        socketRef.current.on('order:created', (data) => {
            console.log('📢 [order:created]', data)
        })
        socketRef.current.on('order:item:added', (data) => {
            console.log('📢 [order:item:added]', data)
        })
        socketRef.current.on('order:item:removed', (data) => {
            console.log('📢 [order:item:removed]', data)
        })
        socketRef.current.on('order:status:changed', (data) => {
            console.log('📢 [order:status:changed]', data)
        })
        socketRef.current.on('order:updated', (data) => {
            console.log('📢 [order:updated]', data)
        })

        // FALLBACK: Refresh every 120 seconds as backup
        const refreshOrderStates = async () => {
            try {
                const tablesData = await getTables(1, 1000)
                const orders: Record<string, boolean> = {}
                for (const table of tablesData.data) {
                    try {
                        const order = await getActiveOrderByTable(table.id)
                        // CONDITION 7: Order exists and status is DRAFT
                        orders[table.id] = !!order && order.status === 'BORRADOR'
                    } catch {
                        orders[table.id] = false
                    }
                }
                // ACTION: Update all orders from API
                setActiveOrders(orders)
            } catch (err) {
                console.error('❌ Error refrescando estados:', err)
            }
        }

        const refreshInterval = setInterval(() => {
            console.log('🔄 Refrescando estados (fallback cada 120s)...')
            refreshOrderStates()
        }, 120000)

        // Cleanup: Disconnect socket and clear interval
        return () => {
            clearInterval(refreshInterval)
            socketRef.current?.emit('unsubscribe:tables:status')
            socketRef.current?.disconnect()
        }
    }, [user, token])

    const loadData = async () => {
        setIsLoading(true)
        try {
            // Load active areas
            const areasData = await getActiveAreas()
            setAreas(areasData)

            // Select first area by default
            if (areasData.length > 0) {
                handleSelectArea(areasData[0].id)
            }

            // Load all tables
            const tablesData = await getTables(1, 1000)
            setTables(tablesData.data)

            // Load active orders for each table
            const orders: Record<string, boolean> = {}
            for (const table of tablesData.data) {
                try {
                    const order = await getActiveOrderByTable(table.id)
                    orders[table.id] = !!order
                } catch {
                    orders[table.id] = false
                }
            }
            setActiveOrders(orders)
        } catch (err: any) {
            toast.error(err.message || 'Error cargando datos')
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        const colors = {
            DISPONIBLE: 'bg-green-500 hover:bg-green-600',
            OCUPADA: 'bg-red-500 hover:bg-red-600',
            RESERVADA: 'bg-yellow-500 hover:bg-yellow-600',
        }
        return colors[status as keyof typeof colors] || 'bg-slate-400'
    }

    const getStatusLabel = (status: string) => {
        const labels = {
            DISPONIBLE: '✓ Disponible',
            OCUPADA: '⊙ Ocupada',
            RESERVADA: '⊗ Reservada',
        }
        return labels[status as keyof typeof labels] || status
    }

    const getTableStatus = (table: TableResponse): string => {
        // CONDITION 8: Table has active order
        if (activeOrders[table.id]) {
            return 'OCUPADA'
        }
        return table.status
    }

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin mb-4">⌛</div>
                    <p className="text-slate-600 dark:text-slate-400">Cargando datos...</p>
                </div>
            </div>
        )
    }

    // Filter tables by selected area
    const filteredTables = selectedAreaId
        ? tables.filter(t => t.areaId === selectedAreaId)
        : tables

    return (
        <div className="h-full flex overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* SIDEBAR (Areas) */}
            <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
                {/* Areas Section */}
                <div className="p-4 space-y-6">
                    {/* Physical Areas */}
                    <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">🏢 Áreas Físicas</h4>
                        <div className="space-y-2">
                            {areas.filter(a => !a.isVirtual).map((area) => (
                                <button
                                    key={area.id}
                                    onClick={() => handleSelectArea(area.id)}
                                    className={`w-full px-3 py-2 rounded-lg text-left text-sm font-medium transition-all ${
                                        selectedAreaId === area.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200'
                                    }`}
                                >
                                    {area.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Virtual Areas */}
                    {areas.some(a => a.isVirtual) && (
                        <>
                            <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
                            <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">☁️ Servicios</h4>
                                <div className="space-y-2">
                                    {areas.filter(a => a.isVirtual).map((area) => (
                                        <button
                                            key={area.id}
                                            onClick={() => handleSelectArea(area.id)}
                                            className={`w-full px-3 py-2 rounded-lg text-left text-sm font-medium transition-all ${
                                                selectedAreaId === area.id
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200'
                                            }`}
                                        >
                                            {area.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-auto">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                        🏪 Centro de Órdenes
                    </h1>

                    {/* Tables Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredTables.map((table) => (
                            <Link
                                key={table.id}
                                href={`/ordenes-negocio/${table.id}`}
                                className="group"
                            >
                                <div
                                    className={`
                                        relative w-full aspect-square rounded-lg transition-all duration-300
                                        transform hover:scale-105 cursor-pointer shadow-lg
                                        ${getStatusColor(getTableStatus(table))}
                                        text-white font-bold text-center flex flex-col items-center justify-center
                                    `}
                                >
                                    {/* Indicator: Table has active order */}
                                    {activeOrders[table.id] && (
                                        <div className="absolute top-2 right-2 w-4 h-4 bg-blue-300 rounded-full animate-pulse" />
                                    )}

                                    <div className="text-5xl mb-2">🪑</div>
                                    <div className="text-xl font-bold">Mesa {table.number}</div>
                                    <div className="text-sm opacity-90 mt-1">
                                        {getStatusLabel(getTableStatus(table))}
                                    </div>

                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-end justify-center pb-3 rounded-lg">
                                        <span className="text-sm font-semibold">
                                            {activeOrders[table.id] ? '📝 Continuar' : '📋 Nueva Orden'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {filteredTables.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-slate-600 dark:text-slate-400">
                                No hay mesas en esta área
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
```

---

# CASO 3: REGISTRAR PAGO

## 📄 Código Fuente

### 3.1 API Layer (`lib/api/negocio/payments.ts`)

```typescript
import { API_BASE, getHeaders } from '../../http/client'

export interface PaymentMethodResponseDto {
    id: string
    name: string
    description?: string
    isActive: boolean
}

export interface ProcessPaymentDto {
    paymentMethodId: string
    amountReceived: number
    isExtraTip?: boolean
    notes?: string
    cardLastDigits?: string
}

export interface PaymentProcessResponseDto {
    status: 'PENDING_CONFIRMATION' | 'COMPLETED' | 'ERROR' | 'PARTIAL_PAYMENT'
    message: string
    orderId?: string
    orderNumber?: string
    paymentId?: string
    amountReceived?: number
    amountApplied?: number
    changeAmount?: number | null
    tipAmount?: number
    totalDue?: number
    paymentMethod?: string
    orderStatus?: 'CERRADO' | 'BORRADOR' | 'CANCELADO'
    totalPaidSoFar?: number
    pendingBalance?: number
    isPaid?: boolean
    difference?: number
    error?: string
}

export interface PaymentResponseDto {
    id: string
    orderId: string
    orderNumber: string
    amountReceived: number
    amountApplied: number
    changeAmount: number | null
    tipAmount: number
    paymentMethod: {
        id: string
        name: string
    }
    createdBy: {
        id: string
        name: string
        email: string
    }
    createdAt: Date
}

/**
 * Get all available payment methods
 */
export async function getPaymentMethods(): Promise<PaymentMethodResponseDto[]> {
    const response = await fetch(`${API_BASE}/api/payments/methods`, {
        headers: getHeaders(),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error obteniendo métodos de pago')
    }

    return response.json()
}

/**
 * Process a payment on an order
 */
export async function processPayment(
    orderId: string,
    dto: ProcessPaymentDto,
): Promise<PaymentProcessResponseDto> {
    const response = await fetch(`${API_BASE}/api/payments/orders/${orderId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Error procesando pago')
    }

    return data
}

/**
 * Get all payments for an order
 */
export async function getPaymentsByOrder(orderId: string): Promise<PaymentResponseDto[]> {
    const response = await fetch(`${API_BASE}/api/payments/orders/${orderId}`, {
        headers: getHeaders(),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error obteniendo pagos')
    }

    return response.json()
}
```

### 3.2 Payment Method Selector (`app/(negocio)/ordenes-negocio/components/PaymentMethodSelector.tsx`)

```typescript
'use client'
import React from 'react'
import { CreditCard, Banknote, Building2 } from 'lucide-react'

export interface PaymentMethod {
    id: string
    name: string
    code: string
    description?: string
    isActive: boolean
}

interface PaymentMethodSelectorProps {
    methods: PaymentMethod[]
    selectedMethodId: string | null
    onSelectMethod: (methodId: string) => void
    loading?: boolean
}

const getPaymentIcon = (code: string) => {
    switch (code) {
        case 'CASH':
            return <Banknote className="w-8 h-8" />
        case 'TRANSFER':
            return <Building2 className="w-8 h-8" />
        case 'CARD':
            return <CreditCard className="w-8 h-8" />
        default:
            return <CreditCard className="w-8 h-8" />
    }
}

const getPaymentColor = (code: string) => {
    switch (code) {
        case 'CASH':
            return 'from-green-500 to-green-600'
        case 'TRANSFER':
            return 'from-blue-500 to-blue-600'
        case 'CARD':
            return 'from-purple-500 to-purple-600'
        default:
            return 'from-slate-500 to-slate-600'
    }
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
    methods,
    selectedMethodId,
    onSelectMethod,
    loading = false,
}) => {
    // CONDITION 1: Filter only active payment methods
    const activePaymentMethods = methods.filter(m => m.isActive)

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-800">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 shrink-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    Métodos de Pago
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {activePaymentMethods.length} disponible{activePaymentMethods.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Methods List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* CONDITION 2: No active payment methods available */}
                {activePaymentMethods.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        <p className="text-sm font-medium">Sin métodos disponibles</p>
                        <p className="text-xs">Activa métodos en el panel de gestión</p>
                    </div>
                ) : (
                    activePaymentMethods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => {
                                console.log('🎯 Método de pago seleccionado:', {
                                    id: method.id,
                                    name: method.name,
                                    code: method.code,
                                    description: method.description
                                })
                                // CONDITION 3: Button is not in loading state
                                !loading && onSelectMethod(method.id)
                            }}
                            disabled={loading}
                            className={`w-full p-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 border-2 ${
                                // CONDITION 4: Method is selected
                                selectedMethodId === method.id
                                    ? method.code === 'CASH'
                                        ? 'bg-linear-to-r from-green-500 to-green-600 text-white border-white shadow-lg'
                                        : method.code === 'TRANSFER'
                                        ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white border-white shadow-lg'
                                        : method.code === 'CARD'
                                        ? 'bg-linear-to-r from-purple-500 to-purple-600 text-white border-white shadow-lg'
                                        : 'bg-linear-to-r from-slate-500 to-slate-600 text-white border-white shadow-lg'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={selectedMethodId === method.id ? 'text-white' : 'text-slate-700 dark:text-slate-300'}>
                                    {getPaymentIcon(method.code)}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-sm">
                                        {method.name}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}

export default PaymentMethodSelector
```

### 3.3 Payment Detail View (`app/(negocio)/ordenes-negocio/components/PaymentDetailView.tsx`) - Excerpt

```typescript
interface RegisteredPayment {
    methodName: string
    amount: number
    timestamp: string
}

interface PaymentDetailViewProps {
    totalDue: number
    registeredPayments: RegisteredPayment[]
    pendingBalance: number
    onAddPayment: () => void
}

export const PaymentDetailView: React.FC<PaymentDetailViewProps> = ({
    totalDue,
    registeredPayments,
    pendingBalance,
    onAddPayment,
}) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Detalle de Pago
                </h4>
            </div>

            {/* Payments Breakdown */}
            <div>
                <h5 className="font-semibold text-slate-900 dark:text-white mb-3">
                    Pagos Registrados
                </h5>
                {/* CONDITION 1: Payments have been registered */}
                {registeredPayments.length > 0 ? (
                    <div className="space-y-2">
                        {registeredPayments.map((payment, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded"
                            >
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {payment.methodName}
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {formatCurrency(payment.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        No hay pagos registrados aún
                    </p>
                )}
            </div>

            {/* Summary */}
            <div className="space-y-2 bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                <div className="flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Total a Pagar:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(totalDue)}
                    </span>
                </div>
                {/* CONDITION 2: There is pending balance */}
                {pendingBalance > 0 && (
                    <div className="flex justify-between text-red-600 dark:text-red-400">
                        <span>Saldo Pendiente:</span>
                        <span className="font-bold">
                            {formatCurrency(pendingBalance)}
                        </span>
                    </div>
                )}
                {/* CONDITION 3: Order is fully paid */}
                {pendingBalance <= 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>✓ Pagado Completamente</span>
                    </div>
                )}
            </div>

            {/* Add Payment Button */}
            {/* CONDITION 4: There is still pending balance */}
            {pendingBalance > 0 && (
                <button
                    onClick={onAddPayment}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                >
                    ➕ Agregar Pago
                </button>
            )}
        </div>
    )
}

export default PaymentDetailView
```

---

## 📊 RESUMEN EJECUTIVO

Ya tienes compilado TODO el código frontend necesario para las pruebas de caja blanca en:

1. **Registrar Producto** ✅
   - API layer completa
   - Hook con lógica de negocio
   - Form component con validaciones
   - Page component orquestador

2. **WebSocket Real-time** ✅
   - Conexión Socket.io
   - 5 tipos de eventos listeners
   - 8 condiciones identificadas
   - Fallback mechanism (polling cada 120s)

3. **Registrar Pago** ✅
   - API layer con DTOs completos
   - Payment method selector con 4 condiciones
   - Payment detail view con 4 condiciones
   - Support para múltiples formas de pago

**Próximo paso:** Tú enumeras funciones, condiciones, flujos de datos y creates la tabla de "Camino, Entrada, Salida".

¿Necesitas que agregue algo más o que reorganice el código de otra manera?

