export type UserRole =
  | 'CITIZEN'
  | 'RELIEF_CAMP_MANAGER'
  | 'CONTROL_CENTRE_OPERATOR'
  | 'DMA_SUPERVISOR'
  | 'RELIEF_TEAM';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  managedCampId?: number | null;
  managedCamp?: {
    id: number;
    officialCode: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    capacity: number;
    currentOccupancy: number;
    operationalStatus: string;
    operationalNotes?: string | null;
  } | null;
  teams?: {
    id: number;
    teamName: string;
    contactNumber: string;
    status: string;
  }[];
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  managedCampId?: number;
}
