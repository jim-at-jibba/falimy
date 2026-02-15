/// <reference path="../pb_data/types.d.ts" />

// POST /api/falimy/extract-recipe
//
// Extracts recipe data from a URL by parsing JSON-LD structured data.
// Returns normalized recipe data that can be used to create a recipe record.
//
// Request body:
//   { url: string }
//
// Success response (200):
//   { title, description, ingredients, steps, prep_time, cook_time, total_time, servings, image_url, source_url }
//
// Error responses:
//   400 - missing/invalid URL
//   401 - unauthenticated
//   422 - no recipe data could be extracted
//   429 - rate limited
//   500 - fetch failure


// Rate limiting: 30 requests per 15 minutes per IP
const extractRecipe_rateLimitStore = new Map();
const extractRecipe_MAX_REQUESTS_PER_WINDOW = 30;
const extractRecipe_WINDOW_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const extractRecipe_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Clean up old entries every hour

let extractRecipe_lastCleanup = Date.now();

function extractRecipe_cleanupRateLimitStore() {
  const now = Date.now();
  if (now - extractRecipe_lastCleanup < extractRecipe_CLEANUP_INTERVAL_MS) return;

  extractRecipe_lastCleanup = now;
  for (const [ip, data] of extractRecipe_rateLimitStore.entries()) {
    if (data.windowStart && data.windowStart + extractRecipe_WINDOW_DURATION_MS < now) {
      extractRecipe_rateLimitStore.delete(ip);
    }
  }
};

function extractRecipe_checkRateLimit(ip) {
  extractRecipe_cleanupRateLimitStore();

  const now = Date.now();
  const entry = extractRecipe_rateLimitStore.get(ip);

  if (!entry) {
    extractRecipe_rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, requestsRemaining: extractRecipe_MAX_REQUESTS_PER_WINDOW - 1 };
  }

  // Check if window has expired, reset if so
  if (entry.windowStart + extractRecipe_WINDOW_DURATION_MS < now) {
    extractRecipe_rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, requestsRemaining: extractRecipe_MAX_REQUESTS_PER_WINDOW - 1 };
  }

  // Check if exceeded limit
  if (entry.count >= extractRecipe_MAX_REQUESTS_PER_WINDOW) {
    const remainingMs = entry.windowStart + extractRecipe_WINDOW_DURATION_MS - now;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return {
      allowed: false,
      message: `Rate limit exceeded. Try again in ${remainingMinutes} minute(s).`,
    };
  }

  // Increment count
  entry.count += 1;
  extractRecipe_rateLimitStore.set(ip, entry);
  return { allowed: true, requestsRemaining: extractRecipe_MAX_REQUESTS_PER_WINDOW - entry.count };
};

// Parse ISO 8601 duration to minutes
// Examples: "PT1H30M", "PT45M", "P1DT2H30M"
function extractRecipe_parseDuration(iso) {
  if (!iso) return null;
  const match = String(iso).match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const days = parseInt(match[1] || "0", 10);
  const hours = parseInt(match[2] || "0", 10);
  const minutes = parseInt(match[3] || "0", 10);
  const seconds = parseInt(match[4] || "0", 10);
  return days * 1440 + hours * 60 + minutes + Math.round(seconds / 60);
};

// Extract image URL from various formats
// Could be: string, array of strings, object with url, or array of objects
function extractRecipe_extractImageUrl(image) {
  if (!image) return null;

  // String
  if (typeof image === "string") {
    return image;
  }

  // Array
  if (Array.isArray(image)) {
    if (image.length === 0) return null;
    const first = image[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && first.url) return first.url;
    return null;
  }

  // Object with url property
  if (typeof image === "object" && image.url) {
    return image.url;
  }

  return null;
};

// Extract servings from recipeYield
// Could be: string, number, or array
function extractRecipe_extractServings(recipeYield) {
  if (!recipeYield) return null;

  if (Array.isArray(recipeYield)) {
    return recipeYield.length > 0 ? String(recipeYield[0]) : null;
  }

  return String(recipeYield);
};

