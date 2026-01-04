import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';

/**
 * ResetPassword component allows users to set a new password.
 * This is typically used after clicking a password reset link in an email.
 */
export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword, isAuthenticated, loading: authLoading } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  // Check if we have a session (Supabase should have set it from the URL hash)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setError('Your reset link may have expired or is invalid. Please request a new one.');
    }
  }, [authLoading, isAuthenticated]);

  const passwordError = touched.password && !password
    ? 'Password is required.'
    : touched.password && password.length < 6
    ? 'Password must be at least 6 characters.'
    : undefined;

  const confirmPasswordError = touched.confirmPassword && confirmPassword !== password
    ? 'Passwords do not match.'
    : undefined;

  const isFormValid = password && password.length >= 6 && confirmPassword === password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    try {
      await updatePassword(password);
      setSuccess(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating your password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto py-12 px-4 sm:px-0 animate-in fade-in duration-500">
        <Card className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-moss/10 rounded-full flex items-center justify-center text-moss">
              <CheckCircle2 size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-heading text-ink-900 mb-3">Password Reset!</h1>
          <p className="text-ink-700 mb-8">
            Your password has been successfully updated. You can now sign in with your new password.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-ink-500">
              Redirecting you to the sign in page...
            </p>
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => navigate('/auth/login')}
            >
              Sign In Now
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4 sm:px-0 animate-in fade-in duration-500">
      <Card>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-heading text-ink-900 mb-3">Create New Password</h1>
          <p className="text-ink-700 text-sm">
            Please enter your new password below.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rust/5 border border-rust/20 rounded-sm flex gap-3 text-rust text-sm animate-in slide-in-from-top-2">
            {isAuthenticated ? (
              <Info size={18} className="shrink-0" />
            ) : (
              <AlertTriangle size={18} className="shrink-0" />
            )}
            <div>
              <p className="font-medium mb-1">{isAuthenticated ? 'Error' : 'Invalid Link'}</p>
              <p>{error}</p>
              {!isAuthenticated && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/auth/forgot-password')}
                >
                  Request New Link
                </Button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
            placeholder="••••••••"
            error={passwordError}
            required
            autoComplete="new-password"
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-ink-500 hover:text-ink-700 transition-colors p-2 -mr-2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          <Input
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
            placeholder="••••••••"
            error={confirmPasswordError}
            required
            autoComplete="new-password"
            suffix={<Lock size={18} className="text-ink-500 p-0.5" />}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            size="lg"
            isLoading={loading}
            disabled={!isFormValid || loading || (!isAuthenticated && !authLoading)}
          >
            Reset Password
          </Button>
        </form>
      </Card>
    </div>
  );
};
