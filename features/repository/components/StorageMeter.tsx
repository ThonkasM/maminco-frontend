import { HardDrive } from 'lucide-react'
import { formatBytes } from '../lib'

/** Totals only: there is no quota yet, so no bar is shown. */
export function StorageMeter({ files, bytes }: { files: number; bytes: number }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground" title="Espacio usado en el repositorio">
            <HardDrive className="size-3.5 text-muted-foreground" aria-hidden="true" />
            {files.toLocaleString('es-BO')} archivo{files === 1 ? '' : 's'} · {formatBytes(bytes)}
        </span>
    )
}
