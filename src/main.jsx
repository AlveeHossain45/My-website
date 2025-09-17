import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { TenantProvider } from './contexts/TenantContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import { seedIfEmpty } from './mocks/seed.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
seedIfEmpty();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      {/* এখানে future prop যোগ করা হয়েছে */}
      <BrowserRouter future={{ v7_startTransition: true }}>
        <AuthProvider>
          <TenantProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </TenantProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);