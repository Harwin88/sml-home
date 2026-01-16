export interface User {
  id: number;
  documentId?: string;
  email: string;
  phone: string;
  userType: 'regular' | 'provider';
  latitude?: number;
  longitude?: number;
  favorites?: any[];
  providerProfile?: any;
  reservations?: any[];
  providerReservations?: any[];
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
}

