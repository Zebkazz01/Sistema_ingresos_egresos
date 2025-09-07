import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

export interface DataTableColumn<T> {
  key: keyof T;
  title: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterable?: boolean;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  searchable = false,
  searchValue = '',
  onSearchChange,
  filterable = false,
  onRowClick,
  emptyState,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
    'asc'
  );

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  if (loading) {
    return (
      <div className='w-full'>
        {/* Search and filters */}
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            {searchable && (
              <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar...'
                  className='pl-8 w-64'
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>
            )}
            {filterable && (
              <Button variant='outline' size='sm'>
                <Filter className='mr-2 h-4 w-4' />
                Filtros
              </Button>
            )}
          </div>
        </div>

        {/* Loading skeleton */}
        <div className='rounded-md border'>
          <div className='animate-pulse'>
            <div className='border-b bg-muted/50 h-12' />
            {[...Array(5)].map((_, i) => (
              <div key={i} className='border-b h-16 bg-background' />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Search and filters */}
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          {searchable && (
            <div className='relative'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar...'
                className='pl-8 w-64'
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          )}
          {filterable && (
            <Button variant='outline' size='sm'>
              <Filter className='mr-2 h-4 w-4' />
              Filtros
            </Button>
          )}
        </div>

        {pagination && (
          <div className='flex items-center space-x-2'>
            <span className='text-sm text-muted-foreground'>Mostrar</span>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => pagination.onLimitChange(Number(value))}
            >
              <SelectTrigger className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='10'>10</SelectItem>
                <SelectItem value='25'>25</SelectItem>
                <SelectItem value='50'>50</SelectItem>
                <SelectItem value='100'>100</SelectItem>
              </SelectContent>
            </Select>
            <span className='text-sm text-muted-foreground'>por página</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={
                    column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''
                  }
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className='flex items-center space-x-1'>
                    <span>{column.title}</span>
                    {column.sortable && sortColumn === column.key && (
                      <span className='text-xs'>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {emptyState || 'No hay datos disponibles'}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow
                  key={index}
                  className={
                    onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''
                  }
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className='mt-4 flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} resultados
          </div>

          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className='h-4 w-4' />
              Anterior
            </Button>

            <div className='text-sm'>
              Página {pagination.page} de{' '}
              {Math.ceil(pagination.total / pagination.limit)}
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={
                pagination.page >=
                Math.ceil(pagination.total / pagination.limit)
              }
            >
              Siguiente
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de badge para mostrar el tipo de movimiento
export function MovementTypeBadge({ type }: { type: 'INCOME' | 'EXPENSE' }) {
  return (
    <Badge
      variant={type === 'INCOME' ? 'default' : 'destructive'}
      className='font-medium'
    >
      {type === 'INCOME' ? 'Ingreso' : 'Egreso'}
    </Badge>
  );
}

// componente de cantidad de dinero
export function CurrencyAmount({
  amount,
  type,
}: {
  amount: number;
  type?: 'INCOME' | 'EXPENSE';
}) {
  const isPositive = type === 'INCOME' || (!type && amount >= 0);

  return (
    <span
      className={`font-medium ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}
    >
      {isPositive ? '+' : ''}$
      {amount.toLocaleString('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}
