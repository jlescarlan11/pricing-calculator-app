import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { ToastProvider } from '../components/shared';
import * as usePresetsHook from '../hooks/use-presets';
import * as useAuthHook from '../hooks/useAuth';
import * as useSyncHook from '../hooks/useSync';
import 'fake-indexeddb/auto';

// Mock Hooks
vi.mock('../hooks/use-presets');
vi.mock('../hooks/useAuth');
vi.mock('../hooks/useSync');

describe('Routing Integration', () => {
  // ... (mockPresets remain same)
  const mockPresets = [
    {
      id: 'single-1',
      name: 'Single Cookie',
      preset_type: 'single',
      type: 'single',
      input: { productName: 'Single Cookie', batchSize: 10, ingredients: [], laborCost: 0, overhead: 0 },
      config: { strategy: 'markup', value: 50 },
      lastModified: Date.now(),
    },
    {
      id: 'variant-1',
      name: 'Variant Batch',
      preset_type: 'variants',
      batch_size: 100,
      ingredients: [],
      labor_cost: 0,
      overhead_cost: 0,
      variants: [
        { id: 'v1', name: 'Small', amount: 10, unit: 'pc', additionalIngredients: [], additionalLabor: 0, pricingStrategy: 'markup', pricingValue: 50, currentSellingPrice: null }
      ],
      lastModified: Date.now(),
      updated_at: new Date().toISOString(),
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuthHook.useAuth as any).mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      isAuthenticated: true,
      loading: false,
    });

    (useSyncHook.useSync as any).mockReturnValue({
      status: 'synced',
      lastSyncedAt: Date.now(),
      queueLength: 0,
      syncFromCloud: vi.fn(),
      syncToCloud: vi.fn(),
      refreshQueueLength: vi.fn(),
      isOnline: true,
    });

    (usePresetsHook.usePresets as any).mockReturnValue({
      presets: mockPresets,
      loading: false,
      getPreset: (id: string) => mockPresets.find(p => p.id === id),
      addPreset: vi.fn(),
      updatePreset: vi.fn(),
      deletePreset: vi.fn(),
      syncPresets: vi.fn(),
    });
    
    window.scrollTo = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  const renderApp = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </MemoryRouter>
    );
  };

  it('redirects from / to /calculator/single', async () => {
    renderApp('/');

    expect(await screen.findByRole('heading', { name: /^Calculator$/i, level: 2 })).toBeInTheDocument();
  });

  it('loads a single preset by ID', async () => {
    renderApp('/calculator/single/single-1');

    await waitFor(() => {
      expect(screen.getByLabelText(/Product Name/i)).toHaveValue('Single Cookie');
    });
  });

  it('shows error for not found single preset', async () => {
    renderApp('/calculator/single/non-existent');

    expect(await screen.findByText(/Preset not found/i)).toBeInTheDocument();
  });

  it('shows error when loading variant preset into single calculator', async () => {
    renderApp('/calculator/single/variant-1');

    expect(await screen.findByText(/This preset is not a single product calculation/i)).toBeInTheDocument();
  });

  it('loads a variant preset into variant calculator', async () => {
    renderApp('/calculator/variants/variant-1');

    expect(await screen.findByText(/Variant Pricing/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('Variant Batch');
  });

  it('shows error when loading single preset into variant calculator', async () => {
    renderApp('/calculator/variants/single-1');

    expect(await screen.findByText(/This preset is not a variant calculation/i)).toBeInTheDocument();
  });

  it('renders blank variant calculator for create mode', async () => {
    renderApp('/calculator/variants');

    expect(await screen.findByText(/Variant Pricing/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Name/i)).toHaveValue('');
  });
});