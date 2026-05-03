import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const BASE_URL =
  ((Constants.expoConfig?.extra as Record<string, unknown> | undefined)?.['apiUrl'] as
    | string
    | undefined) ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — inject Authorization header from SecureStore
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // SecureStore not available (web/test environment)
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Response interceptor — handle 401 by clearing auth and redirecting
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('accessToken');
      } catch {
        // ignore
      }
      router.replace('/(auth)/login');
    }
    return Promise.reject(error);
  },
);
