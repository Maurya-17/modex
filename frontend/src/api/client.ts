import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Show {
  id: string;
  title: string;
  startTime: string;
  totalSeats: number;
  createdAt: string;
}

export interface Seat {
  seatNumber: number;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED';
}

export interface ShowSeats {
  showId: string;
  showTitle: string;
  seats: Seat[];
}

export interface Booking {
  id: string;
  showId: string;
  userId: string;
  seats: number[];
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  show?: {
    id: string;
    title: string;
    startTime: string;
  };
  user?: {
    id: string;
    name: string;
  };
}

export const showApi = {
  getAll: () => apiClient.get<Show[]>('/api/shows'),
  getSeats: (showId: string) => apiClient.get<ShowSeats>(`/api/shows/${showId}/seats`),
  createBooking: (showId: string, userId: string, seats: number[]) =>
    apiClient.post<{ bookingId: string; status: string; seats: number[] }>(
      `/api/shows/${showId}/book`,
      { userId, seats }
    ),
};

export const bookingApi = {
  get: (bookingId: string) => apiClient.get<Booking>(`/api/bookings/${bookingId}`),
  confirm: (bookingId: string) =>
    apiClient.post<{ bookingId: string; status: string }>(`/api/bookings/${bookingId}/confirm`),
  cancel: (bookingId: string) =>
    apiClient.delete<{ bookingId: string; status: string }>(`/api/bookings/${bookingId}/cancel`),
};

export const adminApi = {
  createShow: (title: string, startTime: string, totalSeats: number) =>
    apiClient.post<Show>('/api/admin/shows', { title, startTime, totalSeats }),
};

