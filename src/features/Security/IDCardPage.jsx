import { useEffect, useState } from 'react';
import { list } from '../../utils/fakeApi.js';
import QRCode from 'qrcode';

const SECRET = 'EDUSYS_DEMO_SECRET';
const sign = (uid) => btoa(`${uid}|${SECRET}`);
const verifySig = (uid, sig) => sig === sign(uid);

export default function IDCardPage() {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [qr, setQr] = useState('');

  useEffect(() => { list('users').then(setUsers); }, []);

  useEffect(() => {
    if (!userId) { setQr(''); return; }
    const sig = sign(userId);
    const url = `${window.location.origin}/security/verify?uid=${encodeURIComponent(userId)}&sig=${encodeURIComponent(sig)}`;
    QRCode.toDataURL(url).then(setQr);
  }, [userId]);

  const user = users.find(u => u.id === userId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Digital ID & QR</h1>
      <div className="bg-white dark:bg-gray-800 rounded p-4 shadow space-y-3 max-w-lg">
        <select className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-700" value={userId} onChange={e=>setUserId(e.target.value)}>
          <option value="">Select user</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
        </select>

        {user && (
          <div className="border rounded p-4 bg-gray-50 dark:bg-gray-700 flex gap-4 items-center">
            <div className="w-24 h-24 rounded bg-brand-600 text-white grid place-items-center text-3xl">{user.name?.charAt(0)}</div>
            <div className="flex-1">
              <div className="font-semibold text-lg">{user.name}</div>
              <div className="text-sm text-gray-500">Role: {user.role}</div>
              <div className="text-sm text-gray-500">ID: {user.id}</div>
              <div className="text-xs text-gray-500">Verifiable via QR</div>
            </div>
            {qr && <img src={qr} alt="QR" className="w-28 h-28" />}
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500">In production, signatures come from a backend or blockchain ledger.</div>
    </div>
  );
}