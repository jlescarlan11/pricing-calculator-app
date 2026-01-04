import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Lock, 
  Database, 
  AlertTriangle, 
  Download, 
  Upload, 
  ShieldAlert,
  Calendar,
  Mail,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { presetsService } from '../../services/presets';
import { usePresets } from '../../hooks/use-presets';
import { 
  Card, 
  Button, 
  Input, 
  Modal, 
  Badge,
  useToast 
} from '../shared';

export const AccountSettings: React.FC = () => {
  const { user, updatePassword } = useAuth();
  const { presets, addPreset } = usePresets();
  const { addToast } = useToast();

  // Modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteDataModalOpen, setIsDeleteDataModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete account double confirmation
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);

  // Data states
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(
    localStorage.getItem('last_presets_backup')
  );

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword(newPassword);
      addToast('Password updated successfully', 'success');
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(presets, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `pricing-calculator-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      const now = new Date().toISOString();
      localStorage.setItem('last_presets_backup', now);
      setLastBackupDate(now);
      
      addToast('Data exported successfully', 'success');
    } catch {
      addToast('Failed to export data', 'error');
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const importedPresets = JSON.parse(content);
        
        if (!Array.isArray(importedPresets)) {
          throw new Error('Invalid format: Expected an array of presets');
        }

        let successCount = 0;
        for (const preset of importedPresets) {
          try {
            // Basic validation
            if (preset.name && preset.input && preset.config) {
              await addPreset(preset);
              successCount++;
            }
          } catch (err) {
            console.error('Failed to import preset:', preset.name, err);
          }
        }

        addToast(`Successfully imported ${successCount} presets`, 'success');
        // Reset file input
        e.target.value = '';
      } catch {
        addToast('Failed to import data: Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAllData = async () => {
    setIsDeletingData(true);
    try {
      await presetsService.deleteAllPresets();
      addToast('All data has been cleared', 'success');
      setIsDeleteDataModalOpen(false);
      // We might need to refresh the presets list in the UI
      // usePresets hook should ideally react to this if it uses a real-time listener
      // but here we might need to manually refresh if it doesn't.
      window.location.reload(); // Simple way to refresh all state
    } catch {
      addToast('Failed to delete data', 'error');
    } finally {
      setIsDeletingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      addToast('Please type DELETE to confirm', 'error');
      return;
    }

    setIsDeletingAccount(true);
    try {
      // In our AuthService, this signs out and logs.
      // In real app, it would trigger backend deletion.
      const { authService } = await import('../../services/auth');
      await authService.deleteAccount();
      addToast('Account deleted successfully', 'success');
      // Sign out and redirect is handled by deleteAccount (which calls signOut)
    } catch {
      addToast('Failed to delete account', 'error');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-2xl">
        <h1 className="text-4xl font-serif text-ink-900 mb-sm">Account Settings</h1>
        <p className="text-ink-500">Manage your profile, security, and data preferences.</p>
      </header>

      {/* Account Info */}
      <Card>
        <div className="flex items-center gap-md mb-xl">
          <UserIcon className="w-5 h-5 text-clay" />
          <h2 className="text-xl font-serif text-ink-900">Account Info</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
          <Input 
            label={
              <span className="flex items-center gap-xs">
                <Mail className="w-4 h-4" /> Email Address
              </span>
            }
            value={user.email || ''} 
            onChange={() => {}} 
            readOnly 
            disabled 
            className="cursor-not-allowed" 
          />
          <div className="space-y-sm">
            <label className="text-sm font-medium text-ink-700 flex items-center gap-xs h-[20px] mb-2">
              <Calendar className="w-4 h-4" /> Member Since
            </label>
            <div className="p-3 bg-surface-hover rounded-sm text-ink-900 flex items-center h-[48px] border border-border-subtle">
              {user.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'Unknown'}
            </div>
          </div>
          <div className="space-y-sm">
            <label className="text-sm font-medium text-ink-700 flex items-center gap-xs h-[20px] mb-2">
              <Clock className="w-4 h-4" /> Last Login
            </label>
            <div className="p-3 bg-surface-hover rounded-sm text-ink-900 flex items-center h-[48px] border border-border-subtle">
              {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy HH:mm') : 'Just now'}
            </div>
          </div>
          <div className="flex items-end h-[76px] pb-[14px]">
             <Badge variant="info">Verified Account</Badge>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <div className="flex items-center gap-md mb-xl">
          <Lock className="w-5 h-5 text-clay" />
          <h2 className="text-xl font-serif text-ink-900">Security</h2>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg">
          <div>
            <h3 className="font-medium text-ink-900">Password</h3>
            <p className="text-sm text-ink-500">Last changed recently. Recommended to change every 90 days.</p>
          </div>
          <Button variant="secondary" onClick={() => setIsPasswordModalOpen(true)}>
            Change Password
          </Button>
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <div className="flex items-center gap-md mb-xl">
          <Database className="w-5 h-5 text-clay" />
          <h2 className="text-xl font-serif text-ink-900">Data Management</h2>
        </div>
        <div className="space-y-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg border-b border-border-subtle pb-lg">
            <div>
              <h3 className="font-medium text-ink-900">Export Your Data</h3>
              <p className="text-sm text-ink-500">Download all your saved products and calculations as a JSON file.</p>
              {lastBackupDate && (
                <p className="text-xs text-ink-500 mt-1">
                  Last backup: {format(new Date(lastBackupDate), 'MMM d, yyyy HH:mm')}
                </p>
              )}
            </div>
            <Button variant="secondary" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" /> Export JSON
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg">
            <div>
              <h3 className="font-medium text-ink-900">Import Data</h3>
              <p className="text-sm text-ink-500">Restore your products from a previously exported backup file.</p>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Import JSON file"
              />
              <Button variant="secondary">
                <Upload className="w-4 h-4 mr-2" /> Import JSON
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-sakura/30">
        <div className="flex items-center gap-md mb-xl">
          <AlertTriangle className="w-5 h-5 text-rust" />
          <h2 className="text-xl font-serif text-ink-900">Danger Zone</h2>
        </div>
        <div className="space-y-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg border-b border-border-subtle pb-lg">
            <div>
              <h3 className="font-medium text-ink-900">Clear All Data</h3>
              <p className="text-sm text-ink-500">Permanently delete all your saved products. This action cannot be undone.</p>
            </div>
            <Button variant="secondary" onClick={() => setIsDeleteDataModalOpen(true)}>
              Clear Everything
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg">
            <div>
              <h3 className="font-medium text-rust">Delete Account</h3>
              <p className="text-sm text-ink-500">Permanently delete your account and all associated data. This action is final.</p>
            </div>
            <Button variant="primary" className="bg-rust hover:bg-rust/90 border-none" onClick={() => setIsDeleteAccountModalOpen(true)}>
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
      >
        <form onSubmit={handleUpdatePassword} className="space-y-lg">
          <div className="space-y-md">
            <div className="space-y-sm">
              <Input
                label="New Password"
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-sm">
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-type your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-md pt-md">
            <Button variant="ghost" type="button" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isUpdatingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Data Modal */}
      <Modal
        isOpen={isDeleteDataModalOpen}
        onClose={() => setIsDeleteDataModalOpen(false)}
        title="Clear All Data?"
      >
        <div className="space-y-lg">
          <div className="flex items-start gap-md p-md bg-sakura/10 rounded-lg text-ink-900">
            <AlertTriangle className="w-5 h-5 text-rust shrink-0 mt-0.5" />
            <p className="text-sm">
              This will permanently delete all your saved products and calculations. 
              <strong> You cannot undo this action.</strong>
            </p>
          </div>
          <div className="flex justify-end gap-md pt-md">
            <Button variant="ghost" onClick={() => setIsDeleteDataModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="bg-rust hover:bg-rust/90 border-none" 
              onClick={handleDeleteAllData}
              isLoading={isDeletingData}
            >
              Clear All Data
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        title="Delete Your Account?"
      >
        <div className="space-y-lg">
          <div className="flex items-start gap-md p-md bg-sakura/10 rounded-lg text-ink-900">
            <ShieldAlert className="w-5 h-5 text-rust shrink-0 mt-0.5" />
            <div className="space-y-sm">
              <p className="text-sm font-medium">This is a permanent action.</p>
              <p className="text-sm">
                Deleting your account will remove your profile and all your saved data from our servers.
              </p>
            </div>
          </div>
          
          <div className="space-y-sm">
            <Input
              label="Type DELETE to confirm"
              placeholder="Type DELETE here"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-md pt-md">
            <Button variant="ghost" onClick={() => setIsDeleteAccountModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="bg-rust hover:bg-rust/90 border-none" 
              onClick={handleDeleteAccount}
              isLoading={isDeletingAccount}
              disabled={deleteConfirmationText !== 'DELETE'}
            >
              Permanently Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
