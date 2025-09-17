import { createContext, useContext, useState } from 'react';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';

const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const push = (payload) => {
    setNotifications(prev => [{ id: nanoid(), createdAt: dayjs().toISOString(), read: false, ...payload }, ...prev].slice(0, 100));
  };
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <NotificationContext.Provider value={{ notifications, push, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}