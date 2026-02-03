import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { Login } from '@/pages/Login';

// Компонент для защищенных маршрутов
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('authToken');

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  const initialize = useStore((state) => state.initialize);
  const isLoading = useStore((state) => state.isLoading);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          const response = await fetch('/api/auth/check', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          });

          if (!response.ok) {
            // Токен невалиден, удаляем
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          localStorage.removeItem('authToken');
        }
      }
      
      setIsAuthChecked(true);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthChecked && localStorage.getItem('authToken')) {
      initialize();
    }
  }, [initialize, isAuthChecked]);

  if (!isAuthChecked || (isLoading && localStorage.getItem('authToken'))) {
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
      <Routes>
        {/* Публичный маршрут - логин */}
        <Route path="/login" element={<Login />} />

        {/* Защищенные маршруты */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/models"
          element={
            <ProtectedRoute>
              <Layout>
                <Models />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/models/new"
          element={
            <ProtectedRoute>
              <Layout>
                <ModelEdit />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/models/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ModelEdit />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/archive"
          element={
            <ProtectedRoute>
              <Layout>
                <Archive />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calculator"
          element={
            <ProtectedRoute>
              <Layout>
                <LogisticsCalculator />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/packaging"
          element={
            <ProtectedRoute>
              <Layout>
                <Packaging />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/printers"
          element={
            <ProtectedRoute>
              <Layout>
                <Printers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
