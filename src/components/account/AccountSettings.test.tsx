import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AccountSettings } from './AccountSettings';
import { useAuth } from '../../hooks/useAuth';
import { usePresets } from '../../hooks/use-presets';
import { presetsService } from '../../services/presets';
import { useToast } from '../shared/Toast';

// Mock the hooks and services
vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/use-presets');
vi.mock('../../services/presets');
vi.mock('../shared/Toast');

describe('AccountSettings', () => {
  const mockUser = {
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00Z',
    last_sign_in_at: '2024-01-01T12:00:00Z',
  };

  const mockPresets = [
    { id: '1', name: 'Test Product', input: {}, config: {}, lastModified: Date.now() }
  ];

  const mockShowToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  };
  const mockUpdatePassword = vi.fn();
  const mockAddPreset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useAuth as any).mockReturnValue({
      user: mockUser,
      updatePassword: mockUpdatePassword,
      signOut: vi.fn(),
      resendConfirmationEmail: vi.fn(),
      loading: false,
      session: null,
      isAuthenticated: true,
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn(),
    });

    (usePresets as any).mockReturnValue({
      presets: mockPresets,
      addPreset: mockAddPreset,
    });

    (useToast as any).mockReturnValue(mockShowToast);

    (presetsService.deleteAllPresets as any).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders account information correctly', () => {
    render(<AccountSettings />);
    
    expect(screen.getByDisplayValue('test@example.com')).toBeDefined();
    expect(screen.getByText(/January 1, 2023/i)).toBeDefined();
    expect(screen.getByText(/Jan 1, 2024/i)).toBeDefined();
  });

  it('opens password modal and updates password', async () => {
    render(<AccountSettings />);
    
    fireEvent.click(screen.getByText('Change Password'));
    
    const newPasswordInput = screen.getByPlaceholderText('Minimum 6 characters');
    const confirmPasswordInput = screen.getByPlaceholderText('Re-type your new password');
    const submitButton = screen.getByText('Update Password');
    
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockUpdatePassword).toHaveBeenCalledWith('newpassword123');
      expect(mockShowToast).toHaveBeenCalledWith('Password updated successfully', 'success');
    });
  });

  it('shows error if passwords do not match', async () => {
    render(<AccountSettings />);
    
    fireEvent.click(screen.getByText('Change Password'));
    
    fireEvent.change(screen.getByPlaceholderText('Minimum 6 characters'), { target: { value: 'password1' } });
    fireEvent.change(screen.getByPlaceholderText('Re-type your new password'), { target: { value: 'password2' } });
    
    fireEvent.click(screen.getByText('Update Password'));
    
    expect(mockShowToast).toHaveBeenCalledWith('Passwords do not match', 'error');
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it('exports data to JSON', () => {
    const mockClick = vi.fn();
    const mockAnchor = {
      setAttribute: vi.fn(),
      click: mockClick,
      style: {},
    };
    
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') return mockAnchor as any;
      return originalCreateElement(tagName);
    });
    
    render(<AccountSettings />);
    
    fireEvent.click(screen.getByText('Export JSON'));
    
    expect(mockAnchor.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.json'));
    expect(mockClick).toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith('Data exported successfully', 'success');
  });

  it('clears all data when confirmed', async () => {
    const mockReload = vi.fn();
    const originalReload = window.location.reload;
    
    // Use defineProperty to mock reload
    Object.defineProperty(window.location, 'reload', {
      configurable: true,
      value: mockReload,
    });

    render(<AccountSettings />);
    
    // Open modal
    fireEvent.click(screen.getByText(/Clear Everything/i));
    
    // Click confirm in modal
    fireEvent.click(screen.getByText('Clear All Data', { selector: 'button' }));
    
    await waitFor(() => {
      expect(presetsService.deleteAllPresets).toHaveBeenCalled();
      expect(mockReload).toHaveBeenCalled();
    });

    // Restore
    Object.defineProperty(window.location, 'reload', {
      configurable: true,
      value: originalReload,
    });
  });

  it('opens delete account modal and requires DELETE text to confirm', async () => {
    render(<AccountSettings />);
    
    fireEvent.click(screen.getByRole('button', { name: /delete account/i }));
    
    const confirmButton = screen.getByText('Permanently Delete Account');
    expect(confirmButton).toBeDisabled();
    
    const input = screen.getByPlaceholderText('Type DELETE here');
    fireEvent.change(input, { target: { value: 'DELETE' } });
    
    expect(confirmButton).not.toBeDisabled();
    
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Account deleted successfully', 'success');
    });
  });
});
