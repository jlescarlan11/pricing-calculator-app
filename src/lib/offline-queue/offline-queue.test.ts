import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { OfflineQueue } from './offline-queue';
import type { QueuedOperation } from '../../types/sync';

describe('OfflineQueue', () => {
  let queue: OfflineQueue;

  beforeEach(async () => {
    queue = new OfflineQueue();
    // We need to clear the DB or use a unique name for each test if we want complete isolation
    // Since fake-indexeddb is global, clearing it is better.
    await queue.initialize();
    await queue.clear();
  });

  it('should enqueue an operation with generated id and timestamp', async () => {
    const op = {
      type: 'create' as const,
      presetId: 'preset-1',
      payload: { name: 'Test' },
    };

    const enqueued = await queue.enqueue(op);

    expect(enqueued.id).toBeDefined();
    expect(enqueued.timestamp).toBeLessThanOrEqual(Date.now());
    expect(enqueued.retryCount).toBe(0);
    expect(enqueued.type).toBe('create');
    expect(enqueued.presetId).toBe('preset-1');

    const count = await queue.getCount();
    expect(count).toBe(1);
  });

  it('should retrieve the oldest operation (FIFO)', async () => {
    await queue.enqueue({ type: 'create', presetId: '1' });
    // Ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));
    await queue.enqueue({ type: 'create', presetId: '2' });

    const oldest = await queue.getOldest();
    expect(oldest?.presetId).toBe('1');
  });

  it('should remove an operation by id', async () => {
    const op = await queue.enqueue({ type: 'create', presetId: '1' });
    await queue.remove(op.id);
    
    const count = await queue.getCount();
    expect(count).toBe(0);
  });

  it('should get all operations', async () => {
    await queue.enqueue({ type: 'create', presetId: '1' });
    await queue.enqueue({ type: 'create', presetId: '2' });

    const all = await queue.getAll();
    expect(all).toHaveLength(2);
  });

  it('should clear all operations', async () => {
    await queue.enqueue({ type: 'create', presetId: '1' });
    await queue.clear();

    const count = await queue.getCount();
    expect(count).toBe(0);
  });

  describe('processNext', () => {
    it('should process and remove the oldest operation on success', async () => {
      await queue.enqueue({ type: 'create', presetId: '1' });
      const processor = vi.fn().mockResolvedValue(undefined);

      await queue.processNext(processor);

      expect(processor).toHaveBeenCalledTimes(1);
      const count = await queue.getCount();
      expect(count).toBe(0);
    });

    it('should increment retry count and keep operation on failure', async () => {
      await queue.enqueue({ type: 'create', presetId: '1' });
      const processor = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(queue.processNext(processor)).rejects.toThrow('Network error');

      const oldest = await queue.getOldest();
      expect(oldest?.retryCount).toBe(1);
      expect(oldest?.lastError).toBe('Network error');
      
      const count = await queue.getCount();
      expect(count).toBe(1);
    });

    it('should remove operation after maximum retry attempts', async () => {
      let now = Date.now();
      const dateSpy = vi.spyOn(Date, 'now').mockImplementation(() => now);
      
      await queue.enqueue({ type: 'create', presetId: '1' });
      const processor = vi.fn().mockRejectedValue(new Error('Persistent error'));

      // Attempt 1 (retryCount becomes 1)
      await expect(queue.processNext(processor)).rejects.toThrow();
      
      // Advance to satisfy backoff for attempt 2 (2s)
      now += 2100;
      
      // Attempt 2 (retryCount becomes 2)
      await expect(queue.processNext(processor)).rejects.toThrow();
      
      // Advance to satisfy backoff for attempt 3 (4s)
      now += 4100;
      
      // Attempt 3 (retryCount becomes 3 -> removed)
      await expect(queue.processNext(processor)).rejects.toThrow();

      const count = await queue.getCount();
      expect(count).toBe(0);
      expect(processor).toHaveBeenCalledTimes(3);
      dateSpy.mockRestore();
    });

    it('should respect exponential backoff', async () => {
      let now = Date.now();
      const dateSpy = vi.spyOn(Date, 'now').mockImplementation(() => now);
      
      await queue.enqueue({ type: 'create', presetId: '1' });
      const processor = vi.fn().mockRejectedValue(new Error('Fail'));

      // 1st attempt
      await expect(queue.processNext(processor)).rejects.toThrow();
      
      // Immediately try again - should be too early
      const processed = await queue.processNext(processor);
      expect(processed).toBe(false);
      expect(processor).toHaveBeenCalledTimes(1);

      // Advance time by 2.1 seconds
      now += 2100;
      
      // Try again - should proceed and fail again
      await expect(queue.processNext(processor)).rejects.toThrow();
      expect(processor).toHaveBeenCalledTimes(2);

      dateSpy.mockRestore();
    });
  });
});
