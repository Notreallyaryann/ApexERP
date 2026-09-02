import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to inject Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mini_erp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor for handling auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('mini_erp_token');
        localStorage.removeItem('mini_erp_user');
      }
    }
    return Promise.reject(error);
  }
);

// 1. Auth API
export const authApi = {
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register', data),
  syncSupabase: (supabaseToken) => apiClient.post('/auth/sync', { supabaseToken }),
  getMe: () => apiClient.get('/auth/me'),
  listUsers: () => apiClient.get('/auth/users'),
  updateUserRole: (id, role) => apiClient.patch(`/auth/users/${id}/role`, { role }),
};

// 2. Customers CRM API
export const customerApi = {
  list: (params) => apiClient.get('/customers', { params }),
  getById: (id) => apiClient.get(`/customers/${id}`),
  create: (data) => apiClient.post('/customers', data),
  update: (id, data) => apiClient.put(`/customers/${id}`, data),
  delete: (id) => apiClient.delete(`/customers/${id}`),
  addNote: (id, data) => apiClient.post(`/customers/${id}/notes`, data),
};

// 3. Products API
export const productApi = {
  list: (params) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
  getCategories: () => apiClient.get('/products/categories'),
};

// 4. Inventory API
export const inventoryApi = {
  listMovements: (params) => apiClient.get('/inventory/movements', { params }),
  adjustStock: (data) => apiClient.post('/inventory/adjust', data),
};

// 5. Challans API
export const challanApi = {
  list: (params) => apiClient.get('/challans', { params }),
  getById: (id) => apiClient.get(`/challans/${id}`),
  create: (data) => apiClient.post('/challans', data),
  confirm: (id) => apiClient.post(`/challans/${id}/confirm`),
  cancel: (id, reason) => apiClient.post(`/challans/${id}/cancel`, { reason }),
  delete: (id) => apiClient.delete(`/challans/${id}`),
};

// 6. Invoices API
export const invoiceApi = {
  list: (params) => apiClient.get('/invoices', { params }),
  getInvoicePdfBlob: (id) =>
    apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  getChallanPdfBlob: (id) =>
    apiClient.get(`/invoices/${id}/challan-pdf`, { responseType: 'blob' }),
};

// 7. Dashboard API
export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
};

// 8. Upload API
export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
