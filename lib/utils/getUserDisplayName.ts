/**
 * Utility function to get a display name for a user with intelligent fallbacks
 * Priority: name > email prefix > generic fallback
 * 
 * @param user - User object with optional name and email
 * @returns Display name string
 */
export function getUserDisplayName(user: { name?: string; email?: string } | null): string {
    if (!user) return 'Usuario'

    // 1. Use full name if available
    if (user.name && user.name.trim()) {
        return user.name.trim()
    }

    // 2. Extract email prefix if available
    if (user.email) {
        const emailPrefix = user.email.split('@')[0]
        if (emailPrefix && emailPrefix.trim()) {
            return emailPrefix
        }
    }

    // 3. Fallback to generic name
    return 'Usuario'
}
