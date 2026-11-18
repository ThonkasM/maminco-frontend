'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

type RevealProps = React.HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'li' | 'section' | 'article'
  delay?: number
}

export function Reveal({
  as: Tag = 'div',
  delay = 0,
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLElement>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-visible={visible}
      className={cn('reveal', className)}
      style={{ ...style, ['--reveal-delay' as string]: `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  )
}
