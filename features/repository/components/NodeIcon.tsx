import { Archive, File, FileImage, FileSpreadsheet, FileText, Folder, Presentation } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { FileKind } from '../lib'

const ICONS: Record<FileKind, { icon: typeof File; tone: string }> = {
    folder: { icon: Folder, tone: 'bg-warning/15 text-warning' },
    pdf: { icon: FileText, tone: 'bg-danger/15 text-danger' },
    image: { icon: FileImage, tone: 'bg-success/15 text-success' },
    document: { icon: FileText, tone: 'bg-primary/15 text-primary-ink' },
    sheet: { icon: FileSpreadsheet, tone: 'bg-success/15 text-success' },
    slides: { icon: Presentation, tone: 'bg-warning/15 text-warning' },
    text: { icon: FileText, tone: 'bg-surface-muted text-muted-foreground' },
    archive: { icon: Archive, tone: 'bg-surface-muted text-muted-foreground' },
    other: { icon: File, tone: 'bg-surface-muted text-muted-foreground' },
}

export function NodeIcon({ kind, className, size = 36 }: { kind: FileKind; className?: string; size?: number }) {
    const { icon: Icon, tone } = ICONS[kind]
    return (
        <span className={cn('flex shrink-0 items-center justify-center rounded-lg', tone, className)} style={{ width: size, height: size }} aria-hidden="true">
            <Icon style={{ width: Math.round(size * 0.5), height: Math.round(size * 0.5) }} />
        </span>
    )
}
