/**
 * File: repository.ts
 * Generic storage for a list of records on the phone (AsyncStorage).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Repository<T extends { id: string }> {
  list(): Promise<T[]>;
  saveAll(items: T[]): Promise<void>;
}

/**
 * A list of records kept as JSON under one AsyncStorage key.
 * Data lives on the phone for now. When the Express/PostgreSQL backend is connected,
 * only this file (and the repositories built from it) has to change.
 */
export function createRepository<T extends { id: string }>(
  key: string,
): Repository<T> {
  return {
    /** Reads every saved record (empty list if nothing is saved or the data is damaged). */
    async list() {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) {
        return [];
      }
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as T[]) : [];
      } catch {
        return [];
      }
    },
    /** Replaces all saved records with the given list. */
    async saveAll(items) {
      await AsyncStorage.setItem(key, JSON.stringify(items));
    },
  };
}
