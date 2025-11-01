import type { UserPreferences } from './types';
import { DEFAULT_PREFERENCES } from './defaults';

const STORAGE_KEY = 'app.preferences.v1';
const STORAGE_VERSION = 1;

interface StoredPreferences {
  version: number;
  data: UserPreferences;
}

export const PreferencesStorage = {
  load(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return DEFAULT_PREFERENCES;
      }

      const parsed: StoredPreferences = JSON.parse(stored);
      
      // Version check - if version mismatch, reset to defaults
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('Preferences version mismatch, resetting to defaults');
        return DEFAULT_PREFERENCES;
      }

      // Merge with defaults to ensure new fields exist
      return deepMerge(DEFAULT_PREFERENCES, parsed.data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  },

  save(preferences: UserPreferences): void {
    try {
      const toStore: StoredPreferences = {
        version: STORAGE_VERSION,
        data: preferences,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear preferences:', error);
    }
  },

  export(): string {
    const preferences = this.load();
    return JSON.stringify(preferences, null, 2);
  },

  import(jsonString: string): UserPreferences | null {
    try {
      const parsed = JSON.parse(jsonString);
      // Validate it's a preferences object by checking for required keys
      if (parsed && typeof parsed === 'object' && 'notifications' in parsed) {
        const merged = deepMerge(DEFAULT_PREFERENCES, parsed);
        this.save(merged);
        return merged;
      }
      throw new Error('Invalid preferences format');
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return null;
    }
  },
};

function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];
    
    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as any;
    }
  }
  
  return result;
}

