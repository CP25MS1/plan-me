import axios from 'axios';

export const geocodingClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GEOCODING_URL,
  headers: { 'Content-Type': 'application/json' },
});
