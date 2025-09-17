import { useEffect, useState } from 'react';
import { create, list, update } from '../../utils/fakeApi.js';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function SeatingPlanPage() {
  const [plans, setPlans] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([{ id: 'R101', name: 'Exam Hall 1', capacity: 30 }]); // Mock rooms
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    const [pl, st] = await Promise.all([list('examsSeating'), list('students')]);
    setPlans(pl);
    setStudents(st);
    if (pl.length && !selectedPlan) setSelectedPlan(pl[0]);
  };
  useEffect(() => { load(); }, []);

  const createPlan = async (data) => {
    const newPlan = await create('examsSeating', {
      name: data.name,
      roomId: data.roomId,
      layout: [], // Seats array: [{ id, studentId }]
    });
    toast.success('Seating plan created');
    reset(); load();
  };

  const generateSeats = async () => {
    if (!selectedPlan) return toast.error('Select a plan first');
    const room = rooms.find(r => r.id === selectedPlan.roomId);
    if (!room) return toast.error('Room not found');

    // Simple sequential assignment of students to available capacity
    const availableStudents = students.slice(0, room.capacity);
    const newLayout = availableStudents.map((st, i) => ({
      id: `seat-${i+1}`,
      studentId: st.id,
      name: st.name,
      row: Math.floor(i / 5) + 1, // 5 columns per row mock
      col: (i % 5) + 1,
    }));

    await update('examsSeating', selectedPlan.id, { layout: newLayout });
    toast.success(`${newLayout.length} seats generated and assigned.`);
    load();
  };

  const layoutStudents = selectedPlan?.layout || [];
  const rows = Math.max(...layoutStudents.map(s => s.row), 1);
  const cols = Math.max(...layoutStudents.map(s => s.col), 1);
  
  // Create a 2D array representation for visualization
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  layoutStudents.forEach(s => {
    if (s.row > 0 && s.col > 0) {
      grid[s.row - 1][s.col - 1] = s;
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Exam Seating Plan</h1>

      <form onSubmit={handleSubmit(createPlan)} className="bg-white dark:bg-gray-800 rounded p-4 shadow grid md:grid-cols-3 gap-3">
        <input placeholder="Plan Name (e.g., Midterm Maths)" {...register('name')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required />
        <select {...register('roomId')} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" required>
            <option value="">Select Room</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>)}
        </select>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Create Plan</button>
      </form>

      <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-2">
              <div className="font-semibold mb-2">Select Plan</div>
              {plans.map(p => (
                <div key={p.id} className={`p-2 rounded cursor-pointer ${selectedPlan?.id === p.id ? 'bg-brand-100 dark:bg-brand-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`} onClick={() => setSelectedPlan(p)}>
                  {p.name} ({p.roomId})
                </div>
              ))}
              {plans.length === 0 && <div className="text-sm text-gray-500">No plans found.</div>}
            </div>
          </div>
          
          <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
            <div className="flex justify-between items-center">
              <div className="font-semibold">{selectedPlan?.name || 'Seating Preview'}</div>
              <button onClick={generateSeats} disabled={!selectedPlan} className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1 rounded disabled:opacity-50">Auto-Assign Seats</button>
            </div>

            <div className="overflow-auto p-4 border border-dashed rounded bg-gray-50 dark:bg-gray-700">
                {grid.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-4 mb-4 justify-center">
                        {row.map((seat, cIdx) => (
                            <div key={cIdx} className={`w-32 h-20 border rounded flex items-center justify-center text-center text-xs p-1 ${seat ? 'bg-green-100 dark:bg-green-900 border-green-500' : 'bg-gray-200 dark:bg-gray-600 border-gray-400'}`}>
                                {seat ? (
                                    <div className="font-medium">{seat.name}</div>
                                ) : (
                                    <div className="text-gray-500">Seat {rIdx+1}-{cIdx+1}</div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
                {layoutStudents.length === 0 && selectedPlan && <div className="text-center text-gray-500">No seats generated yet. Click Auto-Assign.</div>}
            </div>
          </div>
      </div>
    </div>
  );
}