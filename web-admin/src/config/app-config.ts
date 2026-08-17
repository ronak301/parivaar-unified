// Global app configuration
export const APP_CONFIG = {
  // Cache settings (in milliseconds)
  cache: {
    communities: {
      ttl: 10 * 60 * 1000, // 10 minutes
    },
    members: {
      ttl: 5 * 60 * 1000, // 5 minutes
    },
  },

  // API settings
  api: {
    timeout: 30000, // 30 seconds
  },

  // UI settings
  ui: {
    pageSize: 20,
    debounceDelay: 300, // 300ms for search
  },
} as const;

// Get config from localStorage or use defaults
export function getAppConfig() {
  if (typeof window === 'undefined') return APP_CONFIG;

  try {
    const saved = localStorage.getItem('app_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }

  return APP_CONFIG;
}

export function saveAppConfig(config: Partial<typeof APP_CONFIG>) {
  if (typeof window === 'undefined') return;

  try {
    const merged = { ...APP_CONFIG, ...config };
    localStorage.setItem('app_config', JSON.stringify(merged));
  } catch {
    // ignore
  }
}
