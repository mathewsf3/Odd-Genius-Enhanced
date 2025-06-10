// Setup Emotion cache for Chakra UI
import createCache from '@emotion/cache';
import { isBrowser } from '@chakra-ui/utils';

export const defaultCacheKey = 'chakra-ui';

interface CreateCacheOptions {
  key: string;
  container?: HTMLElement;
}

export function createEmotionCache(options: CreateCacheOptions = { key: defaultCacheKey }) {
  const { key, container } = options;  return createCache({ 
    key, 
    container,
    // Use speedy option for performance
    speedy: true 
  });
}

export const defaultCache = isBrowser ? createEmotionCache() : null;
