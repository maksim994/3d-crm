import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useStore } from '@/store/useStore';

// Pages
import { Dashboard } from '@/pages/Dashboard';
import { Models } from '@/pages/Models';
import { ModelEdit } from '@/pages/ModelEdit';
import { Archive } from '@/pages/Archive';
import { Packaging } from '@/pages/Packaging';
import { Printers } from '@/pages/Printers';
import { Settings } from '@/pages/Settings';
import { LogisticsCalculator } from '@/pages/LogisticsCalculator';

function App() {
  const initialize = useStore((state) => state.initialize);
  const isLoading = useStore((state) => state.isLoading);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/models" element={<Models />} />
          <Route path="/models/new" element={<ModelEdit />} />
          <Route path="/models/:id" element={<ModelEdit />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/calculator" element={<LogisticsCalculator />} />
          <Route path="/packaging" element={<Packaging />} />
          <Route path="/printers" element={<Printers />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
