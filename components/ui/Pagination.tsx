'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from './Button'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  /** Number of sibling pages shown around the current page. */
  siblingCount?: number
}

function buildPages(page: number, totalPages: number, siblingCount: number) {
  const pages: (number | 'ellipsis')[] = []
  const start = Math.max(2, page - siblingCount)
  const end = Math.min(totalPages - 1, page + siblingCount)

  pages.push(1)
  if (start > 2) pages.push('ellipsis')
  for (let i = start; i <= end; i += 1) pages.push(i)
  if (end < totalPages - 1) pages.push('ellipsis')
  if (totalPages > 1) pages.push(totalPages)

  return pages
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPages(page, totalPages, siblingCount)

  return (
    <nav
      aria-label="Paginación"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft />
      </Button>

      {pages.map((item, index) =>
        item === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="px-2 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? 'primary' : 'ghost'}
            size="icon"
            onClick={() => onPageChange(item)}
            aria-label={`Ir a la página ${item}`}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}
