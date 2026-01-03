import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { CalculatorPage, HelpPage, FAQPage } from './pages';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/faq" element={<FAQPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
