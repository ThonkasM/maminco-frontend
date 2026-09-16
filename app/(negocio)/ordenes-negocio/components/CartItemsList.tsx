'use client'

import React, { memo } from 'react'
import { formatCurrency } from '@/lib/utils/currency'

interface CartItem {
    id: string
    productId: string
    productName: string
    unitPrice: number
    quantity: number
    subtotal: number
    addedByName?: string
}

interface CartItemsListProps {
    items: CartItem[]
    onChangeQuantity: (productId: string, quantity: number) => void
    onRemove: (productId: string) => void
}

const CartItemStaticFields = memo(function CartItemStaticFields({
    productName,
    unitPrice,
}: {
    productName: string
    unitPrice: number
}) {
    return (
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                {productName}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
                {formatCurrency(unitPrice)}
            </p>
        </div>
    )
})

const CartItemComponent = memo(function CartItemComponent({
    item,
    onChangeQuantity,
    onRemove,
}: {
    item: CartItem
    onChangeQuantity: (productId: string, quantity: number) => void
    onRemove: (productId: string) => void
}) {
    return (
        <div key={item.id} className="space-y-1">
            <div className="flex items-start gap-2">
                {/* Item del carrito */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600 flex items-center justify-between gap-3">
                    {/* Cantidad - Izquierda */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={() =>
                                onChangeQuantity(item.productId, item.quantity - 1)
                            }
                            className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white rounded text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-500 transition-all"
                        >
                            −
                        </button>
                        <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                                onChangeQuantity(
                                    item.productId,
                                    parseInt(e.target.value) || 1
                                )
                            }
                            style={{
                                MozAppearance: 'textfield',
                            }}
                            className="w-12 px-1.5 py-1 text-center font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded text-sm"
                        />
                        <button
                            onClick={() =>
                                onChangeQuantity(item.productId, item.quantity + 1)
                            }
                            className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white rounded text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-500 transition-all"
                        >
                            +
                        </button>
                    </div>

                    {/* Info del Producto - Centro */}
                    <CartItemStaticFields
                        productName={item.productName}
                        unitPrice={item.unitPrice}
                    />

                    {/* Subtotal - Derecha */}
                    <div className="text-right shrink-0">
                        <p className="font-bold text-lg text-slate-900 dark:text-white">
                            {formatCurrency(item.subtotal)}
                        </p>
                    </div>

                    {/* Botón Eliminar */}
                    <button
                        onClick={() => onRemove(item.productId)}
                        className="ml-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-bold transition-all shrink-0"
                    >
                        ✕
                    </button>
                </div>
            </div>
            {item.addedByName && (
                <p className="text-sm text-slate-500 dark:text-slate-400 px-2">
                    <span className="font-extrabold">Modificado por:</span> {item.addedByName}
                </p>
            )}
        </div>
    )
})

export const CartItemsList: React.FC<CartItemsListProps> = ({
    items,
    onChangeQuantity,
    onRemove,
}) => {
    return (
        <div className="overflow-y-auto p-4 space-y-3 h-full">
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 gap-4">
                    <div className="text-6xl">📋</div>
                    <p className="text-base font-medium">Carrito vacío</p>
                    <p className="text-sm">Selecciona productos</p>
                </div>
            ) : (
                items.map((item) => (
                    <CartItemComponent
                        key={item.id}
                        item={item}
                        onChangeQuantity={onChangeQuantity}
                        onRemove={onRemove}
                    />
                ))
            )}
        </div>
    )
}

export default CartItemsList
