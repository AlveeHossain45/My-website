import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './contexts/ThemeContext.jsx';
import AppLayout from './components/Layout/AppLayout.jsx';
import AuthLayout from './components/Layout/AuthLayout.jsx';
import LoginPage from './features/Auth/LoginPage.jsx';
import DashboardPage from './features/Dashboard/DashboardPage.jsx';
import routes from './router/routes.jsx';
import ProtectedRoute from './router/ProtectedRoute.jsx';

export default function App() {
  const { theme } = useTheme();

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {routes.map(r => (
            <Route key={r.path} path={r.path} element={<r.element />} />
          ))}
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}