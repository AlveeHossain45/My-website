import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotifications } from '../../contexts/NotificationContext.jsx';

export default function TeacherCommPage() {
  const { user } = useAuth();
  const { push } = useNotifications();
  const { register, handleSubmit, reset } = useForm();

  const send = (data) => {
    // Uses the NotificationContext to simulate pushing messages
    push({ 
      title: data.title || 'Announcement', 
      body: data.message, 
      audience: data.audience,
      sender: user.name,
      type: 'message'
    });
    toast.success(`Message sent to ${data.audience}`);
    reset();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Communication Center</h1>

      <form onSubmit={handleSubmit(send)} className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
        <div className="font-semibold">Send Message/Announcement</div>
        <div className="grid md:grid-cols-2 gap-3">
          <input placeholder="Title (Optional)" {...register('title')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" />
          <select {...register('audience')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="Students">My Students</option>
            <option value="Parents">My Students' Parents</option>
            <option value="Teachers">All Teachers</option>
          </select>
        </div>
        <div>
          <textarea placeholder="Your message..." {...register('message')} rows={5} className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Send Message</button>
      </form>
    </div>
  );
}