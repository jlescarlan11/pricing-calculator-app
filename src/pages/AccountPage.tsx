import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/shared';

export const AccountPage: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-xl">
      <div className="border-b border-border-subtle pb-lg">
        <h1 className="font-serif text-3xl text-ink-900">Account Settings</h1>
        <p className="text-ink-500 mt-sm">Manage your profile and preferences</p>
      </div>

      <div className="bg-white p-xl rounded-lg border border-border-base shadow-sm">
        <h2 className="text-xl font-medium text-ink-900 mb-md">Profile</h2>
        <div className="space-y-sm mb-xl">
          <p className="text-ink-700"><span className="font-medium">Email:</span> {user?.email}</p>
          <p className="text-ink-700"><span className="font-medium">User ID:</span> {user?.id}</p>
        </div>

        <Button variant="secondary" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};
