import { useState, useEffect, useCallback } from "react";

interface ViewPreferences {
  viewMode?: string;
  sortBy?: string;
  itemsPerPage?: number;
  statusFilter?: string;
  [key: string]: any;
}

interface UseViewPreferencesOptions<T extends ViewPreferences> {
  storageKey: string;
  defaults: T;
}

export function useViewPreferences<T extends ViewPreferences>({
  storageKey,
  defaults,
}: UseViewPreferencesOptions<T>) {
  const [preferences, setPreferences] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return { ...defaults, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Error loading view preferences:", error);
    }
    return defaults;
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch (error) {
      console.error("Error saving view preferences:", error);
    }
  }, [storageKey, preferences]);

  const updatePreference = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setPreferences(defaults);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Error clearing view preferences:", error);
    }
  }, [storageKey, defaults]);

  return {
    preferences,
    updatePreference,
    resetToDefaults,
    setPreferences,
  };
}
