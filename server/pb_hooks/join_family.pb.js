/// <reference path="../pb_data/types.d.ts" />

// POST /api/falimy/join
//
// Validates an invite code server-side and creates a new user account
// in a single request. The invite code never leaves the server.
//
// Request body:
//   { familyId, inviteCode, email, password, name }
//
// Success response (200):
//   { token, record }
//
// Error responses:
//   400 - missing/invalid fields
//   401 - invalid invite code
//   404 - family not found
//   409 - email already in use
//   429 - too many attempts (rate limited)
//   500 - unexpected error

// Rate limiting for invite code attempts
// Store: Map<ip, { attempts: number, lockedUntil: number }>
const rateLimitStore = new Map();
const MAX_ATTEMPTS = 5; // Maximum failed attempts per IP
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Clean up old entries every hour

// Cleanup old entries periodically
let lastCleanup = Date.now();
const cleanupRateLimitStore = () => {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  
  lastCleanup = now;
  for (const [ip, data] of rateLimitStore.entries()) {
    if (data.lockedUntil && data.lockedUntil < now) {
      rateLimitStore.delete(ip);
    }
  }
};

const checkRateLimit = (ip) => {
  cleanupRateLimitStore();
  
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  
  if (!entry) return { allowed: true, attemptsLeft: MAX_ATTEMPTS };
  
  // Check if locked out
  if (entry.lockedUntil && entry.lockedUntil > now) {
    const remainingMs = entry.lockedUntil - now;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return {
      allowed: false,
      message: `Too many failed attempts. Try again in ${remainingMinutes} minute(s).`,
    };
  }
  
  // Check if exceeded attempts
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
    rateLimitStore.set(ip, entry);
    return {
      allowed: false,
      message: `Too many failed attempts. Try again in ${Math.ceil(LOCKOUT_DURATION_MS / 60000)} minutes.`,
    };
  }
  
  return { allowed: true, attemptsLeft: MAX_ATTEMPTS - entry.attempts };
};

const recordFailedAttempt = (ip) => {
  const entry = rateLimitStore.get(ip) || { attempts: 0, lockedUntil: null };
  entry.attempts += 1;
  rateLimitStore.set(ip, entry);
};

const resetAttempts = (ip) => {
  rateLimitStore.delete(ip);
};

routerAdd("POST", "/api/falimy/join", (e) => {
  // Get client IP for rate limiting
  const ip = e.realIP();
  
  // Check rate limit
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return e.json(429, {
      message: rateCheck.message,
    });
  }
  const body = e.requestInfo().body;

  const familyId = String(body.familyId || "").trim();
  const inviteCode = String(body.inviteCode || "").trim();
  const email = String(body.email || "").trim();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();

  // --- Validate required fields ---
  if (!familyId || !inviteCode || !email || !password || !name) {
    return e.json(400, {
      message: "All fields are required: familyId, inviteCode, email, password, name.",
    });
  }

  if (password.length < 8) {
    return e.json(400, {
      message: "Password must be at least 8 characters.",
    });
  }

  // --- Look up the family ---
  let family;
  try {
    family = $app.findRecordById("families", familyId);
  } catch (err) {
    return e.json(404, {
      message: "Family not found. Check the Family ID.",
    });
  }

  // --- Validate invite code server-side ---
  const actualCode = family.get("invite_code");
  if (!actualCode || String(actualCode) !== inviteCode) {
    recordFailedAttempt(ip);
    return e.json(401, {
      message: "Invalid invite code. Please check and try again.",
      attemptsRemaining: MAX_ATTEMPTS - (rateLimitStore.get(ip)?.attempts || 0),
    });
  }

  // --- Create the user record ---
  let user;
  try {
    const usersCollection = $app.findCollectionByNameOrId("users");
    user = new Record(usersCollection);
    user.set("email", email);
    user.set("name", name);
    user.setPassword(password);
    user.set("role", "member");
    user.set("family_id", family.id);
    user.set("verified", false);

    $app.save(user);
  } catch (err) {
    const errStr = String(err);
    if (errStr.includes("unique") || errStr.includes("email")) {
      return e.json(409, {
        message: "Email already in use. Try logging in instead.",
      });
    }
    return e.json(500, {
      message: "Could not create account. " + errStr,
    });
  }

  // --- Generate auth token ---
  let token;
  try {
    token = user.newAuthToken();
  } catch (err) {
    return e.json(500, {
      message: "Account created but failed to generate auth token. Try logging in.",
    });
  }

  // Reset rate limit on successful join
  resetAttempts(ip);

  return e.json(200, {
    token: token,
    record: user,
  });
});
