import { describe, it, expect, beforeEach, afterAll, afterEach, beforeAll, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { presetsService, AuthenticationError, ValidationError, NetworkError } from './presets.service';
import { supabaseUrl, supabase } from '../../lib/supabase';

const mockPresets = [
  {
    id: '1',
    name: 'Apple Pie',
    user_id: 'user-1',
    batch_size: 10,
    labor_cost: 100,
    overhead_cost: 50,
    preset_type: 'single',
    ingredients: [],
    updated_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Banana Bread',
    user_id: 'user-1',
    batch_size: 5,
    labor_cost: 80,
    overhead_cost: 30,
    preset_type: 'single',
    ingredients: [],
    updated_at: '2026-01-02T00:00:00Z',
    created_at: '2026-01-02T00:00:00Z'
  },
];

const escapedUrl = supabaseUrl.replace(/[.*+?^${}()|[\\]/g, '\\$&');

const server = setupServer(
  // Auth mock for getUser
  http.get(new RegExp(`${escapedUrl}/auth/v1/user`), () => {
    return HttpResponse.json({ user: { id: 'user-1' } });
  }),

  // GET /presets (All, single, or search)
  http.get(new RegExp(`${escapedUrl}/rest/v1/presets`), ({ request }) => {
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');
    const nameParam = url.searchParams.get('name');

    // Handle getById (.eq('id', id))
    if (idParam === 'eq.1') {
      return HttpResponse.json(mockPresets[0]);
    }

    // Handle search (.ilike('name', `%${query}%`))
    if (nameParam?.includes('ilike.')) {
      return HttpResponse.json([mockPresets[0]]);
    }

    return HttpResponse.json(mockPresets);
  }),

  // POST /presets
  http.post(new RegExp(`${escapedUrl}/rest/v1/presets`), async ({ request }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await request.json() as any;
    return HttpResponse.json({ ...body, id: '3' }, { status: 201 });
  }),

  // PATCH /presets
  http.patch(new RegExp(`${escapedUrl}/rest/v1/presets`), async ({ request }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await request.json() as any;
    return HttpResponse.json({ ...body, id: '1' }, { status: 200 });
  }),

  // DELETE /presets
  http.delete(new RegExp(`${escapedUrl}/rest/v1/presets`), () => {
    return new HttpResponse(null, { status: 204 });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

describe('PresetsService', () => {
  beforeEach(() => {
    // Default mock for getUser
    vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { user: { id: 'user-1' } as any },
      error: null
    });
  });

  describe('getAll', () => {
    it('should fetch all presets successfully', async () => {
      const presets = await presetsService.getAll();
      expect(presets).toHaveLength(2);
      expect(presets[0].name).toBe('Apple Pie');
    });

    it('should retry on 500 error and eventually succeed', async () => {
      let count = 0;
      server.use(
        http.get(new RegExp(`${escapedUrl}/rest/v1/presets`), () => {
          count++;
          if (count < 2) {
            return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
          }
          return HttpResponse.json(mockPresets);
        })
      );

      const presets = await presetsService.getAll();
      expect(count).toBe(2);
      expect(presets).toHaveLength(2);
    });

    it('should throw NetworkError on fetch failure after retries', async () => {
      server.use(
        http.get(new RegExp(`${escapedUrl}/rest/v1/presets`), () => {
          return HttpResponse.error();
        })
      );

      await expect(presetsService.getAll()).rejects.toThrow(NetworkError);
    });
  });

  describe('getById', () => {
    it('should fetch a single preset by id', async () => {
      const preset = await presetsService.getById('1');
      expect(preset.id).toBe('1');
      expect(preset.name).toBe('Apple Pie');
    });

    it('should throw ValidationError when preset not found', async () => {
      server.use(
        http.get(new RegExp(`${escapedUrl}/rest/v1/presets`), () => {
          return HttpResponse.json({
            code: 'PGRST116',
            message: 'JSON object requested, multiple (or no) rows returned'
          }, { status: 406 });
        })
      );

      await expect(presetsService.getById('999')).rejects.toThrow(ValidationError);
    });
  });

  describe('create', () => {
    it('should create a new preset with authenticated user', async () => {
      const newPreset = {
        name: 'New Cake',
        batch_size: 1,
        labor_cost: 50,
        overhead_cost: 20,
        preset_type: 'single',
        ingredients: []
      };

      const result = await presetsService.create(newPreset);
      expect(result.id).toBe('3');
      expect(result.user_id).toBe('user-1');
      expect(result.updated_at).toBeDefined();
    });

    it('should throw AuthenticationError if user is not logged in', async () => {
      vi.spyOn(supabase.auth, 'getUser').mockResolvedValue({
        data: { user: null },
        error: null
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(presetsService.create({ name: 'Test', preset_type: 'single' } as any))
        .rejects.toThrow(AuthenticationError);
    });
  });

  describe('update', () => {
    it('should update an existing preset and refresh timestamps', async () => {
      const updates = { name: 'Updated Pie' };
      const result = await presetsService.update('1', updates);

      expect(result.name).toBe('Updated Pie');
      expect(result.updated_at).toBeDefined();
      expect(result.last_synced_at).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete a preset successfully', async () => {
      await expect(presetsService.delete('1')).resolves.not.toThrow();
    });
  });

  describe('search', () => {
    it('should search presets by name', async () => {
      const results = await presetsService.search('Apple');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Apple Pie');
    });
  });

  describe('Error Handling', () => {
    it('should map 401 to AuthenticationError', async () => {
      server.use(
        http.get(new RegExp(`${escapedUrl}/rest/v1/presets`), () => {
          return HttpResponse.json({ code: 'PGRST301', message: 'Unauthorized' }, { status: 401 });
        })
      );

      await expect(presetsService.getAll()).rejects.toThrow(AuthenticationError);
    });

    it('should map 400 to ValidationError', async () => {
      server.use(
        http.get(new RegExp(`${escapedUrl}/rest/v1/presets`), () => {
          return HttpResponse.json({ message: 'Invalid request', code: 'PGRST102' }, { status: 400 });
        })
      );

      await expect(presetsService.getAll()).rejects.toThrow(ValidationError);
    });
  });
});
