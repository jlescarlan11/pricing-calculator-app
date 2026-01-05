import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePresets } from '../hooks/use-presets';
import { Card, Input, Button } from '../components/shared';
import { AlertCircle, CheckCircle2, ArrowRight, Save } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPasswordForEmail, user } = useAuth();
  const { presets } = usePresets(); // Load local presets
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

  // Count strictly local presets (guest mode)
  // Actually usePresets returns all presets. If user is null, it's just local.
  // We can filter by !p.userId to be sure, or just rely on the fact we are logged out.
  const guestPresetsCount = presets.length;

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-2xl px-lg">
      <div className="w-full max-w-[440px] animate-in fade-in duration-700">
        {guestPresetsCount > 0 && (
          <div className="mb-xl p-lg bg-moss/5 border border-moss/10 rounded-2xl flex items-center gap-lg shadow-sm animate-in slide-in-from-top-4 duration-500">
            <div className="p-2.5 bg-white rounded-full shadow-sm shrink-0">
              <Save className="w-5 h-5 text-moss" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-ink-900 text-sm">
                We found {guestPresetsCount} unsaved recipe{guestPresetsCount !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-ink-700 mt-0.5 leading-relaxed">
                {mode === 'signup'
                  ? 'Create an account to save them to the cloud.'
                  : 'Sign in to sync them and access them anywhere.'}
              </p>
            </div>
          </div>
        )}

        <div className="text-center mb-xl">
          <h1 className="font-serif text-3xl md:text-4xl text-ink-900 mb-md tracking-tight">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot-password' && 'Reset Password'}
          </h1>
          <p className="text-ink-500 max-w-[320px] mx-auto leading-relaxed">
            {mode === 'login' && 'Sign in to access your saved recipes and pricing calculations'}
            {mode === 'signup' && 'Join to save your products and manage your pricing securely'}
            {mode === 'forgot-password' && 'Enter your email to receive a secure reset link'}
          </p>
        </div>

        <Card className="shadow-xl border-border-subtle/50 overflow-visible">
          <form onSubmit={handleSubmit} className="space-y-xl">
            {error && (
              <div className="p-md bg-rust/5 border border-rust/10 rounded-xl flex items-start space-x-sm animate-shake">
                <AlertCircle className="w-5 h-5 text-rust shrink-0 mt-0.5" />
                <p className="text-sm text-rust font-medium">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-md bg-moss/5 border border-moss/10 rounded-xl flex items-start space-x-sm animate-in fade-in duration-500">
                <CheckCircle2 className="w-5 h-5 text-moss shrink-0 mt-0.5" />
                <p className="text-sm text-moss font-medium">{successMessage}</p>
              </div>
            )}

            <div className="space-y-lg">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />

              {mode !== 'forgot-password' && (
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
                  autoComplete="new-password"
                />
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full h-12 shadow-level-2"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot-password' && 'Send Reset Link'}
                  {!loading && <ArrowRight className="ml-sm w-4 h-4" />}
                </>
              )}
            </Button>
          </form>

          <div className="mt-xl pt-xl border-t border-border-subtle/50 flex flex-col gap-lg text-center">
            {mode === 'login' && (
              <>
                <p className="text-sm text-ink-700">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => toggleMode('signup')}
                    className="text-clay font-semibold hover:text-clay/80 transition-colors focus:outline-none focus:underline"
                  >
                    Sign Up
                  </button>
                </p>
                <button
                  onClick={() => toggleMode('forgot-password')}
                  className="text-xs text-ink-500 hover:text-ink-700 transition-colors focus:outline-none focus:underline"
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
                  className="text-clay font-semibold hover:text-clay/80 transition-colors focus:outline-none focus:underline"
                >
                  Sign In
                </button>
              </p>
            )}

            {mode === 'forgot-password' && (
              <button
                onClick={() => toggleMode('login')}
                className="text-sm text-ink-700 hover:text-clay font-semibold transition-colors focus:outline-none focus:underline"
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
