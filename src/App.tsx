import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { CalculatorPage, HelpPage, FAQPage, AuthPage, AccountPage } from './pages';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastProvider } from './components/shared';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<CalculatorPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AppLayout>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
