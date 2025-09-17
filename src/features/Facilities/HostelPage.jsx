import { useEffect, useState } from 'react';
import { list, update } from '../../utils/fakeApi.js';
import toast from 'react-hot-toast';

export default function HostelPage() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignPick, setAssignPick] = useState({}); // roomId -> studentId

  const load = async () => {
    const [r, s] = await Promise.all([list('hostelRooms'), list('students')]);
    setRooms(r.map(x => ({ ...x, occupants: x.occupants || [] })));
    setStudents(s);
  };
  useEffect(() => { load(); }, []);

  const occupantName = (id) => students.find(s => s.id === id)?.name || id;
  const currentlyAllocated = (studentId) => rooms.find(r => (r.occupants||[]).includes(studentId));

  const allocate = async (roomId) => {
    const studentId = assignPick[roomId];
    if (!studentId) return;
    const current = currentlyAllocated(studentId);
    if (current?.id === roomId) return toast('Student already in room');
    if (current) return toast.error('Student is already allocated to another room');
    const room = rooms.find(r => r.id === roomId);
    if ((room.occupants || []).length >= room.capacity) return toast.error('Room is full');

    const updated = { ...room, occupants: [...(room.occupants||[]), studentId] };
    await update('hostelRooms', roomId, updated);
    toast.success('Allocated');
    setAssignPick(p => ({ ...p, [roomId]: '' }));
    load();
  };

  const unassign = async (roomId, studentId) => {
    const room = rooms.find(r => r.id === roomId);
    const updated = { ...room, occupants: (room.occupants || []).filter(id => id !== studentId) };
    await update('hostelRooms', roomId, updated);
    toast.success('Unassigned');
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hostel Allocation</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {rooms.map(room => (
          <div key={room.id} className="bg-white dark:bg-gray-800 rounded p-4 shadow">
            <div className="font-semibold">Room {room.roomNo}</div>
            <div className="text-sm text-gray-500">Capacity: {room.capacity} • Occupied: {room.occupants?.length||0}</div>
            <div className="mt-3 space-y-1">
              {(room.occupants||[]).map(occ => (
                <div key={occ} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                  <span>{occupantName(occ)}</span>
                  <button className="text-red-600" onClick={()=>unassign(room.id, occ)}>Remove</button>
                </div>
              ))}
              {(room.occupants||[]).length === 0 && <div className="text-xs text-gray-500">No occupants</div>}
            </div>
            <div className="mt-3 flex gap-2">
              <select className="flex-1 rounded border px-2 py-1 bg-gray-50 dark:bg-gray-700" value={assignPick[room.id] || ''} onChange={e => setAssignPick(p => ({ ...p, [room.id]: e.target.value }))}>
                <option value="">Select student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button className="bg-brand-600 text-white px-3 py-1 rounded" onClick={()=>allocate(room.id)}>Allocate</button>
            </div>
          </div>
        ))}
        {rooms.length === 0 && <div className="text-sm text-gray-500">No rooms found</div>}
      </div>
    </div>
  );
}