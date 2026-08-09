/**
 * Unified AI Provider Configuration
 *
 * To switch between providers, change the `AI_PROVIDER` variable:
 *   - 'anthropic' → uses Claude (requires ANTHROPIC_API_KEY)
 *   - 'google'    → uses Gemini (requires GOOGLE_GENERATIVE_AI_API_KEY)
 *
 * The rest of the codebase uses `getAIModel()` and stays completely unchanged.
 */
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

type Provider = 'anthropic' | 'google';

// ─── Change This Line To Switch Providers ────────────────────────────────────
const AI_PROVIDER: Provider = (process.env.AI_PROVIDER as Provider) || 'anthropic';
// ─────────────────────────────────────────────────────────────────────────────

// Model strings per provider
const MODELS: Record<Provider, { fast: string; smart: string }> = {
  anthropic: {
    fast: 'claude-3-5-haiku-20241022',
    smart: 'claude-3-5-sonnet-20241022',
  },
  google: {
    fast: 'gemini-2.0-flash',
    smart: 'gemini-2.5-pro',
  },
};

/**
 * Returns the AI model object for the configured provider.
 * @param tier 'fast' for quick tasks (classify), 'smart' for complex reasoning (ask, reports)
 */
export function getAIModel(tier: 'fast' | 'smart' = 'smart') {
  const modelString = MODELS[AI_PROVIDER][tier];
  if (AI_PROVIDER === 'google') {
    return google(modelString);
  }
  return anthropic(modelString);
}

export { AI_PROVIDER };
