const isDev = process.env.NODE_ENV === 'development';

export const API_BASE = isDev
  ? 'http://localhost:5062'
  : (process.env.NEXT_PUBLIC_API_URL ?? 'http://100.4.10.104');

export const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
})