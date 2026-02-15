import PocketBase from 'pocketbase'

const SERVER_URL_KEY = 'falimy.serverUrl'

let client: PocketBase | null = null
let clientUrl: string | null = null

const normalizeServerUrl = (url: string): string => url.trim().replace(/\/+$/, '')

/**
 * Get the server URL from localStorage
 */
export const getServerUrl = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(SERVER_URL_KEY)
}

/**
 * Set the server URL in localStorage
 */
export const setServerUrl = (url: string): void => {
  const normalized = normalizeServerUrl(url)
  localStorage.setItem(SERVER_URL_KEY, normalized)
  // Reset client when URL changes
  resetPocketBase()
}

/**
 * Clear the server URL from localStorage
 */
export const clearServerUrl = (): void => {
  localStorage.removeItem(SERVER_URL_KEY)
  resetPocketBase()
}

/**
 * Reset the PocketBase client instance
 */
export const resetPocketBase = (): void => {
  client = null
  clientUrl = null
}

/**
 * Get or create the PocketBase client instance.
 * Uses LocalAuthStore which automatically persists auth to localStorage.
 */
export const getPocketBase = (): PocketBase | null => {
  const url = getServerUrl()
  if (!url) return null

  // Return existing client if URL hasn't changed
  if (client && clientUrl === url) return client

  // Create new client with LocalAuthStore (built-in localStorage persistence)
  const pb = new PocketBase(url)
  pb.autoCancellation(false)

  client = pb
  clientUrl = url
  return pb
}

/**
 * Validate that a server URL is a valid PocketBase instance
 */
export const validateServerUrl = async (url: string): Promise<string> => {
  const normalized = normalizeServerUrl(url)
  
  try {
    const response = await fetch(`${normalized}/api/health`)
    
    if (!response.ok) {
      throw new Error('Unable to reach PocketBase server.')
    }
    
    return normalized
  } catch (error) {
    throw new Error('Unable to reach PocketBase server. Please check the URL and try again.')
  }
}
