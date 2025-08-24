import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const axiosInstance = axios.create({
  baseURL: API_URL
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

export interface OrderItem {
  product: string | Product;
  quantity: number;
  price: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  _id: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface CreateOrderData {
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
}

const api = {
  // Аутентификация
  login: (email: string, password: string) => 
    axiosInstance.post('/auth/login', { email, password }),

  // Продукты
  getProducts: () => axiosInstance.get<Product[]>('/products'),
  getProduct: (id: string) => axiosInstance.get<Product>(`/products/${id}`),

  // Заказы
  createOrder: (order: CreateOrderData) => axiosInstance.post<Order>('/orders', order),
  getOrderById: (id: string) => axiosInstance.get<Order>(`/orders/${id}`),
  getUserOrders: (email: string) => axiosInstance.get<Order[]>(`/orders/user/${email}`),
  getOrderStatus: (id: string) => axiosInstance.get<{ status: string }>(`/orders/${id}/status`),

  // Админ функции
  getAllOrders: () => axiosInstance.get<Order[]>('/orders/admin/all'),
  updateOrderStatus: (orderId: string, status: string) => 
    axiosInstance.patch(`/orders/admin/${orderId}/status`, { status })
};

export default api;