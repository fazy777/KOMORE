import { UserProfile } from '../types/profile';
import { StorageService } from '../storage/asyncStorageService';
import { STORAGE_KEYS } from '../storage/storageKeys';

export class ProfileRepository {
  /**
   * Retrieves the current student profile from local storage.
   */
  static async getProfile(): Promise<UserProfile | null> {
    return await StorageService.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  }

  /**
   * Saves or updates the student profile locally.
   * Can be configured to sync upstream to the Node.js / PostgreSQL backend.
   */
  static async saveProfile(profile: UserProfile): Promise<boolean> {
    const updated: UserProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    return await StorageService.setItem(STORAGE_KEYS.USER_PROFILE, updated);
  }

  /**
   * Partially updates existing profile.
   */
  static async updateProfile(partial: Partial<UserProfile>): Promise<UserProfile | null> {
    const current = await this.getProfile();
    if (!current) {
      return null;
    }

    const updated: UserProfile = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    const success = await this.saveProfile(updated);
    return success ? updated : null;
  }

  /**
   * Clears the stored user profile (e.g. on logout/reset).
   */
  static async clearProfile(): Promise<boolean> {
    return await StorageService.removeItem(STORAGE_KEYS.USER_PROFILE);
  }

  /**
   * Checks if user has completed the onboarding flow.
   */
  static async isOnboarded(): Promise<boolean> {
    const profile = await this.getProfile();
    return !!profile && profile.isOnboarded;
  }
}
