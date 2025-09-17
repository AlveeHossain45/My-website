import { useForm } from 'react-hook-form';
import { useNotifications } from '../../contexts/NotificationContext.jsx';

export default function NotificationsPage() {
  const { register, handleSubmit, reset } = useForm();
  const { push } = useNotifications();

  const send = (data) => {
    push({ title: data.title, body: data.body, audience: data.audience });
    reset();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <form onSubmit={handleSubmit(send)} className="bg-white dark:bg-gray-800 rounded p-4 shadow grid md:grid-cols-3 gap-3">
        <input placeholder="Title" {...register('title')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 md:col-span-1" required />
        <select {...register('audience')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 md:col-span-1">
          <option>All</option><option>Students</option><option>Teachers</option><option>Parents</option><option>Staff</option>
        </select>
        <input placeholder="Message body" {...register('body')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700 md:col-span-2" required />
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded md:col-span-1">Send</button>
      </form>
    </div>
  );
}