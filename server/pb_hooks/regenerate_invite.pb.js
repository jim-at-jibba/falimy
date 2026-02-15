/// <reference path="../pb_data/types.d.ts" />

/**
 * Regenerate family invite code endpoint
 * 
 * POST /api/falimy/regenerate-invite
 * 
 * Generates a new invite code for the authenticated user's family.
 * Only admin users can regenerate invite codes.
 */

// Rate limiting state (in-memory, resets on server restart)
const rateLimits = new Map()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5

/**
 * Generate a secure random invite code
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed ambiguous chars
  const length = 8
  let code = ''
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    code += chars[randomIndex]
  }
  
  return code
}

/**
 * Check rate limit for user
 */
function checkRateLimit(userId) {
  const now = Date.now()
  const userKey = `regenerate:${userId}`
  
  if (!rateLimits.has(userKey)) {
    rateLimits.set(userKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  const limit = rateLimits.get(userKey)
  
  // Reset if window expired
  if (now > limit.resetAt) {
    rateLimits.set(userKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  // Check if under limit
  if (limit.count < MAX_REQUESTS_PER_WINDOW) {
    limit.count++
    return true
  }
  
  return false
}

routerAdd('POST', '/api/falimy/regenerate-invite', (e) => {
  // Check authentication
  const authRecord = e.auth
  if (!authRecord) {
    throw new ForbiddenError('Authentication required')
  }
  
  // Check rate limit
  if (!checkRateLimit(authRecord.id)) {
    throw new BadRequestError('Too many requests. Please try again later.')
  }
  
  // Check if user has a family
  if (!authRecord.get('family_id')) {
    throw new BadRequestError('User is not part of a family')
  }
  
  // Check if user is admin
  if (authRecord.get('role') !== 'admin') {
    throw new ForbiddenError('Only admins can regenerate invite codes')
  }
  
  const familyId = authRecord.get('family_id')
  
  try {
    // Get current family record
    const family = $app.findRecordById('families', familyId)
    
    // Generate new invite code
    let newInviteCode
    let attempts = 0
    const maxAttempts = 10
    
    // Keep trying until we get a unique code
    while (attempts < maxAttempts) {
      newInviteCode = generateInviteCode()
      
      // Check if code already exists
      try {
        $app.findFirstRecordByFilter('families', `invite_code = "${newInviteCode}"`)
        // Code exists, try again
        attempts++
      } catch (notFoundErr) {
        // Code is unique, break
        break
      }
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique invite code')
    }
    
    // Update family with new invite code
    family.set('invite_code', newInviteCode)
    $app.save(family)
    
    // Return success
    return e.json(200, {
      success: true,
      invite_code: newInviteCode,
      family_id: familyId,
    })
    
  } catch (err) {
    console.error('Error regenerating invite code:', err)
    throw new BadRequestError('Failed to regenerate invite code: ' + String(err))
  }
}, $apis.requireAuth())
