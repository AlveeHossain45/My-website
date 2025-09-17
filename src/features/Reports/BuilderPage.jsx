import { useEffect, useMemo, useState } from 'react';
import { list } from '../../utils/fakeApi.js';
import { exportCSV, exportPDF } from '../../utils/export.js';

const DATASETS = [
  { label: 'Students', resource: 'students' },
  { label: 'Teachers', resource: 'teachers' },
  { label: 'Payments', resource: 'payments' },
  { label: 'Payrolls', resource: 'payrolls' },
  { label: 'Attendance', resource: 'attendance' },
  { label: 'Grades', resource: 'grades' },
  { label: 'Books', resource: 'books' },
  { label: 'Borrows', resource: 'borrows' },
  { label: 'Fines', resource: 'fines' },
  { label: 'Inventory', resource: 'inventory' },
  { label: 'Stock Movements', resource: 'stockMovements' },
  { label: 'Admissions', resource: 'admissions' },
  { label: 'Events', resource: 'events' },
];

const OPS = ['equals','contains','gt','lt','gte','lte','before','after','is true','is false'];

function getVal(row, key) { return row?.[key]; }
function matchOp(val, op, cmp) {
  if (op === 'equals') return String(val) === String(cmp);
  if (op === 'contains') return String(val||'').toLowerCase().includes(String(cmp||'').toLowerCase());
  if (op === 'gt') return Number(val) > Number(cmp);
  if (op === 'lt') return Number(val) < Number(cmp);
  if (op === 'gte') return Number(val) >= Number(cmp);
  if (op === 'lte') return Number(val) <= Number(cmp);
  if (op === 'before') return new Date(val) < new Date(cmp);
  if (op === 'after') return new Date(val) > new Date(cmp);
  if (op === 'is true') return Boolean(val) === true;
  if (op === 'is false') return Boolean(val) === false;
  return true;
}

export default function ReportsBuilderPage() {
  const [dataset, setDataset] = useState(DATASETS[0].resource);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState([{ field: 'id', op: 'contains', value: '' }]);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);

  const load = async (resource) => {
    const data = await list(resource);
    setRows(data);
    const cols = Array.from(new Set(data.slice(0,10).flatMap(r => Object.keys(r || {}))));
    setColumns(cols);
    setSelectedCols(cols.slice(0, Math.min(6, cols.length)));
  };
  useEffect(() => { load(dataset); }, [dataset]);

  const filtered = useMemo(() => {
    return rows.filter(r => filters.every(f => matchOp(getVal(r, f.field), f.op, f.value)));
  }, [rows, filters]);

  const exportData = () => {
    const out = filtered.map(r => Object.fromEntries(selectedCols.map(c => [c, r[c]])));
    exportCSV(`${dataset}-report`, out);
    exportPDF(`${dataset}-report`, selectedCols, out);
  };

  const addFilter = () => setFilters(prev => [...prev, { field: columns[0], op: 'equals', value: '' }]);
  const updateFilter = (i, patch) => setFilters(prev => prev.map((f,idx)=> idx===i ? {...f, ...patch} : f));
  const removeFilter = (i) => setFilters(prev => prev.filter((_,idx)=> idx!==i));
  const toggleCol = (c) => setSelectedCols(prev => prev.includes(c) ? prev.filter(x => x!==c) : [...prev, c]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Custom Reports</h1>
        <div className="flex items-center gap-2">
          <select value={dataset} onChange={e=>setDataset(e.target.value)} className="rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700">
            {DATASETS.map(d => <option key={d.resource} value={d.resource}>{d.label}</option>)}
          </select>
          <button onClick={exportData} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">Export</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3">
        <div className="font-semibold">Filters</div>
        <div className="space-y-2">
          {filters.map((f,i)=>(
            <div key={i} className="grid md:grid-cols-4 gap-2">
              <select value={f.field} onChange={e=>updateFilter(i,{field:e.target.value})} className="rounded border px-2 py-1 bg-gray-50 dark:bg-gray-700">
                {columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={f.op} onChange={e=>updateFilter(i,{op:e.target.value})} className="rounded border px-2 py-1 bg-gray-50 dark:bg-gray-700">
                {OPS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <input value={f.value} onChange={e=>updateFilter(i,{value:e.target.value})} placeholder="Value" className="rounded border px-2 py-1 bg-gray-50 dark:bg-gray-700" />
              <div><button className="text-red-600" onClick={()=>removeFilter(i)}>Remove</button></div>
            </div>
          ))}
          <button className="text-brand-600" onClick={addFilter}>+ Add filter</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow">
        <div className="font-semibold mb-2">Columns</div>
        <div className="flex flex-wrap gap-2">
          {columns.map(c => (
            <label key={c} className={`px-2 py-1 rounded border cursor-pointer ${selectedCols.includes(c)?'bg-brand-50 border-brand-600':'border-gray-300 dark:border-gray-700'}`}>
              <input type="checkbox" checked={selectedCols.includes(c)} onChange={()=>toggleCol(c)} className="mr-2" />
              {c}
            </label>
          ))}
          {columns.length===0 && <div className="text-sm text-gray-500">No columns</div>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow overflow-auto">
        <div className="font-semibold mb-2">Preview ({filtered.length} rows)</div>
        <table className="min-w-full text-sm">
          <thead><tr>{selectedCols.map(c => <th key={c} className="p-2 text-left">{c}</th>)}</tr></thead>
          <tbody>
            {filtered.slice(0,100).map((r,idx) => (
              <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                {selectedCols.map(c => <td key={c} className="p-2">{String(r[c] ?? '')}</td>)}
              </tr>
            ))}
            {filtered.length===0 && <tr><td className="p-4 text-gray-500">No rows match</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}