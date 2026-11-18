'use client'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    asList,
    createFolder,
    deleteNode,
    deleteNodePermanently,
    getNodes,
    getTrash,
    getUsage,
    restoreNode,
    searchNodes,
    updateNode,
    uploadFiles,
} from './api'

const ROOT = ['repository'] as const

export function useNodes(parentId: string | null, enabled = true) {
    return useQuery({
        queryKey: [...ROOT, 'nodes', parentId],
        queryFn: ({ signal }) => getNodes(parentId, signal),
        placeholderData: keepPreviousData,
        enabled,
    })
}

export function useTrash(enabled: boolean) {
    return useQuery({ queryKey: [...ROOT, 'trash'], queryFn: async ({ signal }) => asList(await getTrash(signal)), enabled })
}

export function useSearch(term: string) {
    return useQuery({
        queryKey: [...ROOT, 'search', term],
        queryFn: async ({ signal }) => asList(await searchNodes(term, signal)),
        enabled: term.length >= 2,
        placeholderData: keepPreviousData,
    })
}

export function useUsage() {
    return useQuery({ queryKey: [...ROOT, 'usage'], queryFn: ({ signal }) => getUsage(signal) })
}

function useRepositoryMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>, success: string | ((vars: TVars) => string), failure: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: fn,
        onSuccess: (_data, vars) => {
            toast.success(typeof success === 'function' ? success(vars) : success)
            void queryClient.invalidateQueries({ queryKey: ROOT })
        },
        onError: (error) => toast.error(getErrorMessage(error, failure)),
    })
}

export const useCreateFolder = () =>
    useRepositoryMutation(createFolder, (vars: { parentId: string | null; name: string }) => `Carpeta «${vars.name}» creada.`, 'No se pudo crear la carpeta.')

export const useUpload = () =>
    useRepositoryMutation(
        ({ parentId, files }: { parentId: string | null; files: File[] }) => uploadFiles(parentId, files),
        (vars) => (vars.files.length === 1 ? 'Archivo subido.' : `${vars.files.length} archivos subidos.`),
        'No se pudo subir el archivo.',
    )

export const useUpdateNode = () =>
    useRepositoryMutation(
        ({ id, name, parentId }: { id: string; name?: string; parentId?: string | null; label: string }) =>
            updateNode(id, { ...(name !== undefined ? { name } : {}), ...(parentId !== undefined ? { parentId } : {}) }),
        (vars) => vars.label,
        'No se pudo guardar el cambio.',
    )

export const useDeleteNode = () => useRepositoryMutation(({ id }: { id: string; name: string }) => deleteNode(id), (vars) => `«${vars.name}» pasó a la papelera.`, 'No se pudo eliminar.')

export const useRestoreNode = () => useRepositoryMutation(({ id }: { id: string; name: string }) => restoreNode(id), (vars) => `«${vars.name}» fue restaurado.`, 'No se pudo restaurar.')

export const useDeletePermanently = () =>
    useRepositoryMutation(({ id }: { id: string; name: string }) => deleteNodePermanently(id), (vars) => `«${vars.name}» se eliminó para siempre.`, 'No se pudo eliminar.')
