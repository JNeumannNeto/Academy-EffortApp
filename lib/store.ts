import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario } from '@/types';

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  setAuth: (usuario: Usuario, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
(set) => ({
      usuario: null,
      token: null,
      setAuth: (usuario, token) => {
  localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
  set({ usuario, token });
      },
  logout: () => {
        localStorage.removeItem('token');
 localStorage.removeItem('usuario');
      set({ usuario: null, token: null });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
