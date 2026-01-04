import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { AccountSettings } from '../components/account/AccountSettings';

export const AccountPage: React.FC = () => {
  const { user, loading } = useAuth();

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
    <div className="max-w-4xl mx-auto py-12 px-4">
      <AccountSettings />
    </div>
  );
};