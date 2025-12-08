// Webhook configuration
// URLs are loaded from environment variables for easy configuration

export const WEBHOOKS = {
  PERSONA_CHAT: import.meta.env.VITE_PERSONA_CHAT_WEBHOOK || "",
} as const;
