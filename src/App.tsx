import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { CalculatorPage, HelpPage, FAQPage } from './pages';

function App() {
  const [sidebar, setSidebar] = useState<React.ReactNode>(null);

  return (
    <AppLayout sidebar={sidebar}>
      <Routes>
        <Route path="/" element={<CalculatorPage setSidebar={setSidebar} />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/faq" element={<FAQPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
