import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SignUp, Login, ForgotPassword } from '../components/auth';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Check, Cloud } from 'lucide-react';

type AuthView = 'onboarding' | 'signin' | 'signup' | 'forgot-password';

export const AuthPage: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const view: AuthView = (() => {
    const path = location.pathname;
    if (path === '/auth/signup') return 'signup';
    if (path === '/auth/login') return 'signin';
    if (path === '/auth/forgot-password') return 'forgot-password';
    return 'onboarding';
  })();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-clay">Loading...</div>
      </div>
    );
  }

  if (user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/account';
    return <Navigate to={from} replace />;
  }

  if (view === 'signup') {
    return (
      <div className="animate-in fade-in duration-500">
        <SignUp onSignInClick={() => navigate('/auth/login')} />
        <div className="max-w-md mx-auto px-4 -mt-8 mb-12 text-center">
          <button 
            onClick={() => navigate('/auth/login')}
            className="text-sm text-ink-500 hover:text-clay transition-colors"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  if (view === 'signin') {
    return (
      <div className="animate-in fade-in duration-500">
        <Login 
          onSignUpClick={() => navigate('/auth/signup')}
          onForgotPasswordClick={() => navigate('/auth/forgot-password')}
        />
        <div className="max-w-md mx-auto px-4 -mt-8 mb-12 text-center">
          <button 
            onClick={() => navigate('/auth')}
            className="text-sm text-ink-500 hover:text-clay transition-colors"
          >
            ← Back to options
          </button>
        </div>
      </div>
    );
  }

  if (view === 'forgot-password') {
    return (
      <div className="animate-in fade-in duration-500">
        <ForgotPassword onLoginClick={() => navigate('/auth/login')} />
        <div className="max-w-md mx-auto px-4 -mt-8 mb-12 text-center">
          <button 
            onClick={() => navigate('/auth/login')}
            className="text-sm text-ink-500 hover:text-clay transition-colors"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in duration-500">
      <Card className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-clay/10 rounded-full text-clay">
            <Cloud size={32} />
          </div>
        </div>
        
        <h1 className="text-3xl font-heading text-ink-900 mb-2">Sync Your Work</h1>
        <p className="text-ink-700 mb-8">
          Create an account to save your pricing calculations and access them from any device.
        </p>

        <div className="space-y-4 text-left mb-10 bg-surface-hover p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <Check className="text-moss mt-0.5 shrink-0" size={18} />
            <span className="text-sm text-ink-700">Cloud synchronization across all your devices</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="text-moss mt-0.5 shrink-0" size={18} />
            <span className="text-sm text-ink-700">Secure backup of your product library</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="text-moss mt-0.5 shrink-0" size={18} />
            <span className="text-sm text-ink-700">Manage multiple variants per product</span>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/auth/signup', { state: location.state })} 
            className="w-full justify-center"
            size="lg"
          >
            Create Account
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => navigate('/auth/login', { state: location.state })} 
            className="w-full justify-center"
            size="lg"
          >
            Sign In with Email
          </Button>
        </div>
      </Card>
    </div>
  );
};