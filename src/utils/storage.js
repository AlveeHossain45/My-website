export const getItem = (k, fallback = null) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
export const setItem = (k, v) => localStorage.setItem(k, JSON.stringify(v));
export const removeItem = (k) => localStorage.removeItem(k);