import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MovementForm } from '@/components/custom/simple-movement-form';
import { MovementType } from '@/types/movement';

// Mock hooks y funciones
const mockCreateMovement = jest.fn();
const mockUpdateMovement = jest.fn();

jest.mock('@/hooks/use-movements', () => ({
  useMovements: jest.fn(() => ({
    createMovement: mockCreateMovement,
    updateMovement: mockUpdateMovement,
    loading: false,
    error: null,
  })),
}));

describe('MovementForm Component', () => {
  const defaultProps = {
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const { useMovements } = require('@/hooks/use-movements');
    jest.mocked(useMovements).mockReturnValue({
      createMovement: mockCreateMovement,
      updateMovement: mockUpdateMovement,
      loading: false,
      error: null,
    });
  });

  describe('Create Mode', () => {
    it('should render form fields correctly', () => {
      render(<MovementForm {...defaultProps} />);

      expect(screen.getByLabelText(/concepto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cantidad/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /crear movimiento/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /cancelar/i })
      ).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      render(<MovementForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', {
        name: /crear movimiento/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/el concepto es requerido/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/la cantidad es requerida/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/la fecha es requerida/i)).toBeInTheDocument();
      });

      expect(mockCreateMovement).not.toHaveBeenCalled();
    });

    it('should validate minimum amount', async () => {
      render(<MovementForm {...defaultProps} />);

      const amountInput = screen.getByLabelText(/cantidad/i);
      fireEvent.change(amountInput, { target: { value: '0' } });

      const submitButton = screen.getByRole('button', {
        name: /crear movimiento/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/la cantidad debe ser mayor a 0/i)
        ).toBeInTheDocument();
      });
    });

    it('should submit form with valid data', async () => {
      const mockCreatedMovement = {
        id: '1',
        concept: 'Test Movement',
        amount: 100,
        type: 'INCOME' as MovementType,
        date: '2024-01-15',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        user: { id: '1', name: 'Test User', email: 'test@test.com' },
      };

      mockCreateMovement.mockResolvedValue(mockCreatedMovement);

      render(<MovementForm {...defaultProps} />);

      // test formulario
      fireEvent.change(screen.getByLabelText(/concepto/i), {
        target: { value: 'Test Movement' },
      });
      fireEvent.change(screen.getByLabelText(/cantidad/i), {
        target: { value: '100' },
      });
      fireEvent.change(screen.getByLabelText(/fecha/i), {
        target: { value: '2024-01-15T10:30' },
      });

      const submitButton = screen.getByRole('button', {
        name: /crear movimiento/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateMovement).toHaveBeenCalledWith(
          expect.objectContaining({
            concept: 'Test Movement',
            amount: 100,
            type: 'INCOME',
            date: expect.stringMatching(/^2024-01-15T\d{2}:30:00\.000Z$/),
          })
        );
      });

      expect(defaultProps.onSuccess).toHaveBeenCalledWith(mockCreatedMovement);
    });

    it('should handle creation errors', async () => {
      const errorMessage = 'Server Error';
      mockCreateMovement.mockRejectedValue(new Error(errorMessage));
      // Mock envuelve el error del hook
      const { useMovements } = require('@/hooks/use-movements');
      jest.mocked(useMovements).mockReturnValue({
        createMovement: mockCreateMovement,
        updateMovement: mockUpdateMovement,
        loading: false,
        error: errorMessage,
      });

      render(<MovementForm {...defaultProps} />);

      // Mostrar ante un error en el hook
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    const existingMovement = {
      id: '1',
      concept: 'Existing Movement',
      amount: 200,
      type: 'EXPENSE' as MovementType,
      date: '2024-01-10T15:00:00.000Z',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10',
      user: { id: '1', name: 'Test User', email: 'test@test.com' },
    };

    it('should populate form with existing movement data', () => {
      render(<MovementForm {...defaultProps} movement={existingMovement} />);

      expect(screen.getByDisplayValue('Existing Movement')).toBeInTheDocument();
      expect(screen.getByDisplayValue('200')).toBeInTheDocument();
      // Comprobar campo select de tipo
      expect(screen.getAllByText('Gasto')).toHaveLength(2);
      expect(
        screen.getByRole('button', { name: /actualizar movimiento/i })
      ).toBeInTheDocument();
    });

    // Actualizar datos del formulario
    it('should submit updated data', async () => {
      const updatedMovement = {
        ...existingMovement,
        concept: 'Updated Movement',
        amount: 300,
      };

      mockUpdateMovement.mockResolvedValue(updatedMovement);

      render(<MovementForm {...defaultProps} movement={existingMovement} />);

      fireEvent.change(screen.getByLabelText(/concepto/i), {
        target: { value: 'Updated Movement' },
      });
      fireEvent.change(screen.getByLabelText(/cantidad/i), {
        target: { value: '300' },
      });

      const submitButton = screen.getByRole('button', {
        name: /actualizar movimiento/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateMovement).toHaveBeenCalledWith({
          id: '1',
          concept: 'Updated Movement',
          amount: 300,
          type: 'EXPENSE',
          date: '2024-01-10T15:00:00.000Z',
        });
      });

      expect(defaultProps.onSuccess).toHaveBeenCalledWith(updatedMovement);
    });
  });

  describe('Form Interactions', () => {
    it('should call onCancel when cancel button is clicked', () => {
      render(<MovementForm {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      fireEvent.click(cancelButton);

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('should disable submit button while loading', () => {
      // Mock mostrar el estado de carga
      const { useMovements } = require('@/hooks/use-movements');
      jest.mocked(useMovements).mockReturnValue({
        createMovement: mockCreateMovement,
        updateMovement: mockUpdateMovement,
        loading: true,
        error: null,
      });

      render(<MovementForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', {
        name: /crear movimiento/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it('should format amount input to numbers only', () => {
      render(<MovementForm {...defaultProps} />);

      const amountInput = screen.getByLabelText(/cantidad/i);

      // Validar que el input solo acepte números
      fireEvent.change(amountInput, { target: { value: '123' } });
      expect(amountInput.value).toBe('123');
    });

    it('should allow decimal amounts', () => {
      render(<MovementForm {...defaultProps} />);

      const amountInput = screen.getByLabelText(/cantidad/i);
      fireEvent.change(amountInput, { target: { value: '123.45' } });

      expect(amountInput).toHaveValue(123.45);
    });
  });

  describe('Type Selection', () => {
    it('should default to INCOME type', () => {
      render(<MovementForm {...defaultProps} />);

      // Chequear que se haya seleccionado el tipo de movimiento por defecto
      expect(screen.getAllByText('Ingreso')).toHaveLength(2);
    });

    it('should show both INCOME and EXPENSE options', () => {
      render(<MovementForm {...defaultProps} />);

      //  Comprobar que ambas opciones existen en el DOM
      expect(screen.getAllByText('Ingreso')).toHaveLength(2);
      expect(screen.getByText('Gasto')).toBeInTheDocument();
    });
  });

  describe('Date Input', () => {
    it('should accept datetime-local format', () => {
      render(<MovementForm {...defaultProps} />);

      const dateInput = screen.getByLabelText(/fecha/i);
      fireEvent.change(dateInput, { target: { value: '2024-01-15T14:30' } });

      expect(dateInput).toHaveValue('2024-01-15T14:30');
    });
  });
});
