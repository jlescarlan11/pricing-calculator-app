import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout, SyncManager } from './components/layout';
import { ProtectedRoute, AuthCallback } from './components/auth';
import { useAuth } from './hooks/useAuth';
import { 
  CalculatorPage, 
  HelpPage, 
  FAQPage, 
  AccountPage, 
  AuthPage,
  UpdatePasswordPage,
  NotFoundPage,
  DashboardPage
} from './pages';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or a splash screen
  }

  return (
    <AppLayout>
      <SyncManager />
      <Routes>
        {/* Public Routes */}
        <Route path="/help" element={<HelpPage />} />
        <Route path="/faq" element={<FAQPage />} />
        
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/login" element={<AuthPage />} />
        <Route path="/auth/signup" element={<AuthPage />} />
        <Route path="/auth/forgot-password" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/update-password" element={<UpdatePasswordPage />} />

        {/* Calculator Routes (Publicly Accessible) */}
        <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/calculator/single" replace />} />
        <Route path="/calculator/single/:id?" element={<CalculatorPage />} />
        {/* Legacy redirect or handle variants route as single since they are merged */}
        <Route path="/calculator/variants/:id?" element={<CalculatorPage />} />
        <Route path="/calculator" element={<Navigate to="/calculator/single" replace />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/settings" element={<AccountPage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;