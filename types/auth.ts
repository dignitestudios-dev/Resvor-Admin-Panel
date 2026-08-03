// Auth-related TypeScript types for Resvor Admin

export interface Admin {
  _id: string;
  name: string;
  fullName?: string;
  email: string;
  role: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  admin: Admin;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginResponseData;
}

export interface MeResponse {
  success: boolean;
  message: string;
  data: Admin;
}
