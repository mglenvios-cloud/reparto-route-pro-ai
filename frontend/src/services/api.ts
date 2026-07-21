import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.tokens.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { companyName: string; email: string; password: string; name: string }) => api.post('/auth/register', data),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh-token', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export const companyApi = {
  get: () => api.get('/company'),
  update: (data: any) => api.put('/company', data),
  getStats: () => api.get('/company/stats'),
};

export const driverApi = {
  getAll: (params?: any) => api.get('/drivers', { params }),
  get: (id: string) => api.get(`/drivers/${id}`),
  create: (data: any) => api.post('/drivers', data),
  update: (id: string, data: any) => api.put(`/drivers/${id}`, data),
  delete: (id: string) => api.delete(`/drivers/${id}`),
  updateLocation: (id: string, data: any) => api.patch(`/drivers/${id}/location`, data),
};

export const vehicleApi = {
  getAll: (params?: any) => api.get('/vehicles', { params }),
  getLocations: () => api.get('/vehicles/locations'),
  get: (id: string) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
};

export const customerApi = {
  getAll: (params?: any) => api.get('/customers', { params }),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

export const orderApi = {
  getAll: (params?: any) => api.get('/orders', { params }),
  get: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  update: (id: string, data: any) => api.put(`/orders/${id}`, data),
  delete: (id: string) => api.delete(`/orders/${id}`),
  assign: (id: string, driverId: string) => api.patch(`/orders/${id}/assign`, { driverId }),
  updateStatus: (id: string, data: any) => api.patch(`/orders/${id}/status`, data),
  getByDriver: (driverId: string) => api.get(`/orders/driver/${driverId}`),
};

export const visitApi = {
  getAll: (params?: any) => api.get('/visits', { params }),
  get: (id: string) => api.get(`/visits/${id}`),
  create: (data: any) => api.post('/visits', data),
  update: (id: string, data: any) => api.put(`/visits/${id}`, data),
  updateStatus: (id: string, data: any) => api.patch(`/visits/${id}/status`, data),
};

export const routeApi = {
  getAll: (params?: any) => api.get('/routes', { params }),
  get: (id: string) => api.get(`/routes/${id}`),
  create: (data: any) => api.post('/routes', data),
  update: (id: string, data: any) => api.put(`/routes/${id}`, data),
  optimize: (id: string) => api.post(`/routes/${id}/optimize`),
  getPath: (id: string) => api.get(`/routes/${id}/path`),
  start: (id: string) => api.patch(`/routes/${id}/start`),
  complete: (id: string) => api.patch(`/routes/${id}/complete`),
};

export const importApi = {
  uploadFile: (formData: FormData) => api.post('/import/file', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  importText: (data: any) => api.post('/import/text', data),
  importGoogleSheets: (data: any) => api.post('/import/google-sheets', data),
  importAPI: (data: any) => api.post('/import/api', data),
};

export const reportApi = {
  getDeliveries: (params?: any) => api.get('/reports/deliveries', { params }),
  getVisits: (params?: any) => api.get('/reports/visits', { params }),
  getProductivity: () => api.get('/reports/productivity'),
  getFuel: (params?: any) => api.get('/reports/fuel', { params }),
  getRanking: () => api.get('/reports/ranking'),
};

export const aiApi = {
  optimizeRoute: (waypoints: any) => api.post('/ai/optimize', { waypoints }),
  detectDelays: (routeId: string) => api.get(`/ai/delays/${routeId}`),
  detectAddress: (data: any) => api.post('/ai/detect-address', data),
  generateReport: (data: any) => api.post('/ai/generate-report', data),
  getSuggestions: () => api.get('/ai/suggestions'),
};
