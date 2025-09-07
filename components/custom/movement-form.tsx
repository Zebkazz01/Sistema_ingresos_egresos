import React from 'react';
import { useForm } from 'react-hook-form';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export interface MovementFormData {
  concept: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface MovementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MovementFormData) => Promise<void>;
  initialData?: Partial<MovementFormData>;
  loading?: boolean;
  title?: string;
  description?: string;
}

export function MovementForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  loading = false,
  title = 'Nuevo Movimiento',
  description = 'Registra un nuevo movimiento financiero en el sistema.',
}: MovementFormProps) {
  const form = useForm<MovementFormData>({
    defaultValues: {
      concept: initialData?.concept || '',
      amount: initialData?.amount || 0,
      date: initialData?.date || new Date().toISOString().split('T')[0],
      type: initialData?.type || 'INCOME',
    },
  });

  const [selectedType, setSelectedType] = React.useState<'INCOME' | 'EXPENSE'>(
    initialData?.type || 'INCOME'
  );

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        concept: initialData.concept || '',
        amount: initialData.amount || 0,
        date: initialData.date || new Date().toISOString().split('T')[0],
        type: initialData.type || 'INCOME',
      });
      setSelectedType(initialData.type || 'INCOME');
    }
  }, [initialData, form]);

  const handleSubmit = async (data: MovementFormData) => {
    try {
      await onSubmit({ ...data, type: selectedType });
      form.reset();
      setSelectedType('INCOME');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedType('INCOME');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          {/* Movement Type */}
          <div className='space-y-2'>
            <Label htmlFor='type'>Tipo de Movimiento</Label>
            <Select
              value={selectedType}
              onValueChange={(value: 'INCOME' | 'EXPENSE') => {
                setSelectedType(value);
                form.setValue('type', value);
              }}
            >
              <SelectTrigger>
                <SelectValue>
                  <div className='flex items-center gap-2'>
                    {selectedType === 'INCOME' ? (
                      <TrendingUp className='h-4 w-4 text-green-600' />
                    ) : (
                      <TrendingDown className='h-4 w-4 text-red-600' />
                    )}
                    {selectedType === 'INCOME' ? 'Ingreso' : 'Egreso'}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='INCOME'>
                  <div className='flex items-center gap-2'>
                    <TrendingUp className='h-4 w-4 text-green-600' />
                    Ingreso
                  </div>
                </SelectItem>
                <SelectItem value='EXPENSE'>
                  <div className='flex items-center gap-2'>
                    <TrendingDown className='h-4 w-4 text-red-600' />
                    Egreso
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Concept */}
          <div className='space-y-2'>
            <Label htmlFor='concept'>Concepto</Label>
            <div className='relative'>
              <FileText className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                id='concept'
                placeholder='Describe el movimiento...'
                className='pl-10'
                {...form.register('concept', {
                  required: 'El concepto es requerido',
                  minLength: {
                    value: 3,
                    message: 'El concepto debe tener al menos 3 caracteres',
                  },
                })}
              />
            </div>
            {form.formState.errors.concept && (
              <p className='text-sm text-red-600'>
                {form.formState.errors.concept.message}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className='space-y-2'>
            <Label htmlFor='amount'>Monto</Label>
            <div className='relative'>
              <span className='absolute left-3 top-3 text-muted-foreground'>
                $
              </span>
              <Input
                id='amount'
                type='number'
                step='0.01'
                min='0.01'
                placeholder='0.00'
                className='pl-8'
                {...form.register('amount', {
                  required: 'El monto es requerido',
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'El monto debe ser mayor a 0' },
                })}
              />
            </div>
            {form.formState.errors.amount && (
              <p className='text-sm text-red-600'>
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div className='space-y-2'>
            <Label htmlFor='date'>Fecha</Label>
            <div className='relative'>
              <Calendar className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                id='date'
                type='date'
                className='pl-10'
                {...form.register('date', {
                  required: 'La fecha es requerida',
                })}
              />
            </div>
            {form.formState.errors.date && (
              <p className='text-sm text-red-600'>
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={loading}
              className='flex items-center gap-2'
            >
              {loading && (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
              )}
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Botones para tipo de movimientos
export function QuickMovementButtons({
  onCreateMovement,
}: {
  onCreateMovement: (type: 'INCOME' | 'EXPENSE') => void;
}) {
  return (
    <div className='flex gap-2'>
      <Button
        onClick={() => onCreateMovement('INCOME')}
        className='flex items-center gap-2 bg-green-600 hover:bg-green-700'
      >
        <TrendingUp className='h-4 w-4' />
        Nuevo Ingreso
      </Button>
      <Button
        onClick={() => onCreateMovement('EXPENSE')}
        variant='outline'
        className='flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50'
      >
        <TrendingDown className='h-4 w-4' />
        Nuevo Egreso
      </Button>
    </div>
  );
}
