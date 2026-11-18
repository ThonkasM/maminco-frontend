'use client'
import { Plus } from 'lucide-react'
import {
    Button,
    EmptyState,
    Input,
    Pagination,
    Select,
    Skeleton,
} from '@/components/ui'
import type { ProductResponse, CreateProductPayload } from '../api'
import { useProducts } from '../hooks/useProducts'
import { useProductsUI } from '../hooks/useProductsUI'
import { ProductsTable } from './ProductsTable'
import type { ImageChange } from '../hooks/useProducts'
import { ProductFormModal } from './ProductFormModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'

export function ProductsPage() {
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
        setEditingProduct(product)
        setShowFormModal(true)
    }

    const handleSubmit = async (payload: CreateProductPayload, image?: ImageChange) => {
        if (editingProduct) {
            await updateExistingProduct(editingProduct.id, payload, image)
        } else {
            await createNewProduct(payload, image)
        }
    }

    const handleDeleteClick = (product: ProductResponse) => {
        setDeleteTarget(product)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        await deleteExistingProduct(deleteTarget.id, deleteTarget.name)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">
                        Gestión de productos
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Administra el catálogo de productos
                    </p>
                </div>
                <Button onClick={() => handleOpenFormModal()}>
                    <Plus />
                    Nuevo producto
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                    placeholder="Buscar por nombre..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setPage(1)
                    }}
                />
                <Select
                    value={categoryFilter}
                    onChange={(e) => {
                        setCategoryFilter(e.target.value)
                        setPage(1)
                    }}
                >
                    <option value="">Todas las categorías</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </Select>
            </div>

            {error && (
                <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : products && products.data.length > 0 ? (
                <div className="space-y-4">
                    <ProductsTable
                        products={products}
                        onEdit={handleOpenFormModal}
                        onDelete={handleDeleteClick}
                        getCategoryName={getCategoryName}
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {products.data.length} de {products.total}{' '}
                            productos
                        </p>
                        <Pagination
                            page={page}
                            totalPages={products.totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </div>
            ) : (
                <EmptyState
                    title="No hay productos"
                    description="Crea el primer producto del catálogo para empezar."
                    action={
                        <Button onClick={() => handleOpenFormModal()}>
                            <Plus />
                            Nuevo producto
                        </Button>
                    }
                />
            )}

            <ProductFormModal
                key={editingProduct?.id ?? 'new'}
                isOpen={showFormModal}
                product={editingProduct ?? null}
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
