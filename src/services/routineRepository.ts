import { RoutineLogEntry } from '../types/routine';
import { StorageService } from '../storage/asyncStorageService';
import { STORAGE_KEYS } from '../storage/storageKeys';

export class RoutineRepository {
  /**
   * Retrieves all logged routine/study sessions.
   */
  static async getLogs(): Promise<RoutineLogEntry[]> {
    const logs = await StorageService.getItem<RoutineLogEntry[]>(STORAGE_KEYS.ROUTINE_LOGS);
    return logs || [];
  }

  /**
   * Adds a new study/focus routine log entry to local storage.
   */
  static async addLog(entry: Omit<RoutineLogEntry, 'id' | 'createdAt'>): Promise<RoutineLogEntry> {
    const current = await this.getLogs();
    const newEntry: RoutineLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...current];
    await StorageService.setItem(STORAGE_KEYS.ROUTINE_LOGS, updated);
    return newEntry;
  }

  /**
   * Deletes a log entry by its unique ID.
   */
  static async deleteLog(id: string): Promise<boolean> {
    const current = await this.getLogs();
    const filtered = current.filter((item) => item.id !== id);
    return await StorageService.setItem(STORAGE_KEYS.ROUTINE_LOGS, filtered);
  }

  /**
   * Retrieves log entries for a specific student ID.
   */
  static async getLogsByStudent(studentId: string): Promise<RoutineLogEntry[]> {
    const current = await this.getLogs();
    return current.filter((item) => item.studentId === studentId);
  }

  /**
   * Clears all routine logs (for testing or profile reset).
   */
  static async clearLogs(): Promise<boolean> {
    return await StorageService.removeItem(STORAGE_KEYS.ROUTINE_LOGS);
  }
}
