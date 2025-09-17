import { useEffect, useState } from 'react';
import { list, update } from '../../utils/fakeApi.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function ParentTransportPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);

  const load = async () => {
    const [st, rt, bs] = await Promise.all([list('students'), list('transportRoutes'), list('buses')]);
    setChildren(st.filter(s => s.parentId === user.id));
    setRoutes(rt);
    setBuses(bs);
  };
  useEffect(() => { load(); }, []);

  const assign = async (studentId, routeId) => {
    await update('students', studentId, { routeId });
    toast.success('Assigned route');
    load();
  };

  const busPlate = id => buses.find(b => b.id === id)?.plate || id;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Transport</h1>
      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
        {children.map(ch => (
          <div key={ch.id} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="font-medium">{ch.name}</div>
              <div className="text-sm text-gray-500">Current: {ch.routeId ? `${routes.find(r=>r.id===ch.routeId)?.name} • Bus ${busPlate(routes.find(r=>r.id===ch.routeId)?.busId)}` : 'Not assigned'}</div>
            </div>
            <select value={ch.routeId || ''} onChange={e=>assign(ch.id, e.target.value)} className="rounded border px-2 py-1 bg-gray-50 dark:bg-gray-700">
              <option value="">Select route</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name} • Bus {busPlate(r.busId)}</option>)}
            </select>
          </div>
        ))}
        {children.length===0 && <div className="text-sm text-gray-500">No linked children</div>}
      </div>
    </div>
  );
}