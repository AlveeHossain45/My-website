import { list } from '../utils/fakeApi.js';

export async function getUserByEmail(email) {
  const users = await list('users');
  return users.find(u => u.email === email) || null;
}