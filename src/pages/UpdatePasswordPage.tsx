import React from 'react';
import { ResetPassword } from '../components/auth';

/**
 * Page component for resetting the user password.
 * This page is accessed via a link sent to the user's email.
 */
export const UpdatePasswordPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <ResetPassword />
    </div>
  );
};