// Extract recipe instructions (steps) from recipeInstructions
// Could be: string, array of strings, array of HowToStep objects, or array of HowToSection objects
function extractRecipe_extractSteps(instructions) {
  if (!instructions) return [];

  // Single string
  if (typeof instructions === "string") {
    return [{ text: instructions.trim(), position: 1 }];
  }

  // Array
  if (Array.isArray(instructions)) {
    const flatSteps = [];

    for (const item of instructions) {
      if (typeof item === "string") {
        flatSteps.push(item.trim());
      } else if (item && typeof item === "object") {
        // HowToSection — contains itemListElement array of HowToStep objects
        if (
          (item["@type"] === "HowToSection" || item.itemListElement) &&
          Array.isArray(item.itemListElement)
        ) {
          for (const subItem of item.itemListElement) {
            const text = subItem.text || subItem.name || "";
            if (text) flatSteps.push(String(text).trim());
          }
        } else {
          // HowToStep or generic object with text/name
          const text = item.text || item.name || "";
          if (text) flatSteps.push(String(text).trim());
        }
      }
    }

    return flatSteps
      .filter((text) => text)
      .map((text, index) => ({ text, position: index + 1 }));
  }

  return [];
};

// Extract ingredients from recipeIngredient array
function extractRecipe_extractIngredients(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return [];

  return ingredients
    .filter((ing) => ing && typeof ing === "string")
    .map((ing) => ({ text: ing.trim() }))
    .filter((ing) => ing.text);
};

// Find Recipe object in JSON-LD data
// Could be direct Recipe object, nested in @graph array, or in a top-level array
function extractRecipe_findRecipeObject(jsonLd) {
  if (!jsonLd || typeof jsonLd !== "object") return null;

  // Top-level array — search each element recursively
  if (Array.isArray(jsonLd)) {
    for (const item of jsonLd) {
      const found = extractRecipe_findRecipeObject(item);
      if (found) return found;
    }
    return null;
  }

  // Direct Recipe type
  if (jsonLd["@type"] === "Recipe") {
    return jsonLd;
  }

  // Array of types (some sites use ["Recipe", "Article"])
  if (Array.isArray(jsonLd["@type"]) && jsonLd["@type"].includes("Recipe")) {
    return jsonLd;
  }

  // Check @graph array
  if (Array.isArray(jsonLd["@graph"])) {
    for (const item of jsonLd["@graph"]) {
      const found = extractRecipe_findRecipeObject(item);
      if (found) return found;
    }
  }

  return null;
};

