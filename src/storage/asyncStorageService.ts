import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  /**
   * Retrieves and parses JSON data stored at a specific key.
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const rawValue = await AsyncStorage.getItem(key);
      if (!rawValue) {
        return null;
      }
      return JSON.parse(rawValue) as T;
    } catch (error) {
      console.error(`[StorageService] Error getting item for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Serializes and persists data under a key.
   */
  static async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      await AsyncStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`[StorageService] Error setting item for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Removes data under a key.
   */
  static async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[StorageService] Error removing key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clears all storage keys.
   */
  static async clearAll(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('[StorageService] Error clearing storage:', error);
      return false;
    }
  }
}
