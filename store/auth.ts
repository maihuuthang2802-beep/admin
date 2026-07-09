// store/auth.ts
'use client';
import { create } from 'zustand';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function clearAuth() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_role');
}

interface AuthState {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  isAuthenticated: false,

  init: () => {
    const token = localStorage.getItem('admin_token');
    const role = localStorage.getItem('admin_role');
    if (token && !isTokenExpired(token)) {
      set({ token, role, isAuthenticated: true });
    } else if (token) {
      clearAuth();
      set({ token: null, role: null, isAuthenticated: false });
    }
  },

  login: async (username, password) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Sai tên đăng nhập hoặc mật khẩu');
    const { access_token, role } = await res.json();
    localStorage.setItem('admin_token', access_token);
    localStorage.setItem('admin_role', role);
    set({ token: access_token, role, isAuthenticated: true });
  },

  logout: () => {
    clearAuth();
    set({ token: null, role: null, isAuthenticated: false });
  },
}));
