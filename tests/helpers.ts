export function makeToken(claims: Record<string, unknown>): string {
    const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
    return `${b64({ alg: 'HS256' })}.${b64(claims)}.sig`
}
