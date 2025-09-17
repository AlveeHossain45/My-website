import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import { getItem, setItem } from './storage.js';

const delay = (ms=200) => new Promise(res => setTimeout(res, ms));

function readAll() {
  return getItem('db', { users:[], schools:[], branches:[], classes:[], students:[], teachers:[], parents:[], subjects:[], exams:[], grades:[], assignments:[], attendance:[], fees:[], payments:[], payrolls:[], books:[], borrows:[], fines:[], tasks:[], shifts:[], leaves:[], notifications:[], messages:[], inventory:[], assets:[], transportRoutes:[], buses:[], hostelRooms:[], canteenMenus:[], healthRecords:[], auditLogs:[] });
}
function writeAll(db) { setItem('db', db); }

export async function list(resource, where={}) {
  await delay();
  const db = readAll();
  let rows = db[resource] || [];
  Object.keys(where).forEach(k => { rows = rows.filter(r => r[k] === where[k]); });
  return rows;
}

export async function get(resource, id) {
  await delay();
  const db = readAll();
  return (db[resource] || []).find(r => r.id === id) || null;
}

export async function create(resource, data, actor = null) {
  await delay();
  const db = readAll();
  const now = dayjs().toISOString();
  const row = { id: nanoid(), createdAt: now, updatedAt: now, ...data };
  db[resource] = [row, ...(db[resource] || [])];
  db.auditLogs = [{ id: nanoid(), ts: now, resource, action:'create', actor, data: row }, ...db.auditLogs].slice(0, 1000);
  writeAll(db);
  return row;
}

export async function update(resource, id, data, actor = null) {
  await delay();
  const db = readAll();
  const rows = db[resource] || [];
  const idx = rows.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Not found');
  rows[idx] = { ...rows[idx], ...data, updatedAt: dayjs().toISOString() };
  db[resource] = rows;
  db.auditLogs = [{ id: nanoid(), ts: dayjs().toISOString(), resource, action:'update', actor, data: rows[idx] }, ...db.auditLogs].slice(0, 1000);
  writeAll(db);
  return rows[idx];
}

export async function remove(resource, id, actor = null) {
  await delay();
  const db = readAll();
  const rows = db[resource] || [];
  const row = rows.find(r => r.id === id);
  db[resource] = rows.filter(r => r.id !== id);
  db.auditLogs = [{ id: nanoid(), ts: dayjs().toISOString(), resource, action:'delete', actor, data: row }, ...db.auditLogs].slice(0, 1000);
  writeAll(db);
  return true;
}