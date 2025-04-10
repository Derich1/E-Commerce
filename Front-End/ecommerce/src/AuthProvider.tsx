// src/authProvider.ts
import { jwtDecode } from 'jwt-decode';
import { AuthProvider } from 'react-admin';

interface CustomJwtPayload {
  sub: string;
  iat: number;
  exp: number;
  roles?: string[];
}

export const authProvider: AuthProvider = {
  login: async ({ email, senha }) => {
    const response = await fetch('http://localhost:8081/cliente/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Login falhou');
    const responseBody = await response.json();

    const token = responseBody.token;
    localStorage.setItem('token', token);
    return Promise.resolve();
  },
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  checkAuth: () => {
    const token = localStorage.getItem('token');
    return token ? Promise.resolve() : Promise.reject();
  },
  checkError: (error) => {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem('token');
      return Promise.reject();
    }
    return Promise.resolve();
  },
  getPermissions: () => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve([]);
    
    const decoded = jwtDecode<CustomJwtPayload>(token);
    return Promise.resolve(decoded.roles || []);
  }
};