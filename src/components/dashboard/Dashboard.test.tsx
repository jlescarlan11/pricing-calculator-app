import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocks
const mockSignOut = vi.fn();
const mockUser = { email: 'test@example.com' };

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    signOut: mockSignOut,
  }),
}));

vi.mock('../sync-status', () => ({
  SyncStatus: () => <div data-testid="sync-status">SyncStatus</div>,
}));

vi.mock('../presets', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PresetsList: ({ onLoad, onEdit }: any) => (
    <div data-testid="presets-list">
      PresetsList
      <button onClick={() => onLoad({ id: '1' })}>Load Preset</button>
      <button onClick={() => onEdit({ id: '1' })}>Edit Preset</button>
    </div>
  ),
}));

vi.mock('../variants/PresetTypeSelector', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PresetTypeSelector: ({ isOpen, onSelect, onClose }: any) => (
    isOpen ? (
      <div data-testid="preset-type-selector">
        Selector Open
        <button onClick={() => onSelect('single')}>Select Single</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}));

describe('Dashboard', () => {
  const mockOnLoadPreset = vi.fn();
  const mockOnNewPreset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with user info', () => {
    render(
      <MemoryRouter>
        <Dashboard onLoadPreset={mockOnLoadPreset} onNewPreset={mockOnNewPreset} />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('sync-status')).toBeInTheDocument();
    expect(screen.getByTestId('presets-list')).toBeInTheDocument();
  });

  it('handles sign out', () => {
    render(
      <MemoryRouter>
        <Dashboard onLoadPreset={mockOnLoadPreset} onNewPreset={mockOnNewPreset} />
      </MemoryRouter>
    );

    const signOutBtn = screen.getByTitle('Sign Out');
    fireEvent.click(signOutBtn);
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('opens new preset selector', () => {
    render(
      <MemoryRouter>
        <Dashboard onLoadPreset={mockOnLoadPreset} onNewPreset={mockOnNewPreset} />
      </MemoryRouter>
    );

    const newPresetBtn = screen.getByText('New Preset');
    fireEvent.click(newPresetBtn);

    expect(screen.getByTestId('preset-type-selector')).toBeInTheDocument();
  });

  it('calls onNewPreset when type is selected', () => {
    render(
      <MemoryRouter>
        <Dashboard onLoadPreset={mockOnLoadPreset} onNewPreset={mockOnNewPreset} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('New Preset'));
    fireEvent.click(screen.getByText('Select Single'));

    expect(mockOnNewPreset).toHaveBeenCalledWith('single');
    expect(screen.queryByTestId('preset-type-selector')).not.toBeInTheDocument();
  });
});
