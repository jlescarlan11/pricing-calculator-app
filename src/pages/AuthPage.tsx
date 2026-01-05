import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Input, Button } from '../components/shared';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPasswordForEmail, user } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if already logged in
  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSuccessMessage('Account created! Please check your email to confirm your account.');
      } else if (mode === 'forgot-password') {
        const { error } = await resetPasswordForEmail(email);
        if (error) throw error;
        setSuccessMessage('Password reset email sent! Check your inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex flex-col items-center justify-center py-xl">
      <div className="w-full max-w-md">
        <div className="text-center mb-xl">
          <h1 className="font-serif text-3xl md:text-4xl text-ink-900 mb-sm">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot-password' && 'Reset Password'}
          </h1>
          <p className="text-ink-500">
            {mode === 'login' && 'Sign in to access your saved recipes'}
            {mode === 'signup' && 'Join to save and manage your pricing'}
            {mode === 'forgot-password' && 'Enter your email to receive a reset link'}
          </p>
        </div>

        <Card className="p-xl md:p-2xl shadow-lg border-border-subtle bg-white">
          <form onSubmit={handleSubmit} className="space-y-lg">
            {error && (
              <div className="p-md bg-rust/10 border border-rust/20 rounded-lg flex items-start space-x-sm">
                <AlertCircle className="w-5 h-5 text-rust shrink-0 mt-0.5" />
                <p className="text-sm text-rust">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-md bg-moss/10 border border-moss/20 rounded-lg flex items-start space-x-sm">
                <CheckCircle2 className="w-5 h-5 text-moss shrink-0 mt-0.5" />
                <p className="text-sm text-moss">{successMessage}</p>
              </div>
            )}

            <div className="space-y-md">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              {mode !== 'forgot-password' && (
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              )}

              {mode === 'signup' && (
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="mt-xl w-full"
            >
              {loading ? 'Processing...' : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot-password' && 'Send Reset Link'}
                  {!loading && <ArrowRight className="ml-sm w-4 h-4" />}
                </>
              )}
            </Button>
          </form>

          <div className="mt-xl pt-lg border-t border-border-subtle space-y-md text-center">
            {mode === 'login' && (
              <>
                <p className="text-sm text-ink-700">
                  Don't have an account?{' '}
                  <button
                    onClick={() => toggleMode('signup')}
                    className="text-clay font-medium hover:underline focus:outline-none"
                  >
                    Sign Up
                  </button>
                </p>
                <button
                  onClick={() => toggleMode('forgot-password')}
                  className="text-sm text-ink-500 hover:text-ink-700 hover:underline focus:outline-none"
                >
                  Forgot your password?
                </button>
              </>
            )}

            {mode === 'signup' && (
              <p className="text-sm text-ink-700">
                Already have an account?{' '}
                <button
                  onClick={() => toggleMode('login')}
                  className="text-clay font-medium hover:underline focus:outline-none"
                >
                  Sign In
                </button>
              </p>
            )}

            {mode === 'forgot-password' && (
              <button
                onClick={() => toggleMode('login')}
                className="text-sm text-ink-700 hover:text-clay font-medium hover:underline focus:outline-none"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};