import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth, useAuth } from '@/hooks/use-auth';
import PageHead from '@/components/common/page-head';
import { useUsers, User as UserType, UpdateUserData } from '@/hooks/use-users';
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
  Trash2,
  Shield,
  User,
  Mail,
  Phone,
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

function UsersPage() {
  const { user: currentUser } = useAuth();
  const { users, loading, error, fetchUsers, updateUser, setError } =
    useUsers();
  const [searchValue, setSearchValue] = React.useState('');
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserType | null>(null);
  const [formLoading, setFormLoading] = React.useState(false);
  const [statistics, setStatistics] = React.useState({
    totalUsers: 0,
    adminCount: 0,
    userCount: 0,
  });

  // Estado inicial del formulario
  const [editForm, setEditForm] = React.useState({
    name: '',
    role: 'USER' as 'ADMIN' | 'USER',
    phone: '',
  });

  // Estado para la paginación
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Cargar los usuarios al montar el componente
  React.useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.limit, searchValue]);

  const loadUsers = async () => {
    try {
      const result = await fetchUsers(
        { search: searchValue },
        { page: pagination.page, limit: pagination.limit }
      );
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
      }));
      setStatistics(result.statistics);
    } catch (error: any) {
      // No mostrar error si es una redirección por permisos o error silencioso
      if (error.message !== 'Redirección por permisos' && !error.silent) {
        console.error('Error loading users:', error);
      }
    }
  };

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      role: user.role,
      phone: user.phone,
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setFormLoading(true);
      setError(null);

      const updateData: UpdateUserData = {
        id: selectedUser.id,
        name: editForm.name,
        role: editForm.role,
        phone: editForm.phone,
      };

      await updateUser(updateData);

      setShowEditModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err: any) {
      // No mostrar error si es una redirección por permisos o error silencioso
      if (err.message !== 'Redirección por permisos' && !err.silent) {
        console.error('Error updating user:', err);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };
  // Función para exportar los datos
  const handleExportData = async () => {
    const csvContent = users
      .map(
        (u) =>
          `${u.name},${u.email},${u.phone},${u.role},${u.emailVerified ? 'Sí' : 'No'}`
      )
      .join('\n');

    const blob = new Blob(
      [`Nombre,Email,Teléfono,Rol,Email Verificado\n${csvContent}`],
      {
        type: 'text/csv;charset=utf-8;',
      }
    );

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const columns: DataTableColumn<UserType>[] = [
    {
      key: 'name',
      title: 'Usuario',
      render: (value, row) => (
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 bg-primary rounded-full flex items-center justify-center'>
            <User className='h-5 w-5 text-primary-foreground' />
          </div>
          <div>
            <div className='font-medium text-gray-900'>{value}</div>
            <div className='text-sm text-gray-500 flex items-center'>
              <Mail className='h-3 w-3 mr-1' />
              {row.email}
            </div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'role',
      title: 'Rol',
      render: (value) => (
        <Badge
          variant={value === 'ADMIN' ? 'default' : 'secondary'}
          className='flex items-center gap-1 w-fit'
        >
          <Shield className='h-3 w-3' />
          {value === 'ADMIN' ? 'Administrador' : 'Usuario'}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'phone',
      title: 'Teléfono',
      render: (value) => (
        <div className='flex items-center text-gray-600'>
          <Phone className='h-4 w-4 mr-2' />
          {value || 'No especificado'}
        </div>
      ),
    },
    {
      key: 'emailVerified',
      title: 'Estado',
      render: (value) => (
        <Badge variant={value ? 'default' : 'destructive'}>
          {value ? 'Verificado' : 'Sin verificar'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Fecha de registro',
      render: (value) => new Date(value).toLocaleDateString('es-ES'),
      sortable: true,
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
            <DropdownMenuItem onClick={() => handleEditUser(row)}>
              <Edit className='mr-2 h-4 w-4' />
              Editar usuario
            </DropdownMenuItem>
            {row.id !== currentUser?.id && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='text-red-600'
                  onClick={() => handleDeleteUser(row.id)}
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
        title="Gestión de Usuarios" 
        description="Administra todos los usuarios del sistema financiero. Edita roles, información personal y permisos de acceso (Solo administradores)."
        keywords="usuarios, administración, roles, permisos, gestión de acceso, sistema"
      />
      <MainLayout>
        <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Gestión de Usuarios
            </h1>
            <p className='text-gray-600'>
              Administra todos los usuarios del sistema (Solo administradores)
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant='outline' onClick={handleExportData}>
              <Download className='mr-2 h-4 w-4' />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Usuarios
              </CardTitle>
              <User className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{users.length}</div>
              <p className='text-xs text-muted-foreground'>
                Usuarios registrados en el sistema
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Administradores
              </CardTitle>
              <Shield className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {users.filter((u) => u.role === 'ADMIN').length}
              </div>
              <p className='text-xs text-muted-foreground'>
                Usuarios con permisos de administración
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Verificados</CardTitle>
              <Mail className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {users.filter((u) => u.emailVerified).length}
              </div>
              <p className='text-xs text-muted-foreground'>
                Usuarios con email verificado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              Todos los usuarios registrados en el sistema financiero
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
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
                  <User className='mx-auto h-12 w-12 text-gray-400' />
                  <p className='text-gray-500 mb-4'>
                    No se encontraron usuarios
                  </p>
                </div>
              }
            />
          </CardContent>
        </Card>

        {/* Edit User Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <Edit className='h-5 w-5' />
                Editar Usuario
              </DialogTitle>
              <DialogDescription>
                Modifica la información del usuario seleccionado.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Nombre completo</Label>
                <Input
                  id='name'
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder='Nombre del usuario'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='role'>Rol del usuario</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: 'ADMIN' | 'USER') =>
                    setEditForm((prev) => ({ ...prev, role: value }))
                  }
                  disabled={selectedUser?.id === currentUser?.id}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='USER'>
                      <div className='flex items-center gap-2'>
                        <User className='h-4 w-4' />
                        Usuario
                      </div>
                    </SelectItem>
                    <SelectItem value='ADMIN'>
                      <div className='flex items-center gap-2'>
                        <Shield className='h-4 w-4' />
                        Administrador
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {selectedUser?.id === currentUser?.id && (
                  <p className='text-xs text-muted-foreground'>
                    No puedes cambiar tu propio rol
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Teléfono</Label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='phone'
                    className='pl-10'
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder='+57 300 123 4567'
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowEditModal(false)}
                disabled={formLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveUser}
                disabled={formLoading}
                className='flex items-center gap-2'
              >
                {formLoading && (
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                )}
                {formLoading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </MainLayout>
    </>
  );
}

// Agregar displayName para Fast Refresh
UsersPage.displayName = 'UsersPage';

export default withAuth(UsersPage, { adminOnly: true });
