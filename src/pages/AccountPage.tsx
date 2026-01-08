import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/shared';
import { ExportButton } from '../components/account/ExportButton';
import { ImportButton } from '../components/account/ImportButton';
import { DangerZone } from '../components/account/DangerZone';
import { ChangePasswordModal } from '../components/account/ChangePasswordModal';

export const AccountPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <div className="space-y-xl max-w-3xl mx-auto">
      <div className="border-b border-border-subtle pb-lg">
        <h1 className="font-serif text-3xl text-ink-900">Account Settings</h1>
        <p className="text-ink-500 mt-sm">Manage your profile and data</p>
      </div>

      {/* Profile Section */}
      <section className="bg-white p-xl rounded-xl border border-border-base shadow-sm">
        <h2 className="text-xl font-medium text-ink-900 mb-md">Profile</h2>
        <div className="mb-xl">
          <p className="text-ink-700">
            <span className="font-medium">Email:</span> {user?.email}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-md">
          <Button variant="secondary" onClick={() => setIsPasswordModalOpen(true)}>
            Change Password
          </Button>
          <Button
            variant="ghost"
            className="text-ink-700 hover:text-rust hover:bg-rust/5 justify-start sm:justify-center"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </div>
      </section>

      {/* Data Management Section */}
      <section className="bg-white p-xl rounded-xl border border-border-base shadow-sm">
        <h2 className="text-xl font-medium text-ink-900 mb-md">Data Management</h2>
        <p className="text-ink-500 mb-xl">
          Export your data for safekeeping or transfer it to another device.
        </p>

        <div className="flex flex-col sm:flex-row gap-md">
          <ExportButton />
          <ImportButton />
        </div>
      </section>

      {/* Privacy Section */}
      <section className="bg-white p-xl rounded-xl border border-border-base shadow-sm">
        <h2 className="text-xl font-medium text-ink-900 mb-md">Privacy & Data Usage</h2>
        <p className="text-sm text-ink-500 leading-relaxed italic">
          We collect usage data to improve the tool. Data is automatically deleted if the product or account is removed.
        </p>
      </section>

      {/* Danger Zone */}
      <DangerZone />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
