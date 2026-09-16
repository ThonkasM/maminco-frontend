import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json({ error: 'Token required' }, { status: 400 })
        }

        // Create response with Set-Cookie header
        const response = NextResponse.json({ success: true })

        // Set HTTP-only cookie (more secure)
        const d = new Date()
        d.setDate(d.getDate() + 7)

        response.cookies.set('token', token, {
            path: '/',
            expires: d,
            httpOnly: false, // Keep false to allow client-side JS to read it
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'lax',
        })

        console.log('✅ [SET-TOKEN API] Cookie establecida en servidor')

        return response
    } catch (error) {
        console.error('❌ [SET-TOKEN API] Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
