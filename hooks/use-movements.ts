import { useState, useEffect } from 'react';
import axios from '@/lib/axios-interceptor';

export interface Movement {
  id: string;
  concept: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovementData {
  concept: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
}

export interface UpdateMovementData extends CreateMovementData {
  id: string;
}

export interface MovementsFilters {
  search?: string;
  type?: 'INCOME' | 'EXPENSE' | 'ALL';
  dateFrom?: string;
  dateTo?: string;
}

export interface MovementsPagination {
  page: number;
  limit: number;
}

export interface MovementsResponse {
  movements: Movement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useMovements() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // buscar movimientos por filtros y paginación
  const fetchMovements = async (
    filters: MovementsFilters = {},
    pagination: MovementsPagination = { page: 1, limit: 10 }
  ): Promise<MovementsResponse> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      if (filters.search) params.append('search', filters.search);
      if (filters.type && filters.type !== 'ALL')
        params.append('type', filters.type);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await axios.get(`/api/movements?${params.toString()}`);

      if (response.data.success) {
        setMovements(response.data.movements);
        return {
          movements: response.data.movements,
          pagination: response.data.pagination,
        };
      } else {
        throw new Error(response.data.error || 'Error al cargar movimientos');
      }
    } catch (err: any) {
      // Si el error fue redirigido por el interceptor, manejar silenciosamente
      if (err.redirected) {
        // No mostrar error, solo retornar datos vacíos
        return {
          movements: [],
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: 0,
            totalPages: 0,
          },
        };
      }
      
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Error al cargar movimientos';
      setError(errorMessage);
      console.error('Error fetching movements:', err);
      // Devolver una respuesta vacía
      return {
        movements: [],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: 0,
          totalPages: 0,
        },
      };
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo movimiento
  const createMovement = async (
    data: CreateMovementData
  ): Promise<Movement> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/movements', data);

      if (response.data.success) {
        const newMovement = response.data.movement;
        setMovements((prev) => [newMovement, ...prev]);
        return newMovement;
      } else {
        throw new Error(response.data.error || 'Error al crear movimiento');
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
        err.response?.data?.error || err.message || 'Error al crear movimiento';
      setError(errorMessage);
      console.error('Error creating movement:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un movimiento
  const updateMovement = async (
    data: UpdateMovementData
  ): Promise<Movement> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(`/api/movements/${data.id}`, data);

      if (response.data.success) {
        const updatedMovement = response.data.movement;
        setMovements((prev) =>
          prev.map((movement) =>
            movement.id === data.id ? updatedMovement : movement
          )
        );
        return updatedMovement;
      } else {
        throw new Error(
          response.data.error || 'Error al actualizar movimiento'
        );
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
        'Error al actualizar movimiento';
      setError(errorMessage);
      console.error('Error updating movement:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un movimiento
  const deleteMovement = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(`/api/movements/${id}`);

      if (response.data.success) {
        setMovements((prev) => prev.filter((movement) => movement.id !== id));
      } else {
        throw new Error(response.data.error || 'Error al eliminar movimiento');
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
        'Error al eliminar movimiento';
      setError(errorMessage);
      console.error('Error deleting movement:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener un movimiento por ID
  const getMovement = async (id: string): Promise<Movement> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/movements/${id}`);

      if (response.data.success) {
        return response.data.movement;
      } else {
        throw new Error(response.data.error || 'Error al cargar movimiento');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Error al cargar movimiento';
      setError(errorMessage);
      console.error('Error getting movement:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener datos de estadísticas
  const getMovementsStats = async (timeRange = '6months') => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `/api/reports/financial?timeRange=${timeRange}`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Error al cargar estadísticas');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Error al cargar estadísticas';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    movements,
    loading,
    error,
    fetchMovements,
    createMovement,
    updateMovement,
    deleteMovement,
    getMovement,
    getMovementsStats,
    setError,
  };
}
