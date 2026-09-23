import {
    CheckCircle2,
    CircleDollarSign,
    History,
    MinusCircle,
    Pencil,
    PlusCircle,
    Tag,
    Utensils,
    type LucideIcon,
} from 'lucide-react'

export function orderActionMeta(action: string): {
    Icon: LucideIcon
    className: string
} {
    const value = action.toUpperCase()
    if (value.includes('CREATE'))
        return { Icon: PlusCircle, className: 'text-primary' }
    if (value.includes('STATUS') || value.includes('CLOSE'))
        return { Icon: CheckCircle2, className: 'text-success' }
    if (
        value.includes('CANCEL') ||
        value.includes('REMOVE') ||
        value.includes('DELETE')
    )
        return { Icon: MinusCircle, className: 'text-danger' }
    if (value.includes('DISCOUNT'))
        return { Icon: Tag, className: 'text-warning' }
    if (value.includes('TIP'))
        return { Icon: CircleDollarSign, className: 'text-success' }
    if (value.includes('ITEM') || value.includes('PRODUCT'))
        return { Icon: Utensils, className: 'text-muted-foreground' }
    if (value.includes('UPDATE') || value.includes('EDIT'))
        return { Icon: Pencil, className: 'text-muted-foreground' }
    return { Icon: History, className: 'text-muted-foreground' }
}

export function OrderActionIcon({ action }: { action: string }) {
    const { Icon, className } = orderActionMeta(action)
    return <Icon className={`size-4 shrink-0 ${className}`} aria-hidden="true" />
}
