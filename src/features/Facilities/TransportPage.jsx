import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { create, list, remove, update } from '../../utils/fakeApi.js';

function parseStops(str) {
  return (str || '').split('|').map(s => s.trim()).filter(Boolean).map(s => {
    const [x,y] = s.split(',').map(Number);
    return { x: Math.max(0, Math.min(100, x||0)), y: Math.max(0, Math.min(100, y||0)) };
  });
}

export default function TransportPage() {
  const { register, handleSubmit, reset } = useForm();
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(false);
  const [position, setPosition] = useState(0); // 0..stops.length-1
  const timerRef = useRef(null);

  const load = async () => {
    const [rt, bs] = await Promise.all([list('transportRoutes'), list('buses')]);
    setRoutes(rt); setBuses(bs);
    if (!selected && rt.length) setSelected(rt[0].id);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!running) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => setPosition(p => (p + 1) % ((current()?.stops?.length || 1))), 1200);
    return () => clearInterval(timerRef.current);
  }, [running, routes, selected]);

  const current = () => routes.find(r => r.id === selected);

  const add = async (data) => {
    const stops = parseStops(data.stops);
    const row = await create('transportRoutes', { name: data.name, busId: data.busId, stops });
    reset(); setRoutes(r => [row, ...r]);
    if (!selected) setSelected(row.id);
  };
  const del = async (id) => { await remove('transportRoutes', id); load(); };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transport & GPS (Mock)</h1>

      <form onSubmit={handleSubmit(add)} className="bg-white dark:bg-gray-800 rounded p-4 shadow grid md:grid-cols-4 gap-3">
        <input placeholder="Route name" {...register('name')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <select {...register('busId')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
          <option value="">Select bus</option>
          {buses.map(b => <option key={b.id} value={b.id}>{b.plate}</option>)}
        </select>
        <input placeholder="Stops e.g., 10,10|40,20|80,75" {...register('stops')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Add route</button>
      </form>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold">Routes</div>
            <div className="space-x-2">
              <button className={`px-3 py-1 rounded ${running ? 'bg-red-600' : 'bg-brand-600'} text-white`} onClick={()=>setRunning(r=>!r)}>{running ? 'Stop' : 'Start'} simulation</button>
            </div>
          </div>
          <div className="space-y-2">
            {routes.map(r => (
              <div key={r.id} className={`p-3 rounded border ${selected===r.id ? 'border-brand-600' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-gray-500">Bus: {buses.find(b=>b.id===r.busId)?.plate || r.busId} • Stops: {r.stops?.length||0}</div>
                  </div>
                  <div className="space-x-2">
                    <button className="text-brand-600" onClick={()=>setSelected(r.id)}>View</button>
                    <button className="text-red-600" onClick={()=>del(r.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {routes.length===0 && <div className="text-sm text-gray-500">No routes yet.</div>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
          <div className="font-semibold mb-2">Map (Mock)</div>
          <div className="relative bg-gray-100 dark:bg-gray-700 rounded h-80 overflow-hidden">
            {current()?.stops?.map((s, i) => (
              <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-400" style={{ left: `${s.x}%`, top: `${s.y}%` }} />
            ))}
            {current()?.stops?.length > 0 && (
              <div className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-brand-600" style={{
                left: `${current().stops[position].x}%`, top: `${current().stops[position].y}%`
              }} title="Bus" />
            )}
          </div>
          <div className="text-xs text-gray-500 mt-2">This is a pure front-end mock. Integrate Leaflet/Mapbox + GPS later.</div>
        </div>
      </div>
    </div>
  );
}