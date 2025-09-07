import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth, useAuth, usePermissions } from '@/hooks/use-auth';
import PageHead from '@/components/common/page-head';
import {
  useMovements,
  CreateMovementData,
  UpdateMovementData,
  MovementsFilters,
  MovementsPagination,
  Movement,
} from '@/hooks/use-movements';
import { DataTable, DataTableColumn } from '@/components/custom/data-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Download,
  MoreHorizontal,
  Edit,
  Filter,
  Trash2,
  Eye,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

function MovementsPage() {
  const { user } = useAuth();
  const permissions = usePermissions();
  const {
    movements,
    loading,
    error,
    fetchMovements,
    createMovement,
    updateMovement,
    deleteMovement,
    setError,
  } = useMovements();

  const [searchValue, setSearchValue] = React.useState('');
  const [showMovementForm, setShowMovementForm] = React.useState(false);
  const [showMovementDetails, setShowMovementDetails] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedMovement, setSelectedMovement] =
    React.useState<Movement | null>(null);
  const [viewingMovement, setViewingMovement] = React.useState<Movement | null>(
    null
  );
  const [formLoading, setFormLoading] = React.useState(false);

  // Estado inicial para los filtros
  const [filters, setFilters] = React.useState({
    type: 'ALL' as 'INCOME' | 'EXPENSE' | 'ALL',
    dateFrom: '',
    dateTo: '',
  });

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Estado inicial para el formulario
  const [formData, setFormData] = React.useState({
    concept: '',
    amount: '',
    date: formatDateForInput(new Date()),
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    description: '',
  });

  // Estado inicial para la paginación
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Cargar los movimientos al montar el componente
  React.useEffect(() => {
    loadMovements();
  }, [pagination.page, pagination.limit, searchValue, filters]);

  // Limpiar el error al desmontar el componente
  React.useEffect(() => {
    return () => {
      setError(null);
    };
  }, [setError]);

  const loadMovements = async () => {
    const movementFilters: MovementsFilters = {
      search: searchValue || undefined,
      type: filters.type !== 'ALL' ? filters.type : undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    };

    const paginationData: MovementsPagination = {
      page: pagination.page,
      limit: pagination.limit,
    };

    const result = await fetchMovements(movementFilters, paginationData);
    setPagination((prev) => ({
      ...prev,
      total: result.pagination.total,
    }));
  };

  const handleCreateMovement = async () => {
    try {
      setFormLoading(true);
      setError(null);

      const data: CreateMovementData = {
        concept: formData.concept,
        amount: parseFloat(formData.amount),
        date: formData.date,
        type: formData.type,
        description: formData.description || undefined,
      };

      if (selectedMovement) {
        // Actualizar movimiento
        await updateMovement({ ...data, id: selectedMovement.id });
      } else {
        // Crear movimiento
        await createMovement(data);
      }

      setShowMovementForm(false);
      setSelectedMovement(null);
      resetForm();
      await loadMovements();
    } catch (err: any) {
      // No mostrar error si es una redirección por permisos o error silencioso
      if (err.message !== 'Redirección por permisos' && !err.silent) {
        console.error('Error saving movement:', err);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditMovement = (movement: Movement) => {
    setSelectedMovement(movement);
    setShowMovementForm(true);
  };

  const handleViewMovement = (movement: Movement) => {
    setViewingMovement(movement);
    setShowMovementDetails(true);
  };

  const handleDeleteMovement = async (movementId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este movimiento?')) {
      try {
        await deleteMovement(movementId);
        await loadMovements();
      } catch (error: any) {
        // No mostrar error si es una redirección por permisos o error silencioso
        if (error.message !== 'Redirección por permisos' && !error.silent) {
          console.error('Error deleting movement:', error);
        }
      }
    }
  };

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      type: 'ALL',
      dateFrom: '',
      dateTo: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetForm = () => {
    setFormData({
      concept: '',
      amount: '',
      date: new Date().toLocaleString('sv-SE').slice(0, 16),
      type: 'INCOME',
      description: '',
    });
  };

  // Actualizar el formulario cuando cambie el movimiento seleccionado
  React.useEffect(() => {
    if (selectedMovement) {
      // Convierte la fecha del movimiento al formato correcto
      const movementDate = new Date(selectedMovement.date);
      const formattedDate = formatDateForInput(movementDate);

      setFormData({
        concept: selectedMovement.concept,
        amount: selectedMovement.amount.toString(),
        date: formattedDate,
        type: selectedMovement.type,
        description: selectedMovement.description || '',
      });
    } else {
      resetForm();
    }
  }, [selectedMovement]);

  // Exportar los movimientos en formato CSV
  const handleExportData = async () => {
    const csvContent = movements
      .map((m) => `${m.concept},${m.amount},${m.date},${m.type},${m.user.name}`)
      .join('\n');

    const blob = new Blob(
      [`Concepto,Monto,Fecha,Tipo,Usuario\n${csvContent}`],
      {
        type: 'text/csv;charset=utf-8;',
      }
    );

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `movimientos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const columns: DataTableColumn<Movement>[] = [
    {
      key: 'concept',
      title: 'Concepto',
      render: (value, row) => (
        <div>
          <div className='font-medium text-gray-900'>{value}</div>
          <div className='text-sm text-gray-500'>{row.date}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'type',
      title: 'Tipo',
      render: (value) => (
        <Badge variant={value === 'INCOME' ? 'default' : 'destructive'}>
          {value === 'INCOME' ? 'Ingreso' : 'Egreso'}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'amount',
      title: 'Monto',
      render: (value, row) => (
        <span
          className={`font-semibold ${row.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}
        >
          {new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
          }).format(value)}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'user',
      title: 'Usuario',
      render: (value) => (
        <div>
          <div className='font-medium text-gray-900'>{value.name}</div>
          <div className='text-sm text-gray-500'>{value.email}</div>
        </div>
      ),
    },
    {
      key: 'id',
      title: 'Acciones',
      render: (value, row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleViewMovement(row)}>
              <Eye className='mr-2 h-4 w-4' />
              Ver detalles
            </DropdownMenuItem>
            {permissions.canCreateMovements && (
              <>
                <DropdownMenuItem onClick={() => handleEditMovement(row)}>
                  <Edit className='mr-2 h-4 w-4' />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-red-600'
                  onClick={() => handleDeleteMovement(row.id)}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <PageHead 
        title="Gestión de Movimientos" 
        description="Administra todos los ingresos y egresos del sistema financiero. Crea, edita, filtra y exporta movimientos de manera eficiente."
        keywords="movimientos, ingresos, egresos, transacciones, gestión financiera, historial"
      />
      <MainLayout>
        <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Gestión de Movimientos
            </h1>
            <p className='text-gray-600'>
              Administra todos los ingresos y egresos del sistema financiero
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant='outline' onClick={() => setShowFilters(true)}>
              <Filter className='mr-2 h-4 w-4' />
              Filtros
            </Button>
            {permissions.canExportData && (
              <Button variant='outline' onClick={handleExportData}>
                <Download className='mr-2 h-4 w-4' />
                Exportar CSV
              </Button>
            )}
            {permissions.canCreateMovements && (
              <Button
                onClick={() => {
                  setSelectedMovement(null);
                  setShowMovementForm(true);
                }}
              >
                <Plus className='mr-2 h-4 w-4' />
                Nuevo Movimiento
              </Button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Movimientos</CardTitle>
            <CardDescription>
              Lista completa de todos los movimientos financieros registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={movements}
              columns={columns}
              loading={loading}
              searchable
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              pagination={{
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                onPageChange: (page) =>
                  setPagination((prev) => ({ ...prev, page })),
                onLimitChange: (limit) =>
                  setPagination((prev) => ({ ...prev, limit, page: 1 })),
              }}
              emptyState={
                <div className='text-center py-8'>
                  <p className='text-gray-500 mb-4'>
                    No hay movimientos registrados
                  </p>
                  {permissions.canCreateMovements && (
                    <Button onClick={() => setShowMovementForm(true)}>
                      <Plus className='mr-2 h-4 w-4' />
                      Crear primer movimiento
                    </Button>
                  )}
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Movement Form Modal */}
        <Dialog open={showMovementForm} onOpenChange={setShowMovementForm}>
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle>
                {selectedMovement?.id
                  ? 'Editar Movimiento'
                  : 'Nuevo Movimiento'}
              </DialogTitle>
              <DialogDescription>
                {selectedMovement?.id
                  ? 'Modifica los datos del movimiento financiero.'
                  : 'Registra un nuevo movimiento financiero en el sistema.'}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='concept'>Concepto</Label>
                <Input
                  id='concept'
                  value={formData.concept}
                  onChange={(e) =>
                    setFormData({ ...formData, concept: e.target.value })
                  }
                  placeholder='Descripción del movimiento'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='amount'>Monto</Label>
                  <Input
                    id='amount'
                    type='number'
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder='0'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='type'>Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'INCOME' | 'EXPENSE') =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='INCOME'>Ingreso</SelectItem>
                      <SelectItem value='EXPENSE'>Egreso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='date'>Fecha y Hora</Label>
                <Input
                  id='date'
                  type='datetime-local'
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Descripción (Opcional)</Label>
                <Input
                  id='description'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Información adicional'
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowMovementForm(false)}
                disabled={formLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateMovement}
                disabled={formLoading || !formData.concept || !formData.amount}
              >
                {formLoading && (
                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                )}
                {formLoading
                  ? 'Guardando...'
                  : selectedMovement?.id
                    ? 'Actualizar'
                    : 'Crear movimiento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Movement Details Modal */}
        <Dialog
          open={showMovementDetails}
          onOpenChange={setShowMovementDetails}
        >
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Eye className='h-5 w-5' />
                Detalles del Movimiento
              </DialogTitle>
            </DialogHeader>

            {viewingMovement && (
              <div className='space-y-4 py-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-gray-500'>
                      Concepto
                    </Label>
                    <p className='text-gray-900'>{viewingMovement.concept}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-500 pr-2'>
                      Tipo
                    </Label>
                    <Badge
                      variant={
                        viewingMovement.type === 'INCOME'
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {viewingMovement.type === 'INCOME' ? 'Ingreso' : 'Egreso'}
                    </Badge>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label className='text-sm font-medium text-gray-500'>
                      Monto
                    </Label>
                    <p
                      className={`text-lg font-semibold ${
                        viewingMovement.type === 'INCOME'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                      }).format(viewingMovement.amount)}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-500'>
                      Fecha
                    </Label>
                    <p className='text-gray-900'>
                      {new Date(viewingMovement.date).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className='text-sm font-medium text-gray-500'>
                    Usuario
                  </Label>
                  <p className='text-gray-900'>{viewingMovement.user.name}</p>
                  <p className='text-sm text-gray-500'>
                    {viewingMovement.user.email}
                  </p>
                </div>

                {viewingMovement.description && (
                  <div>
                    <Label className='text-sm font-medium text-gray-500'>
                      Descripción
                    </Label>
                    <p className='text-gray-900'>
                      {viewingMovement.description}
                    </p>
                  </div>
                )}

                <div className='grid grid-cols-2 gap-4 text-xs text-gray-500'>
                  <div>
                    <Label className='text-sm font-medium text-gray-500'>
                      Creado
                    </Label>
                    <p>
                      {new Date(viewingMovement.createdAt).toLocaleString(
                        'es-ES'
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium text-gray-500'>
                      Actualizado
                    </Label>
                    <p>
                      {new Date(viewingMovement.updatedAt).toLocaleString(
                        'es-ES'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setShowMovementDetails(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filters Modal */}
        <Dialog open={showFilters} onOpenChange={setShowFilters}>
          <DialogContent className='sm:max-w-[400px]'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Filter className='h-5 w-5' />
                Filtros de Búsqueda
              </DialogTitle>
              <DialogDescription>
                Filtra los movimientos por tipo, fecha y otros criterios
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='filter-type'>Tipo de movimiento</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value: 'INCOME' | 'EXPENSE' | 'ALL') =>
                    setFilters({ ...filters, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>Todos</SelectItem>
                    <SelectItem value='INCOME'>Ingresos</SelectItem>
                    <SelectItem value='EXPENSE'>Egresos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='date-from'>Desde</Label>
                  <Input
                    id='date-from'
                    type='date'
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='date-to'>Hasta</Label>
                  <Input
                    id='date-to'
                    type='date'
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters({ ...filters, dateTo: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter className='gap-2'>
              <Button variant='outline' onClick={handleClearFilters}>
                Limpiar
              </Button>
              <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </MainLayout>
    </>
  );
}

// Agregar displayName para Fast Refresh
MovementsPage.displayName = 'MovementsPage';

export default withAuth(MovementsPage);
