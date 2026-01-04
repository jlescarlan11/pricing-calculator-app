import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { SyncStatus } from './SyncStatus';
import { useSync } from '../../hooks/useSync';

// Mock the useSync hook
vi.mock('../../hooks/useSync', () => ({
  useSync: vi.fn(),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => 'just now'),
}));

describe('SyncStatus', () => {
  const mockSyncFromCloud = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Synced" state correctly', () => {
    (useSync as Mock).mockReturnValue({
      status: 'synced',
      lastSyncedAt: Date.now(),
      queueLength: 0,
      syncFromCloud: mockSyncFromCloud,
    });

    render(<SyncStatus />);
    expect(screen.getByText('Synced')).toBeInTheDocument();
  });

  it('renders "Syncing..." state with rotation', () => {
    (useSync as Mock).mockReturnValue({
      status: 'syncing',
      lastSyncedAt: Date.now() - 10000,
      queueLength: 0,
      syncFromCloud: mockSyncFromCloud,
    });

    render(<SyncStatus />);
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
    const svg = document.querySelector('.animate-spin');
    expect(svg).toBeInTheDocument();
  });

  it('renders "Offline" state with queue length', () => {
    (useSync as Mock).mockReturnValue({
      status: 'offline',
      lastSyncedAt: Date.now() - 60000,
      queueLength: 5,
      syncFromCloud: mockSyncFromCloud,
    });

    render(<SyncStatus />);
    expect(screen.getByText(/Offline \(5 changes queued\)/)).toBeInTheDocument();
  });

  it('renders "Error" state correctly', () => {
    (useSync as Mock).mockReturnValue({
      status: 'error',
      lastSyncedAt: Date.now() - 300000,
      queueLength: 1,
      syncFromCloud: mockSyncFromCloud,
      error: 'Network connection lost',
    });

    render(<SyncStatus />);
    expect(screen.getByText(/Sync failed \(tap to retry\)/)).toBeInTheDocument();
  });

  it('triggers manual sync when clicked', async () => {
    (useSync as Mock).mockReturnValue({
      status: 'synced',
      lastSyncedAt: Date.now(),
      queueLength: 0,
      syncFromCloud: mockSyncFromCloud,
    });

    render(<SyncStatus />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSyncFromCloud).toHaveBeenCalledTimes(1);
  });

  it('shows last synced time on hover', async () => {
    (useSync as Mock).mockReturnValue({
      status: 'synced',
      lastSyncedAt: Date.now(),
      queueLength: 0,
      syncFromCloud: mockSyncFromCloud,
    });

    render(<SyncStatus />);
    const button = screen.getByRole('button');
    
    fireEvent.mouseEnter(button);
    
    // Tooltip content is rendered in a Portal, so we check for the text
    await waitFor(() => {
      expect(screen.getByText('Last synced just now')).toBeInTheDocument();
    });
  });

  it('retries sync when error state is clicked', () => {
    (useSync as Mock).mockReturnValue({
      status: 'error',
      lastSyncedAt: Date.now() - 300000,
      queueLength: 1,
      syncFromCloud: mockSyncFromCloud,
      error: 'Network connection lost',
    });

    render(<SyncStatus />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSyncFromCloud).toHaveBeenCalledTimes(1);
  });
});
