import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';

interface PasswordRequirement {
  id: string;
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { id: 'length', label: 'Minimum 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'uppercase', label: 'At least one uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'lowercase', label: 'At least one lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { id: 'number', label: 'At least one number', test: (pw) => /[0-9]/.test(pw) },
  { id: 'special', label: 'At least one special character', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

interface SignUpProps {
  onSignInClick?: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSignInClick }) => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    terms: false,
  });

  const emailError = useMemo(() => {
    if (!touched.email || !email) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address.';
    return undefined;
  }, [email, touched.email]);

  const passwordRequirementsMet = useMemo(() => {
    return PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      met: req.test(password)
    }));
  }, [password]);

  const strengthScore = useMemo(() => {
    return passwordRequirementsMet.filter(req => req.met).length;
  }, [passwordRequirementsMet]);

  const passwordError = useMemo(() => {
    if (!touched.password || !password) return undefined;
    if (strengthScore < PASSWORD_REQUIREMENTS.length) return 'Password does not meet all requirements.';
    return undefined;
  }, [password, touched.password, strengthScore]);

  const confirmPasswordError = useMemo(() => {
    if (!touched.confirmPassword || !confirmPassword) return undefined;
    if (confirmPassword !== password) return 'Passwords do not match.';
    return undefined;
  }, [password, confirmPassword, touched.confirmPassword]);

  const termsError = useMemo(() => {
    if (!touched.terms) return undefined;
    if (!agreeToTerms) return 'You must agree to the terms and privacy policy.';
    return undefined;
  }, [agreeToTerms, touched.terms]);

  const isFormValid = 
    email && 
    !emailError && 
    password && 
    strengthScore === PASSWORD_REQUIREMENTS.length && 
    confirmPassword === password && 
    agreeToTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    try {
      await signUp(email, password);
      navigate('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 px-4 sm:px-0">
      <Card>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heading text-ink-900 mb-3">Create Account</h1>
          <p className="text-ink-700 text-sm">Join us to start managing your pricing intentionally.</p>
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
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            placeholder="you@example.com"
            error={emailError}
            required
            autoComplete="email"
          />

          <div className="space-y-2">
            <Input
              label="Password"
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

            {/* Password Strength Indicator */}
            {password && (
              <div className="pt-1">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                        step <= strengthScore
                          ? strengthScore <= 2
                            ? 'bg-rust'
                            : strengthScore <= 4
                            ? 'bg-clay'
                            : 'bg-moss'
                          : 'bg-border-subtle'
                      }`}
                    />
                  ))}
                </div>
                <ul className="space-y-1.5" aria-label="Password requirements">
                  {passwordRequirementsMet.map((req) => (
                    <li key={req.id} className="flex items-center gap-2 text-[12px]">
                      {req.met ? (
                        <Check size={12} className="text-moss" />
                      ) : (
                        <X size={12} className="text-ink-500" />
                      )}
                      <span className={req.met ? 'text-ink-900' : 'text-ink-500'}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
            placeholder="••••••••"
            error={confirmPasswordError}
            required
            autoComplete="new-password"
          />

          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  onBlur={() => setTouched(prev => ({ ...prev, terms: true }))}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-border-base bg-bg-main transition-all checked:bg-clay checked:border-clay hover:border-clay/50 focus:outline-none focus:ring-2 focus:ring-clay/20"
                  required
                />
                <Check className="absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100 left-0.5" />
              </div>
              <span className="text-sm text-ink-700 leading-tight">
                I agree to the <Link to="/terms" className="text-clay hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-clay hover:underline">Privacy Policy</Link>.
              </span>
            </label>
            {termsError && (
              <p className="text-[12px] text-rust animate-in fade-in" role="alert">
                {termsError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            size="lg"
            isLoading={loading}
            disabled={!isFormValid || loading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-ink-700">
            Already have an account?{' '}
            <Link 
              to="/auth" 
              onClick={(e) => {
                if (onSignInClick) {
                  e.preventDefault();
                  onSignInClick();
                }
              }}
              className="text-clay font-medium hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
