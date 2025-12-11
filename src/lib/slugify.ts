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

// Diacritics/accented characters to ASCII mapping
const DIACRITICS_MAP: Record<string, string> = {
  // Slovak/Czech
  'á': 'a', 'ä': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'ě': 'e', 'í': 'i', 'ĺ': 'l', 
  'ľ': 'l', 'ň': 'n', 'ó': 'o', 'ô': 'o', 'ŕ': 'r', 'ř': 'r', 'š': 's', 'ť': 't', 
  'ú': 'u', 'ů': 'u', 'ý': 'y', 'ž': 'z',
  // German
  'ö': 'o', 'ü': 'u', 'ß': 'ss',
  // French
  'à': 'a', 'â': 'a', 'æ': 'ae', 'ç': 'c', 'è': 'e', 'ê': 'e', 'ë': 'e', 
  'î': 'i', 'ï': 'i', 'ò': 'o', 'œ': 'oe', 'ù': 'u', 'û': 'u', 'ÿ': 'y',
  // Spanish/Portuguese
  'ã': 'a', 'ñ': 'n', 'õ': 'o',
  // Polish
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ś': 's', 'ź': 'z', 'ż': 'z',
  // Nordic
  'å': 'a', 'ø': 'o',
  // Turkish
  'ğ': 'g', 'ı': 'i', 'ş': 's',
  // Uppercase versions
  'Á': 'a', 'Ä': 'a', 'Č': 'c', 'Ď': 'd', 'É': 'e', 'Ě': 'e', 'Í': 'i', 'Ĺ': 'l',
  'Ľ': 'l', 'Ň': 'n', 'Ó': 'o', 'Ô': 'o', 'Ŕ': 'r', 'Ř': 'r', 'Š': 's', 'Ť': 't',
  'Ú': 'u', 'Ů': 'u', 'Ý': 'y', 'Ž': 'z', 'Ö': 'o', 'Ü': 'u', 'À': 'a', 'Â': 'a',
  'Æ': 'ae', 'Ç': 'c', 'È': 'e', 'Ê': 'e', 'Ë': 'e', 'Î': 'i', 'Ï': 'i', 'Ò': 'o',
  'Œ': 'oe', 'Ù': 'u', 'Û': 'u', 'Ÿ': 'y', 'Ã': 'a', 'Ñ': 'n', 'Õ': 'o', 'Ą': 'a',
  'Ć': 'c', 'Ę': 'e', 'Ł': 'l', 'Ń': 'n', 'Ś': 's', 'Ź': 'z', 'Ż': 'z', 'Å': 'a',
  'Ø': 'o', 'Ğ': 'g', 'İ': 'i', 'Ş': 's',
};

/**
 * Transliterates diacritics/accented characters to ASCII equivalents
 */
function transliterate(str: string): string {
  return str.split('').map(char => DIACRITICS_MAP[char] || char).join('');
}

/**
 * Generates a URL-friendly slug from a name
 * e.g., "Mike Olaski" -> "mike-olaski"
 * e.g., "Ľuboš Džubák" -> "lubos-dzubak"
 */
export function generateSlug(name: string): string {
  if (!name || typeof name !== 'string') {
    return `coach-${Date.now()}`;
  }
  
  return transliterate(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove remaining special characters
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
