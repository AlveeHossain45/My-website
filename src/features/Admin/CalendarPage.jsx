import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { create, list, remove } from '../../utils/fakeApi.js';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const { register, handleSubmit, reset } = useForm();

  const load = async () => setEvents(await list('events'));
  useEffect(() => { load(); }, []);

  const add = async (data) => { 
    await create('events', data); 
    toast.success('Event added');
    reset(); 
    load(); 
  };
  const del = async (id) => { 
    await remove('events', id); 
    load(); 
  };

  // --- Calendar Generation Logic ---
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const daysInMonth = endOfMonth.date();
  const startDayOfWeek = startOfMonth.day(); // 0 for Sunday, 1 for Monday...

  const days = [];
  // Add blank placeholders for days before the 1st
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  // Add the actual days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(startOfMonth.date(i));
  }

  const changeMonth = (offset) => {
    setCurrentDate(prev => prev.add(offset, 'month'));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form on the left for desktop, top for mobile */}
        <form onSubmit={handleSubmit(add)} className="p-6 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800 lg:col-span-1 h-fit">
          <div className="text-lg font-semibold">Add New Event</div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input placeholder="e.g., Midterm Exams" {...register('title')} className="w-full px-3 py-2 mt-1 text-gray-900 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input type="date" {...register('date')} className="w-full px-3 py-2 mt-1 text-gray-900 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select {...register('type')} className="w-full px-3 py-2 mt-1 text-gray-900 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white">
              <option>Holiday</option>
              <option>Exam</option>
              <option>Event</option>
              <option>Deadline</option>
            </select>
          </div>
          <button className="w-full px-4 py-2 font-semibold text-white rounded-md shadow-sm bg-brand-600 hover:bg-brand-700">Add Event</button>
        </form>

        {/* Calendar on the right for desktop, bottom for mobile */}
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => changeMonth(-1)} className="px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">&lt;</button>
            <div className="text-xl font-semibold">{currentDate.format('MMMM YYYY')}</div>
            <button onClick={() => changeMonth(1)} className="px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">&gt;</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-sm font-semibold text-center text-gray-500">
            {WEEKDAYS.map(day => <div key={day} className="py-2">{day}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, index) => {
              const es = d ? events.filter(e => e.date === d.format('YYYY-MM-DD')) : [];
              const isToday = d && d.isSame(dayjs(), 'day');
              
              return (
                <div key={index} className={`relative border border-gray-200 dark:border-gray-700 rounded-md aspect-square p-1.5 overflow-auto text-left ${d ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                  {d && (
                    <>
                      <div className={`text-xs font-medium text-gray-600 dark:text-gray-400 ${isToday ? 'w-5 h-5 flex items-center justify-center rounded-full bg-brand-600 text-white font-bold' : ''}`}>
                        {d.format('D')}
                      </div>
                      <div className="mt-1 space-y-1">
                        {es.map(e => (
                          <div key={e.id} className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded px-1 py-0.5 flex justify-between items-center group">
                            <span className="truncate">{e.title}</span>
                            <button className="text-red-600 transition-opacity opacity-0 group-hover:opacity-100" onClick={() => del(e.id)}>x</button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}