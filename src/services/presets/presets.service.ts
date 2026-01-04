import { supabase } from '../supabase';
import type { TableRow, TableInsert, TableUpdate } from '../../types';

export type Preset = TableRow<'presets'>;
export type PresetInsert = TableInsert<'presets'>;
export type PresetUpdate = TableUpdate<'presets'>;

/**
 * Custom error types for Presets service
 */
export class PresetsError extends Error {
  constructor(
    message: string,
    public code?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public originalError?: any,
    public status?: number
  ) {
    super(message);
    this.name = 'PresetsError';
  }
}

export class AuthenticationError extends PresetsError {
  constructor(message = 'User not authenticated') {
    super(message, 'AUTH_ERROR', null, 401);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends PresetsError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, originalError?: any) {
    super(message, 'NETWORK_ERROR', originalError, 0);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends PresetsError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', null, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Cloud-backed presets CRUD service using Supabase.
 */
export class PresetsService {
  private static instance: PresetsService;

  private constructor() {}

  public static getInstance(): PresetsService {
    if (!PresetsService.instance) {
      PresetsService.instance = new PresetsService();
    }
    return PresetsService.instance;
  }

  /**
   * Helper to execute Supabase calls with retry logic for transient failures.
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delay = 500
  ): Promise<T> {
    let lastError: unknown;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        lastError = error;
        if (!this.isTransientError(error)) throw this.handleError(error);
        
        if (i < maxRetries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, delay * Math.pow(2, i))
          );
        }
      }
    }
    throw this.handleError(lastError);
  }

  /**
   * Determines if an error is transient and should be retried.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isTransientError(error: any): boolean {
    // Check for fetch/network errors
    if (error.name === 'TypeError' || error.message?.includes('fetch') || error.message?.includes('network')) {
      return true;
    }
    
    // Check for status codes (either on error object or status property)
    const status = error.status || error.code;
    const statusCode = typeof status === 'number' ? status : parseInt(status as string, 10);
    
    if (statusCode >= 500 || statusCode === 0 || statusCode === 429) {
      return true;
    }

    // Specific Supabase/PostgREST transient codes
    const transientCodes = ['40001', '57014', 'PGRST107']; // Serialization failure, timeout, connection pool timeout
    if (transientCodes.includes(error.code)) {
      return true;
    }

    return false;
  }

  /**
   * Maps generic errors to structured PresetsError types.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleError(error: any): PresetsError {
    if (error instanceof PresetsError) return error;

    const message = error.message || 'An unexpected error occurred';
    const code = error.code;
    
    // Attempt to determine status from various properties
    let status = error.status;
    if (status === undefined && code) {
      const parsed = parseInt(code as string, 10);
      if (!isNaN(parsed)) {
        status = parsed;
      }
    }

    // Handle Auth errors
    if (code === 'PGRST301' || status === 401) {
      return new AuthenticationError(message === 'An unexpected error occurred' ? 'Session expired or invalid. Please sign in again.' : message);
    }

    // Handle Network errors
    if (error.name === 'TypeError' || error.message?.includes('fetch') || error.message?.includes('network')) {
      return new NetworkError('Network connection lost. Please check your internet.', error);
    }

    // Handle Validation/Resource errors
    if (code === 'PGRST116' || code === '23505' || status === 400 || code === 'PGRST102' || code === 'PGRST100') {
      return new ValidationError(message);
    }

    return new PresetsError(message, code?.toString(), error, status);
  }

  /**
   * Fetch all presets for the current authenticated user, ordered by most recently updated.
   */
  public async getAll(): Promise<Preset[]> {
    return this.withRetry(async () => {
      const { data, error, status } = await supabase
        .from('presets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw { ...error, status };
      return data || [];
    });
  }

  /**
   * Fetch a single preset by ID.
   */
  public async getById(id: string): Promise<Preset> {
    return this.withRetry(async () => {
      const { data, error, status } = await supabase
        .from('presets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw { ...error, status };
      if (!data) throw new ValidationError(`Preset with ID ${id} not found`);
      return data;
    });
  }

  /**
   * Create a new preset with the current authenticated user automatically assigned.
   */
  public async create(preset: Omit<PresetInsert, 'user_id' | 'created_at' | 'updated_at' | 'last_synced_at'>): Promise<Preset> {
    return this.withRetry(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AuthenticationError();

      const now = new Date().toISOString();
      const newPreset: PresetInsert = {
        ...preset,
        user_id: user.id,
        created_at: now,
        updated_at: now,
        last_synced_at: now,
      };

      const { data, error, status } = await supabase
        .from('presets')
        .insert(newPreset)
        .select()
        .single();

      if (error) throw { ...error, status };
      return data;
    });
  }

  /**
   * Update an existing preset, explicitly refreshing updated_at and last_synced_at.
   */
  public async update(id: string, updates: Omit<PresetUpdate, 'user_id' | 'id' | 'created_at' | 'updated_at' | 'last_synced_at'>): Promise<Preset> {
    return this.withRetry(async () => {
      const now = new Date().toISOString();
      const { data, error, status } = await supabase
        .from('presets')
        .update({
          ...updates,
          updated_at: now,
          last_synced_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw { ...error, status };
      if (!data) throw new ValidationError(`Preset with ID ${id} not found`);
      return data;
    });
  }

  /**
   * Delete a preset by ID.
   */
  public async delete(id: string): Promise<void> {
    return this.withRetry(async () => {
      const { error, status } = await supabase
        .from('presets')
        .delete()
        .eq('id', id);

      if (error) throw { ...error, status };
    });
  }

  /**
   * Delete all presets for the current authenticated user.
   */
  public async deleteAll(): Promise<void> {
    return this.withRetry(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AuthenticationError();

      const { error, status } = await supabase
        .from('presets')
        .delete()
        .eq('user_id', user.id);

      if (error) throw { ...error, status };
    });
  }

  /**
   * Perform full-text search on preset names.
   */
  public async search(query: string): Promise<Preset[]> {
    return this.withRetry(async () => {
      const { data, error, status } = await supabase
        .from('presets')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('updated_at', { ascending: false });

      if (error) throw { ...error, status };
      return data || [];
    });
  }
}

export const presetsService = PresetsService.getInstance();
