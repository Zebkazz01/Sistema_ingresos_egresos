import { useState } from 'react';
import axios from '@/lib/axios-interceptor';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'USER';
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sessions: number;
  };
}

export interface UpdateUserData {
  id: string;
  name?: string;
  role?: 'ADMIN' | 'USER';
  phone?: string;
}

export interface UsersFilters {
  search?: string;
  role?: 'ADMIN' | 'USER' | 'ALL';
}

export interface UsersPagination {
  page: number;
  limit: number;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  statistics: {
    totalUsers: number;
    adminCount: number;
    userCount: number;
  };
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar usuarios porpaginación
  const fetchUsers = async (
    filters: UsersFilters = {},
    pagination: UsersPagination = { page: 1, limit: 10 }
  ): Promise<UsersResponse> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      if (filters.search) params.append('search', filters.search);
      if (filters.role && filters.role !== 'ALL')
        params.append('role', filters.role);

      const response = await axios.get(`/api/users?${params.toString()}`);

      setUsers(response.data.users);
      return response.data;
    } catch (err: any) {
      // Si el error fue redirigido por el interceptor, retornar datos vacíos silenciosamente
      if (err.redirected) {
        // Devolver datos vacíos sin error al ser redirigido
        return {
          users: [],
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: 0,
            pages: 0,
          },
          statistics: {
            totalUsers: 0,
            adminCount: 0,
            userCount: 0,
          },
        };
      }
      
      const errorMessage =
        err.response?.data?.error || err.message || 'Error al cargar usuarios';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar usuarios
  const updateUser = async (data: UpdateUserData): Promise<User> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(`/api/users/${data.id}`, data);

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUsers((prev) =>
          prev.map((user) => (user.id === data.id ? updatedUser : user))
        );
        return updatedUser;
      } else {
        throw new Error(response.data.error || 'Error al actualizar usuario');
      }
    } catch (err: any) {
      // Si el error fue redirigido por el interceptor, lanzar error silencioso
      if (err.redirected) {
        // Lanzar un error especial que será manejado silenciosamente
        const silentError = new Error('Redirección por permisos');
        (silentError as any).silent = true;
        throw silentError;
      }
      
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Error al actualizar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Obtener información de usuario por ID
  const getUser = async (id: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/users/${id}`);

      if (response.data.success) {
        return response.data.user;
      } else {
        throw new Error(response.data.error || 'Error al cargar usuario');
      }
    } catch (err: any) {
      // Si el error fue redirigido por el interceptor, lanzar error silencioso
      if (err.redirected) {
        // Lanzar un error especial que será manejado silenciosamente
        const silentError = new Error('Redirección por permisos');
        (silentError as any).silent = true;
        throw silentError;
      }
      
      const errorMessage =
        err.response?.data?.error || err.message || 'Error al cargar usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUser,
    getUser,
    setError,
  };
}
