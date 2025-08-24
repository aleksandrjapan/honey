import axios, { AxiosResponse } from 'axios';

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

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  _id: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderItemWithPopulatedProduct extends Omit<OrderItem, 'product'> {
  product: Product;
}

export interface PopulatedOrder extends Omit<Order, 'items'> {
  items: OrderItemWithPopulatedProduct[];
}

export interface CreateOrderData {
  customer: Customer;
  items: Array<{
    product: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}

export interface LoginResponse {
  token: string;
}

export interface OrderStatusResponse {
  status: OrderStatus;
}

const api = {
  // Аутентификация
  login: (email: string, password: string): Promise<AxiosResponse<LoginResponse>> => 
    axiosInstance.post('/auth/login', { email, password }),

  // Продукты
  getProducts: (): Promise<AxiosResponse<Product[]>> => 
    axiosInstance.get('/products'),
  
  getProduct: (id: string): Promise<AxiosResponse<Product>> => 
    axiosInstance.get(`/products/${id}`),

  // Заказы
  createOrder: (order: CreateOrderData): Promise<AxiosResponse<Order>> => 
    axiosInstance.post('/orders', order),
  
  getOrderById: (id: string): Promise<AxiosResponse<PopulatedOrder>> => 
    axiosInstance.get(`/orders/${id}`),
  
  getUserOrders: (email: string): Promise<AxiosResponse<PopulatedOrder[]>> => 
    axiosInstance.get(`/orders/user/${email}`),
  
  getOrderStatus: (id: string): Promise<AxiosResponse<OrderStatusResponse>> => 
    axiosInstance.get(`/orders/${id}/status`),

  // Админ функции
  getAllOrders: (): Promise<AxiosResponse<PopulatedOrder[]>> => 
    axiosInstance.get('/orders/admin/all'),
  
  updateOrderStatus: (orderId: string, status: OrderStatus): Promise<AxiosResponse<Order>> => 
    axiosInstance.patch(`/orders/admin/${orderId}/status`, { status })
};

export default api;