import { describe, expect, it } from 'vitest'
import { buildContentSecurityPolicy } from '../next.config'

describe('Content-Security-Policy', () => {
  const csp = buildContentSecurityPolicy()

  it('restricts the default source and blocks plugins and framing by other origins', () => {
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("frame-ancestors 'self'")
    expect(csp).toContain("base-uri 'self'")
  })

  it('does not allow eval outside development', () => {
    expect(csp).not.toContain("'unsafe-eval'")
  })

  it('allows framing the presigned S3 documents used by the repository preview', () => {
    expect(csp).toMatch(/frame-src [^;]*'self'/)
    expect(csp).toContain('https://*.s3.us-east-1.amazonaws.com')
    expect(csp).toContain('https://*.s3.amazonaws.com')
  })

  it('allows the API and socket origins configured at build time', () => {
    expect(csp).toMatch(/connect-src [^;]*'self'/)
  })
})
