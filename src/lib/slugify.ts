// Reserved slugs that conflict with existing routes
export const RESERVED_SLUGS = [
  'auth',
  'reset-password',
  'about',
  'coaches',
  'syndic8',
  'create-claim',
  'coach-dashboard',
  'subscriber-dashboard',
  'admin-dashboard',
  'how-it-works',
  'pricing',
  'success-stories',
  'help',
  'contact',
  'privacy',
  'directory',
  'api',
  'admin',
  'login',
  'signup',
  'register',
];

/**
 * Generates a URL-friendly slug from a name
 * e.g., "Mike Olaski" -> "mike-olaski"
 */
export function generateSlug(name: string): string {
  if (!name || typeof name !== 'string') {
    return `coach-${Date.now()}`;
  }
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
}

/**
 * Checks if a slug is reserved (conflicts with existing routes)
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}

/**
 * Generates a unique slug, appending suffix if needed
 * Used client-side for preview purposes only
 */
export function generateUniqueSlug(name: string, existingSlugs: string[] = []): string {
  let baseSlug = generateSlug(name);
  
  // If empty after sanitization, use fallback
  if (!baseSlug) {
    baseSlug = 'coach';
  }
  
  // If reserved, append '-coach' suffix
  if (isReservedSlug(baseSlug)) {
    baseSlug = `${baseSlug}-coach`;
  }
  
  // Check for uniqueness
  let slug = baseSlug;
  let counter = 2;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}
