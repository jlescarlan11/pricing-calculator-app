import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DangerZone } from './DangerZone';
import { presetService } from '../../services/presetService';
import { useAuth } from '../../context/AuthContext';
import { usePresets } from '../../hooks/use-presets';
import { vi } from 'vitest';

// Mock dependencies
vi.mock('../../services/presetService', () => ({
  presetService: {
    deleteAllPresets: vi.fn(),
  },
}));
vi.mock('../../context/AuthContext');
vi.mock('../../hooks/use-presets');
vi.mock('../shared/Toast', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

// Setup global fetch/Blob if needed (not needed for DangerZone)

describe('DangerZone', () => {
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user' },
    } as unknown as ReturnType<typeof useAuth>);
    vi.mocked(usePresets).mockReturnValue({
      presets: [{ id: '1' }],
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof usePresets>);
    vi.clearAllMocks();
  });

  it('renders correctly when presets exist', () => {
    render(<DangerZone />);
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
    expect(screen.getByText('Delete All Data')).toBeInTheDocument();
  });

  it('does not render when no presets', () => {
    vi.mocked(usePresets).mockReturnValue({ presets: [] } as unknown as ReturnType<
      typeof usePresets
    >);
    const { container } = render(<DangerZone />);
    expect(container).toBeEmptyDOMElement();
  });

  it('opens confirmation modal on click', () => {
    render(<DangerZone />);
    fireEvent.click(screen.getByText('Delete All Data'));
    expect(screen.getByText('Delete All Data?')).toBeInTheDocument();
  });

  it('calls deleteAllPresets on confirmation', async () => {
    render(<DangerZone />);
    fireEvent.click(screen.getByText('Delete All Data'));
    fireEvent.click(screen.getByText('Yes, Delete Everything'));

    await waitFor(() => {
      expect(presetService.deleteAllPresets).toHaveBeenCalledWith('test-user');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
