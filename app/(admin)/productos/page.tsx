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
