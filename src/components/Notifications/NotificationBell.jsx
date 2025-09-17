import { useNotifications } from '../../contexts/NotificationContext.jsx';
import { BellIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import dayjs from 'dayjs';

export default function NotificationBell() {
  const { notifications, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button className="relative p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setOpen(!open)}>
        <BellIcon className="w-6 h-6" />
        {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 grid place-items-center">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 bg-white dark:bg-gray-800 rounded shadow-lg p-2">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="font-semibold">Notifications</div>
            <button className="text-sm text-brand-600" onClick={markAllRead}>Mark all read</button>
          </div>
          <div className="max-h-80 overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.length === 0 ? <div className="p-4 text-sm text-gray-500">No notifications</div> :
              notifications.map(n => (
                <div key={n.id} className="p-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-xs text-gray-500">{dayjs(n.createdAt).fromNow()}</div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">{n.body}</div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}