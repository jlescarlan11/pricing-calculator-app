import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';

interface ForgotPasswordProps {
  onLoginClick?: () => void;
}

/**
 * ForgotPassword component allows users to request a password reset link.
 */
export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ 
  onLoginClick 
}) => {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const emailError = touched && !email 
    ? 'Email is required.' 
    : touched && !validateEmail(email)
    ? 'Please enter a valid email address.'
    : undefined;

  const isFormValid = email && validateEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    if (onLoginClick) {
      e.preventDefault();
      onLoginClick();
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
          <h1 className="text-3xl font-heading text-ink-900 mb-3">Check Your Email</h1>
          <p className="text-ink-700 mb-8">
            We&apos;ve sent a password reset link to <span className="font-medium text-ink-900">{email}</span>.
          </p>
          
          {import.meta.env.DEV && (
            <div className="mb-8 p-3 bg-clay/5 border border-clay/20 rounded text-xs text-left text-ink-700">
              <p className="font-medium mb-1 text-center">Developer Note:</p>
              <p>In local development, check <strong>Inbucket</strong> at <a href="http://localhost:54324" target="_blank" rel="noopener noreferrer" className="text-clay underline">localhost:54324</a> to see the reset password email.</p>
            </div>
          )}
          
          <div className="space-y-4">
            <p className="text-xs text-ink-500">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            <Button
              variant="secondary"
              className="w-full justify-center"
              onClick={() => setSuccess(false)}
            >
              Try Another Email
            </Button>
            <Link 
              to="/auth/login" 
              onClick={handleLoginClick}
              className="inline-flex items-center gap-2 text-clay hover:underline font-medium text-sm"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4 sm:px-0 animate-in fade-in duration-500">
      <Card>
        <div className="mb-8">
          <Link 
            to="/auth/login" 
            onClick={handleLoginClick}
            className="inline-flex items-center gap-2 text-ink-500 hover:text-ink-900 transition-colors text-sm mb-6"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
          <h1 className="text-3xl font-heading text-ink-900 mb-3">Forgot Password?</h1>
          <p className="text-ink-700 text-sm">
            No worries. Enter your email and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rust/5 border border-rust/20 rounded-sm flex gap-3 text-rust text-sm animate-in slide-in-from-top-2">
            <Info size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="you@example.com"
            error={emailError}
            required
            autoComplete="email"
            suffix={<Mail size={18} className="text-ink-500 p-0.5" />}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            size="lg"
            isLoading={loading}
            disabled={!isFormValid || loading}
          >
            Send Reset Link
          </Button>
        </form>
      </Card>
    </div>
  );
};