// Try to extract recipe from microdata as fallback
// Looks for itemscope with itemtype containing schema.org/Recipe
function extractRecipe_extractMicrodataRecipe(html) {
  // Find the recipe container
  const recipeMatch = html.match(/<[^>]*itemtype\s*=\s*["']https?:\/\/schema\.org\/Recipe["'][^>]*>/i);
  if (!recipeMatch) return null;

  // Find the bounds of the recipe itemscope
  const startIndex = html.indexOf(recipeMatch[0]);
  if (startIndex === -1) return null;

  // Simple extraction: find everything up to the closing tag (this is imperfect but works for basic cases)
  // We'll look for itemprop attributes within a reasonable range
  const searchRange = html.substring(startIndex, startIndex + 50000);

  const recipe = {
    name: null,
    description: null,
    recipeIngredient: [],
    recipeInstructions: [],
  };

  // Extract name
  const nameMatch = searchRange.match(/itemprop\s*=\s*["']name["'][^>]*>([^<]*)</i);
  if (nameMatch) recipe.name = nameMatch[1].trim();

  // Extract description
  const descMatch = searchRange.match(/itemprop\s*=\s*["']description["'][^>]*>([^<]*)</i);
  if (descMatch) recipe.description = descMatch[1].trim();

  // Extract ingredients
  const ingredientMatches = searchRange.matchAll(/itemprop\s*=\s*["']recipeIngredient["'][^>]*>([^<]*)</gi);
  for (const match of ingredientMatches) {
    recipe.recipeIngredient.push(match[1].trim());
  }

  // Extract instructions
  const instructionMatches = searchRange.matchAll(/itemprop\s*=\s*["']text["'][^>]*>([^<]*)</gi);
  for (const match of instructionMatches) {
    recipe.recipeInstructions.push(match[1].trim());
  }

  // Check if we found enough data
  if (!recipe.name && recipe.recipeIngredient.length === 0) {
    return null;
  }

  return recipe;
};

// Extract normalized recipe data from a Recipe object
function extractRecipe_normalizeRecipe(recipe, sourceUrl) {
  return {
    title: recipe.name || null,
    description: recipe.description || null,
    ingredients: extractRecipe_extractIngredients(recipe.recipeIngredient),
    steps: extractRecipe_extractSteps(recipe.recipeInstructions),
    prep_time: extractRecipe_parseDuration(recipe.prepTime),
    cook_time: extractRecipe_parseDuration(recipe.cookTime),
    total_time: extractRecipe_parseDuration(recipe.totalTime),
    servings: extractRecipe_extractServings(recipe.recipeYield),
    image_url: extractRecipe_extractImageUrl(recipe.image),
    source_url: sourceUrl,
  };
};

routerAdd("POST", "/api/falimy/extract-recipe", (e) => {
  try {
    // Check authentication (e.auth is automatically populated from Authorization header)
    const authRecord = e.auth;
    if (!authRecord) {
      return e.json(401, { message: "Authentication required." });
    }

    // Check rate limit
    const ip = e.realIP();
    const rateCheck = extractRecipe_checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return e.json(429, { message: rateCheck.message });
    }

  // Get request body
  const body = e.requestInfo().body;
  const url = String(body.url || "").trim();

  // Validate URL
  if (!url) {
    return e.json(400, { message: "URL is required." });
  }

  // Check if URL is valid HTTP/HTTPS using regex (Goja doesn't have URL constructor)
  const urlPattern = /^https?:\/\/.+/i;
  if (!urlPattern.test(url)) {
    return e.json(400, { message: "URL must be a valid HTTP or HTTPS URL." });
  }

  // Extract hostname for SSRF check using regex
  const hostnameMatch = url.match(/^https?:\/\/([^/:]+)/i);
  if (!hostnameMatch) {
    return e.json(400, { message: "Invalid URL format." });
  }
  const hostname = hostnameMatch[1].toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "0.0.0.0" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("169.254.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    return e.json(400, { message: "Cannot fetch from internal or private network addresses." });
  }

  // Fetch HTML from the URL
  let response;
  try {
    response = $http.send({
      url: url,
      method: "GET",
      headers: {
        "User-Agent": "Falimy/1.0 (Recipe Extractor)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15,
    });
  } catch (err) { console.log("[extract-recipe] URL parse error:", err, "URL was:", url);
    return e.json(500, { message: "Failed to fetch the URL: " + String(err) });
  }

  // Check response status
  if (response.statusCode !== 200) {
    return e.json(500, { message: `Failed to fetch the URL: HTTP ${response.statusCode}` });
  }

  const html = response.raw;
  if (!html || typeof html !== "string") {
    return e.json(422, { message: "No content received from the URL." });
  }

  // Find JSON-LD script blocks using regex
  const jsonLdRegex = /<script\s+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let recipe = null;

  let jsonLdMatch;
  while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
    const jsonLdContent = jsonLdMatch[1];
    if (!jsonLdContent) continue;

    try {
      const jsonLd = JSON.parse(jsonLdContent);
      const recipeObj = extractRecipe_findRecipeObject(jsonLd);
      if (recipeObj) {
        recipe = recipeObj;
        break;
      }
    } catch (parseErr) {
      // Invalid JSON, skip this block
      continue;
    }
  }

  // If no JSON-LD recipe found, try microdata fallback
  if (!recipe) {
    recipe = extractRecipe_extractMicrodataRecipe(html);
  }

  // If still no recipe, return error
  if (!recipe) {
    return e.json(422, {
      message: "No recipe data found on this page. Please enter the recipe manually.",
    });
  }

  // Normalize and return the recipe data
  const normalizedRecipe = extractRecipe_normalizeRecipe(recipe, url);

  // Check if we have minimum required data
  if (!normalizedRecipe.title && normalizedRecipe.ingredients.length === 0 && normalizedRecipe.steps.length === 0) {
    return e.json(422, {
      message: "Could not extract useful recipe data from this page. Please enter the recipe manually.",
    });
  }

  return e.json(200, normalizedRecipe);
  } catch (err) { console.log("[extract-recipe] URL parse error:", err, "URL was:", url);
    console.error("[extract-recipe] Error:", err);
    return e.json(500, { message: "Internal error: " + String(err) });
  }
});

