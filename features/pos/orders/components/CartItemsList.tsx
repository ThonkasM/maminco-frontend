'use client'

import React, { memo } from 'react'
import { ClipboardList, Minus, Plus, Trash2 } from 'lucide-react'
import { Button, EmptyState, Input } from '@/components/ui'
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
        <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
                {productName}
            </p>
            <p className="text-sm text-muted-foreground">
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
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted p-3">
                <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="size-8"
                        aria-label="Disminuir cantidad"
                        onClick={() =>
                            onChangeQuantity(item.productId, item.quantity - 1)
                        }
                    >
                        <Minus />
                    </Button>
                    <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        aria-label="Cantidad"
                        onChange={(event) =>
                            onChangeQuantity(
                                item.productId,
                                parseInt(event.target.value, 10) || 1,
                            )
                        }
                        className="h-8 w-12 px-1 text-center font-bold"
                    />
                    <Button
                        variant="secondary"
                        size="icon"
                        className="size-8"
                        aria-label="Aumentar cantidad"
                        onClick={() =>
                            onChangeQuantity(item.productId, item.quantity + 1)
                        }
                    >
                        <Plus />
                    </Button>
                </div>

                <CartItemStaticFields
                    productName={item.productName}
                    unitPrice={item.unitPrice}
                />

                <div className="shrink-0 text-right">
                    <p className="text-lg font-bold text-foreground">
                        {formatCurrency(item.subtotal)}
                    </p>
                </div>

                <Button
                    variant="danger"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label="Eliminar producto"
                    onClick={() => onRemove(item.productId)}
                >
                    <Trash2 />
                </Button>
            </div>
            {item.addedByName && (
                <p className="px-2 text-sm text-muted-foreground">
                    <span className="font-extrabold">Modificado por:</span>{' '}
                    {item.addedByName}
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
        <div className="h-full space-y-3 overflow-y-auto p-4">
            {items.length === 0 ? (
                <EmptyState
                    icon={<ClipboardList />}
                    title="Carrito vacío"
                    description="Selecciona productos para agregarlos a la orden."
                    className="h-full"
                />
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
