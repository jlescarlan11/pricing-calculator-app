import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { CalculatorPage, FAQPage, AuthPage, AccountPage } from './pages';
import { AuthProvider } from './context/AuthContext';
import { PresetsProvider } from './context/PresetsContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastProvider } from './components/shared';

function App() {
  return (
    <AuthProvider>
      <PresetsProvider>
        <ToastProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<CalculatorPage />} />
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
      </PresetsProvider>
    </AuthProvider>
  );
}

export default App;
