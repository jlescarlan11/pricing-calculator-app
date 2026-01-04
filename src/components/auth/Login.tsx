import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';

interface LoginProps {
  onSignUpClick?: () => void;
  onForgotPasswordClick?: () => void;
}

/**
 * Login component providing a form for user authentication.
 * Includes email/password fields, Google sign-in, and links for recovery/registration.
 */
export const Login: React.FC<LoginProps> = ({ 
  onSignUpClick,
  onForgotPasswordClick 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Persist email in localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('last_login_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const emailError = touched.email && !email 
    ? 'Email is required.' 
    : touched.email && !validateEmail(email)
    ? 'Please enter a valid email address.'
    : undefined;

  const passwordError = touched.password && !password
    ? 'Password is required.'
    : undefined;

  const isFormValid = email && validateEmail(email) && password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({
      email: true,
      password: true,
    });

    if (!isFormValid) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await signIn(email, password);
      localStorage.setItem('last_login_email', email);
      
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/account';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpClick = (e: React.MouseEvent) => {
    if (onSignUpClick) {
      e.preventDefault();
      onSignUpClick();
    }
  };

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    if (onForgotPasswordClick) {
      e.preventDefault();
      onForgotPasswordClick();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4 sm:px-0 animate-in fade-in duration-500">
      <Card>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heading text-ink-900 mb-3">Welcome Back</h1>
          <p className="text-ink-700 text-sm">Sign in to continue managing your pricing.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rust/5 border border-rust/20 rounded-sm flex flex-col gap-2 text-rust text-sm animate-in slide-in-from-top-2">
            <div className="flex gap-3">
              <Info size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-moss/5 border border-moss/20 rounded-sm flex gap-3 text-moss text-sm animate-in slide-in-from-top-2">
            <Info size={18} className="shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            placeholder="you@example.com"
            error={emailError}
            required
            autoComplete="email"
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
              placeholder="••••••••"
              error={passwordError}
              required
              autoComplete="current-password"
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
            <div className="flex justify-end">
              <Link 
                to="/auth/forgot-password" 
                onClick={handleForgotPasswordClick}
                className="text-xs text-clay hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            size="lg"
            isLoading={loading}
            disabled={!isFormValid || loading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-ink-700">
            Don&apos;t have an account?{' '}
            <Link 
              to="/auth/signup" 
              onClick={handleSignUpClick}
              className="text-clay font-medium hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
