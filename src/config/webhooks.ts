// Webhook configuration
// Note: Webhook URLs should be called through edge functions only
// The edge function retrieves the URL from secure environment variables

export const WEBHOOKS = {
  // Persona chat webhook is now handled server-side in persona-chat edge function
  // This constant is kept for backwards compatibility but should not be used directly
  PERSONA_CHAT: "/functions/v1/persona-chat",
} as const;
