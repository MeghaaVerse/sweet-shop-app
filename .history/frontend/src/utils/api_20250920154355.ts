import axios from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  Sweet,
  SweetsResponse,
  CreateSweetRequest,
  UpdateSweetRequest,
  InventoryLog,
  InventoryLogRequest,
  InventoryReport,
  StockAlert
} from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('API request token:', token ? 'Token exists' : 'No token found');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Success Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.log('API Error Response:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post('/auth/login', data).then(res => res.data),
    
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post('/auth/register', data).then(res => res.data),
    
  getProfile: (): Promise<{ user: any }> =>
    api.get('/auth/profile').then(res => res.data),
};

// Sweets API
export const sweetsAPI = {
  getAll: (params?: any): Promise<SweetsResponse> =>
    api.get('/sweets', { params }).then(res => res.data),
    
  getById: (id: string): Promise<Sweet> =>
    api.get(`/sweets/${id}`).then(res => res.data),
    
  create: (data: CreateSweetRequest): Promise<Sweet> =>
    api.post('/sweets', data).then(res => res.data),
    
  update: (id: string, data: UpdateSweetRequest): Promise<Sweet> =>
    api.put(`/sweets/${id}`, data).then(res => res.data),
    
  delete: (id: string): Promise<{ message: string }> =>
    api.delete(`/sweets/${id}`).then(res => res.data),
    
  getCategories: (): Promise<{ categories: Array<{ name: string; count: number }> }> =>
    api.get('/sweets/categories').then(res => res.data),
};

// Inventory API
export const inventoryAPI = {
  logChange: (data: InventoryLogRequest): Promise<InventoryLog> =>
    api.post('/inventory/log', data).then(res => res.data),
    
  getLogs: (params?: any): Promise<{ logs: InventoryLog[]; pagination: any }> =>
    api.get('/inventory/logs', { params }).then(res => res.data),
    
  getReport: (params?: any): Promise<InventoryReport> =>
    api.get('/inventory/report', { params }).then(res => res.data),
    
  getAlerts: (params?: any): Promise<{ alerts: StockAlert[]; total: number; summary: any }> =>
    api.get('/inventory/alerts', { params }).then(res => res.data),
};