import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { QueuedOperation } from '../../types/sync';

interface QueueDB extends DBSchema {
  queue: {
    key: string;
    value: QueuedOperation;
    indexes: { 'by-timestamp': number };
  };
}

export class OfflineQueue {
  private db: IDBPDatabase<QueueDB> | null = null;
  private readonly DB_NAME = 'pricing-calculator-queue';
  private readonly STORE_NAME = 'queue';
  private readonly MAX_RETRIES = 3;

  /**
   * Initializes the IndexedDB database.
   */
  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<QueueDB>(this.DB_NAME, 1, {
      upgrade(db) {
        const store = db.createObjectStore('queue', {
          keyPath: 'id',
        });
        store.createIndex('by-timestamp', 'timestamp');
      },
    });
  }

  /**
   * Enqueues a new operation.
   */
  async enqueue(
    operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<QueuedOperation> {
    await this.ensureInitialized();
    
    const newOperation: QueuedOperation = {
      ...operation,
      id: crypto.randomUUID?.() || Math.random().toString(36).substring(2),
      timestamp: Date.now(),
      retryCount: 0,
    };

    await this.db!.add(this.STORE_NAME, newOperation);
    return newOperation;
  }

  /**
   * Retrieves the oldest queued operation (FIFO).
   */
  async getOldest(): Promise<QueuedOperation | undefined> {
    await this.ensureInitialized();
    const index = this.db!.transaction(this.STORE_NAME).store.index('by-timestamp');
    const cursor = await index.openCursor();
    return cursor?.value;
  }

  /**
   * Removes a processed operation from the queue.
   */
  async remove(id: string): Promise<void> {
    await this.ensureInitialized();
    await this.db!.delete(this.STORE_NAME, id);
  }

  /**
   * Retrieves all queued operations.
   */
  async getAll(): Promise<QueuedOperation[]> {
    await this.ensureInitialized();
    return this.db!.getAll(this.STORE_NAME);
  }

  /**
   * Clears the entire queue.
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();
    await this.db!.clear(this.STORE_NAME);
  }

  /**
   * Returns the current queue count.
   */
  async getCount(): Promise<number> {
    await this.ensureInitialized();
    return this.db!.count(this.STORE_NAME);
  }

  /**
   * Updates an existing operation (e.g., to increment retry count).
   */
  async update(operation: QueuedOperation): Promise<void> {
    await this.ensureInitialized();
    await this.db!.put(this.STORE_NAME, operation);
  }

  /**
   * Processes the next operation in the queue using the provided processor function.
   * Implements retry logic and exponential backoff.
   */
  async processNext(
    processor: (operation: QueuedOperation) => Promise<void>
  ): Promise<boolean> {
    const operation = await this.getOldest();
    if (!operation) return false;

    // Check if we should wait due to exponential backoff
    if (operation.retryCount > 0 && operation.lastAttemptAt) {
      const waitTime = Math.pow(2, operation.retryCount) * 1000; // 2s, 4s, 8s...
      const elapsed = Date.now() - operation.lastAttemptAt;
      if (elapsed < waitTime) {
        return false; // Too early to retry
      }
    }

    // Mark attempt
    const attemptingOperation = {
      ...operation,
      lastAttemptAt: Date.now(),
    };
    await this.update(attemptingOperation);

    try {
      await processor(attemptingOperation);
      await this.remove(operation.id);
      return true;
    } catch (error) {
      const updatedOperation: QueuedOperation = {
        ...attemptingOperation,
        retryCount: operation.retryCount + 1,
        lastError: error instanceof Error ? error.message : String(error),
      };

      if (updatedOperation.retryCount >= this.MAX_RETRIES) {
        console.error(
          `Operation ${operation.id} failed after ${this.MAX_RETRIES} attempts. Removing from queue.`,
          error
        );
        await this.remove(operation.id);
      } else {
        await this.update(updatedOperation);
      }
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
  }
}

export const offlineQueue = new OfflineQueue();
