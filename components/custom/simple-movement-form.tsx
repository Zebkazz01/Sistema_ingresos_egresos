import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMovements } from '@/hooks/use-movements';
import { MovementType, Movement } from '@/types/movement';

export interface MovementFormProps {
  onSuccess: (movement: Movement) => void;
  onCancel: () => void;
  movement?: Movement;
}

export function MovementForm({
  onSuccess,
  onCancel,
  movement,
}: MovementFormProps) {
  const { createMovement, updateMovement, loading, error } = useMovements();

  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<MovementType>('INCOME');
  const [date, setDate] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (movement) {
      setConcept(movement.concept);
      setAmount(movement.amount.toString());
      setType(movement.type);
      // Convertir campo fecha a local
      const dateObj = new Date(movement.date);
      const localDate = new Date(
        dateObj.getTime() - dateObj.getTimezoneOffset() * 60000
      );
      setDate(localDate.toISOString().slice(0, 16));
    }
  }, [movement]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!concept.trim()) {
      errors.concept = 'El concepto es requerido';
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      errors.amount = 'La cantidad es requerida';
    } else if (numAmount <= 0) {
      errors.amount = 'La cantidad debe ser mayor a 0';
    }

    if (!date) {
      errors.date = 'La fecha es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const dateObject = new Date(date);
      const isoDate = dateObject.toISOString();

      const data = {
        concept: concept.trim(),
        amount: parseFloat(amount),
        type,
        date: isoDate,
      };

      let result;
      if (movement) {
        result = await updateMovement({
          id: movement.id,
          ...data,
        });
      } else {
        result = await createMovement(data);
      }

      onSuccess(result);
    } catch (err: any) {
      console.error('Error submitting form:', err);
    }
  };

  const handleAmountChange = (value: string) => {
    // Permitir solo números y un punto decimal
    const cleaned = value.replace(/[^0-9.]/g, '');
    setAmount(cleaned);
  };

  return (
    <div className='space-y-4'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Label htmlFor='concept'>Concepto</Label>
          <Input
            id='concept'
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder='Concepto del movimiento'
          />
          {formErrors.concept && (
            <p className='text-sm text-red-600 mt-1'>{formErrors.concept}</p>
          )}
        </div>

        <div>
          <Label htmlFor='amount'>Cantidad</Label>
          <Input
            id='amount'
            type='number'
            step='0.01'
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder='0.00'
          />
          {formErrors.amount && (
            <p className='text-sm text-red-600 mt-1'>{formErrors.amount}</p>
          )}
        </div>

        <div>
          <Label htmlFor='type'>Tipo</Label>
          <Select
            value={type}
            onValueChange={(value: MovementType) => setType(value)}
          >
            <SelectTrigger id='type'>
              <SelectValue placeholder='Selecciona el tipo' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='INCOME'>Ingreso</SelectItem>
              <SelectItem value='EXPENSE'>Gasto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor='date'>Fecha</Label>
          <Input
            id='date'
            type='datetime-local'
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {formErrors.date && (
            <p className='text-sm text-red-600 mt-1'>{formErrors.date}</p>
          )}
        </div>

        {error && (
          <div className='text-sm text-red-600 bg-red-50 p-3 rounded'>
            {error}
          </div>
        )}

        <div className='flex gap-2'>
          <Button type='submit' disabled={loading}>
            {movement ? 'Actualizar Movimiento' : 'Crear Movimiento'}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
