import { renderHook, act } from '@testing-library/react';
import axios from 'axios';
import { useMovements } from '@/hooks/use-movements';

// Mock axios
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useMovements Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useMovements());

      expect(result.current.movements).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('fetchMovements', () => {
    it('should fetch movements successfully', async () => {
      const mockMovements = [
        {
          id: '1',
          concept: 'Test Income',
          amount: 1000,
          type: 'INCOME',
          date: '2024-01-15',
          user: { id: '1', name: 'Test User', email: 'test@test.com' },
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15',
        },
      ];

      const mockResponse = {
        data: {
          success: true,
          movements: mockMovements,
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMovements());

      await act(async () => {
        const response = await result.current.fetchMovements();
        expect(response).toEqual({
          movements: mockMovements,
          pagination: mockResponse.data.pagination,
        });
      });

      expect(result.current.movements).toEqual(mockMovements);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle fetch errors gracefully', async () => {
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useMovements());

      await act(async () => {
        const response = await result.current.fetchMovements();
        expect(response.movements).toEqual([]);
        expect(response.pagination.total).toBe(0);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });

    it('should build correct query parameters', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          movements: [],
          pagination: { page: 1, limit: 5, total: 0, totalPages: 0 },
        },
      });

      const { result } = renderHook(() => useMovements());

      const filters = {
        search: 'test',
        type: 'INCOME' as const,
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
      };

      const pagination = { page: 2, limit: 5 };

      await act(async () => {
        await result.current.fetchMovements(filters, pagination);
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/movements?page=2&limit=5&search=test&type=INCOME&dateFrom=2024-01-01&dateTo=2024-01-31'
      );
    });
  });

  describe('createMovement', () => {
    it('should create movement successfully', async () => {
      const newMovement = {
        concept: 'New Movement',
        amount: 500,
        date: '2024-01-15',
        type: 'EXPENSE' as const,
      };

      const createdMovement = {
        id: '2',
        ...newMovement,
        user: { id: '1', name: 'Test User', email: 'test@test.com' },
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
      };

      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          movement: createdMovement,
        },
      });

      const { result } = renderHook(() => useMovements());

      await act(async () => {
        const result_movement =
          await result.current.createMovement(newMovement);
        expect(result_movement).toEqual(createdMovement);
      });

      expect(result.current.movements).toContain(createdMovement);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/movements',
        newMovement
      );
    });

    it('should handle create movement errors', async () => {
      const errorMessage = 'Validation Error';
      mockedAxios.post.mockRejectedValue({
        response: { data: { error: errorMessage } },
      });

      const { result } = renderHook(() => useMovements());

      const newMovement = {
        concept: 'New Movement',
        amount: 500,
        date: '2024-01-15',
        type: 'EXPENSE' as const,
      };

      await act(async () => {
        try {
          await result.current.createMovement(newMovement);
        } catch (error) {
          // No se espera ningún error
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('updateMovement', () => {
    it('should update movement successfully', async () => {
      const existingMovement = {
        id: '1',
        concept: 'Original',
        amount: 100,
        date: '2024-01-15',
        type: 'INCOME' as const,
        user: { id: '1', name: 'Test User', email: 'test@test.com' },
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
      };

      // Estad inicila de movimientos
      const { result } = renderHook(() => useMovements());

      act(() => {
        result.current.movements.push(existingMovement);
      });

      const updateData = {
        id: '1',
        concept: 'Updated Movement',
        amount: 200,
        date: '2024-01-16',
        type: 'EXPENSE' as const,
      };

      const updatedMovement = {
        ...existingMovement,
        ...updateData,
        updatedAt: '2024-01-16',
      };

      mockedAxios.put.mockResolvedValue({
        data: {
          success: true,
          movement: updatedMovement,
        },
      });

      await act(async () => {
        await result.current.updateMovement(updateData);
      });

      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/movements/1',
        updateData
      );
    });
  });

  describe('deleteMovement', () => {
    it('should delete movement successfully', async () => {
      const movementToDelete = {
        id: '1',
        concept: 'To Delete',
        amount: 100,
        date: '2024-01-15',
        type: 'INCOME' as const,
        user: { id: '1', name: 'Test User', email: 'test@test.com' },
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
      };

      mockedAxios.delete.mockResolvedValue({
        data: { success: true },
      });

      const { result } = renderHook(() => useMovements());

      act(() => {
        result.current.movements.push(movementToDelete);
      });

      await act(async () => {
        await result.current.deleteMovement('1');
      });

      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/movements/1');
    });

    it('should handle delete errors', async () => {
      const errorMessage = 'Delete failed';
      mockedAxios.delete.mockRejectedValue({
        response: { data: { error: errorMessage } },
      });

      const { result } = renderHook(() => useMovements());

      await act(async () => {
        try {
          await result.current.deleteMovement('1');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });
  // Obtener movimientos
  describe('getMovement', () => {
    it('should get individual movement', async () => {
      const movement = {
        id: '1',
        concept: 'Individual Movement',
        amount: 300,
        date: '2024-01-15',
        type: 'INCOME' as const,
        user: { id: '1', name: 'Test User', email: 'test@test.com' },
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
      };

      mockedAxios.get.mockResolvedValue({
        data: {
          success: true,
          movement,
        },
      });

      const { result } = renderHook(() => useMovements());

      await act(async () => {
        const fetchedMovement = await result.current.getMovement('1');
        expect(fetchedMovement).toEqual(movement);
      });

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/movements/1');
    });
  });

  describe('Error Management', () => {
    it('should allow manual error clearing', () => {
      const { result } = renderHook(() => useMovements());

      act(() => {
        result.current.setError('Test Error');
      });

      expect(result.current.error).toBe('Test Error');

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBe(null);
    });
  });
  // Simular respuesta tardia
  describe('Loading States', () => {
    it('should set loading state during async operations', async () => {
      mockedAxios.get.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {
                    success: true,
                    movements: [],
                    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
                  },
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useMovements());

      act(() => {
        result.current.fetchMovements();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(result.current.loading).toBe(false);
    });
  });
});
