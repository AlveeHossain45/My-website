import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-brand-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Outlet />
    </div>
  );
}