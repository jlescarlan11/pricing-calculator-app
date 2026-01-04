import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { User as UserIcon, LogOut } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-clay">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-heading text-ink-900 mb-6">Account Settings</h1>
      
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-surface-hover rounded-full text-ink-500">
            <UserIcon size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-medium text-ink-900 mb-1">Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-ink-500 uppercase tracking-wider mb-1">
                  Email
                </label>
                <div className="text-ink-900">{user.email}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-500 uppercase tracking-wider mb-1">
                  User ID
                </label>
                <div className="text-ink-900 font-mono text-xs">{user.id}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-500 uppercase tracking-wider mb-1">
                  Last Sign In
                </label>
                <div className="text-ink-900 text-sm">
                  {new Date(user.last_sign_in_at || '').toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => signOut()} 
          variant="secondary"
          className="gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </div>
  );
};