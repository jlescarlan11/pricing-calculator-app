import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout, SyncManager } from './components/layout';
import { ProtectedRoute, AuthCallback } from './components/auth';
import { 
  CalculatorPage, 
  HelpPage, 
  FAQPage, 
  AccountPage, 
  AuthPage,
  UpdatePasswordPage,
  NotFoundPage
} from './pages';

function App() {
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

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<CalculatorPage />} />
          <Route path="/calculator" element={<Navigate to="/" replace />} />
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