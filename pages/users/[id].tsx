import React from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/components/layout/main-layout';
import { withAuth, useAuth } from '@/hooks/use-auth';
import PageHead from '@/components/common/page-head';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable, DataTableColumn } from '@/components/custom/data-table';
import { Separator } from '@/components/ui/separator';

interface UserActivity {
  id: string;
  action: string;
  description: string;
  date: string;
  type: 'login' | 'transaction' | 'profile' | 'system';
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  phone: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  avatarUrl: string | null;
  address: string | null;
  department: string | null;
  position: string | null;
}

function UserDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user: currentUser } = useAuth();
  const [user, setUser] = React.useState<UserData | null>(null);
  const [activities, setActivities] = React.useState<UserActivity[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      loadUserData(id as string);
    }
  }, [id]);

  const loadUserData = async (userId: string) => {
    setLoading(true);

    // Llamar a la API para obtener los datos del usuario
    setTimeout(() => {
      // Mock datos de usuario
      const mockUser: UserData = {
        id: userId as string,
        name:
          userId === '1'
            ? 'Admin User'
            : userId === '2'
              ? 'María González'
              : 'Carlos Rodriguez',
        email:
          userId === '1'
            ? 'admin@example.com'
            : userId === '2'
              ? 'maria.gonzalez@example.com'
              : 'carlos.rodriguez@example.com',
        role: userId === '1' || userId === '4' ? 'ADMIN' : 'USER',
        phone: '+57 ' + (300000000 + parseInt(userId as string) * 111111),
        emailVerified: userId === '3' ? false : true,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        lastLogin: '2024-01-20T14:25:00Z',
        avatarUrl: null,
        address: 'Calle Principal #123, Bogotá',
        department: userId === '1' ? 'Administración' : 'Finanzas',
        position:
          userId === '1'
            ? 'Administrador'
            : userId === '2'
              ? 'Contadora'
              : 'Analista Financiero',
      };

      // Mock para el historial de actividades
      const mockActivities: UserActivity[] = [
        {
          id: '1',
          action: 'Inicio de sesión',
          description: 'Inicio de sesión exitoso desde la aplicación web',
          date: '2024-01-20T14:25:00Z',
          type: 'login',
        },
        {
          id: '2',
          action: 'Actualización de perfil',
          description: 'Actualización de información de contacto',
          date: '2024-01-15T10:30:00Z',
          type: 'profile',
        },
        {
          id: '3',
          action: 'Registro de movimiento',
          description: 'Creación de nuevo movimiento de ingreso por $1,500,000',
          date: '2024-01-12T09:15:00Z',
          type: 'transaction',
        },
        {
          id: '4',
          action: 'Cambio de contraseña',
          description: 'Cambio de contraseña realizado correctamente',
          date: '2024-01-10T16:45:00Z',
          type: 'profile',
        },
        {
          id: '5',
          action: 'Inicio de sesión',
          description: 'Inicio de sesión fallido - contraseña incorrecta',
          date: '2024-01-10T16:30:00Z',
          type: 'login',
        },
        {
          id: '6',
          action: 'Generación de reporte',
          description: 'Generación de reporte financiero mensual',
          date: '2024-01-05T11:20:00Z',
          type: 'system',
        },
      ];

      setUser(mockUser);
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  };

  const handleDeleteUser = () => {
    if (
      confirm(
        '¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.'
      )
    ) {
      // Simular la eliminación del usuario
      setTimeout(() => {
        router.push('/users');
      }, 1000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activityColumns: DataTableColumn<UserActivity>[] = [
    {
      key: 'action',
      title: 'Actividad',
      render: (value, row) => (
        <div className='flex items-center gap-2'>
          {row.type === 'login' && <User className='h-4 w-4 text-blue-500' />}
          {row.type === 'transaction' && (
            <FileText className='h-4 w-4 text-green-500' />
          )}
          {row.type === 'profile' && (
            <Edit className='h-4 w-4 text-purple-500' />
          )}
          {row.type === 'system' && (
            <Shield className='h-4 w-4 text-gray-500' />
          )}
          <span className='font-medium'>{value}</span>
        </div>
      ),
    },
    {
      key: 'description',
      title: 'Descripción',
      render: (value) => <span className='text-gray-600'>{value}</span>,
    },
    {
      key: 'date',
      title: 'Fecha y hora',
      render: (value) => (
        <div className='flex items-center gap-2 text-gray-500'>
          <Clock className='h-4 w-4' />
          {formatDateTime(value)}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className='flex items-center justify-center h-[80vh]'>
          <div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full' />
          <span className='ml-2'>Cargando información del usuario...</span>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className='text-center py-12'>
          <XCircle className='mx-auto h-12 w-12 text-destructive mb-4' />
          <h2 className='text-2xl font-bold'>Usuario no encontrado</h2>
          <p className='text-gray-600 mb-6'>
            No se pudo encontrar el usuario solicitado
          </p>
          <Link href='/users'>
            <Button>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Volver a la lista
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <PageHead 
        title={user ? `Perfil de ${user.name}` : "Perfil de Usuario"} 
        description={`Detalles, actividad y configuración del perfil de ${user?.name || 'usuario'}. Gestión completa de la cuenta y historial de actividades.`}
        keywords="perfil, usuario, actividad, historial, detalles, configuración"
      />
      <MainLayout>
        <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Link href='/users'>
              <Button variant='ghost' size='icon'>
                <ArrowLeft className='h-5 w-5' />
              </Button>
            </Link>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Perfil de Usuario
              </h1>
              <p className='text-gray-600'>Detalles y actividad del usuario</p>
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            {user.id !== currentUser?.id && (
              <Button
                variant='destructive'
                onClick={handleDeleteUser}
                className='gap-1'
              >
                <Trash2 className='h-4 w-4' />
                Eliminar
              </Button>
            )}

            <Link href={`/users/edit/${user.id}`}>
              <Button className='gap-1'>
                <Edit className='h-4 w-4' />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        {/* User Profile Card */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-1'>
            <Card>
              <CardHeader className='flex flex-col items-center text-center pb-2'>
                <div className='w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-4'>
                  <User className='h-10 w-10 text-white' />
                </div>
                <CardTitle>{user.name}</CardTitle>
                <Badge
                  variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                  className='mt-2'
                >
                  {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                </Badge>
                <CardDescription className='mt-1'>
                  {user.position} - {user.department}
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <Mail className='h-5 w-5 text-gray-500' />
                  <div>
                    <div className='text-sm font-medium text-gray-500'>
                      Email
                    </div>
                    <div>{user.email}</div>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <Phone className='h-5 w-5 text-gray-500' />
                  <div>
                    <div className='text-sm font-medium text-gray-500'>
                      Teléfono
                    </div>
                    <div>{user.phone}</div>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <Calendar className='h-5 w-5 text-gray-500' />
                  <div>
                    <div className='text-sm font-medium text-gray-500'>
                      Fecha de registro
                    </div>
                    <div>{formatDate(user.createdAt)}</div>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <Clock className='h-5 w-5 text-gray-500' />
                  <div>
                    <div className='text-sm font-medium text-gray-500'>
                      Último acceso
                    </div>
                    <div>{formatDateTime(user.lastLogin)}</div>
                  </div>
                </div>

                <div className='flex items-center gap-3 mt-4'>
                  {user.emailVerified ? (
                    <Badge
                      variant='outline'
                      className='flex items-center gap-1 w-full justify-center py-1'
                    >
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      Email verificado
                    </Badge>
                  ) : (
                    <Badge
                      variant='outline'
                      className='flex items-center gap-1 w-full justify-center py-1 border-destructive text-destructive'
                    >
                      <XCircle className='h-4 w-4' />
                      Email sin verificar
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='lg:col-span-2'>
            <Tabs defaultValue='activity'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='activity'>Actividad reciente</TabsTrigger>
                <TabsTrigger value='details'>Información adicional</TabsTrigger>
              </TabsList>

              <TabsContent value='activity' className='mt-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>Historial de actividad</CardTitle>
                    <CardDescription>
                      Registro de acciones realizadas por el usuario
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={activityColumns}
                      data={activities}
                      emptyState={
                        <div className='text-center py-8'>
                          <FileText className='mx-auto h-12 w-12 text-gray-400' />
                          <p className='text-gray-500 mb-4'>
                            No hay actividad registrada
                          </p>
                        </div>
                      }
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='details' className='mt-4'>
                <Card>
                  <CardHeader>
                    <CardTitle>Información detallada</CardTitle>
                    <CardDescription>
                      Datos complementarios del usuario en el sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div>
                      <h4 className='text-sm font-medium text-gray-500 mb-1'>
                        Dirección
                      </h4>
                      <p>{user.address || 'No especificada'}</p>
                    </div>

                    <div>
                      <h4 className='text-sm font-medium text-gray-500 mb-1'>
                        Departamento
                      </h4>
                      <p>{user.department || 'No especificado'}</p>
                    </div>

                    <div>
                      <h4 className='text-sm font-medium text-gray-500 mb-1'>
                        Cargo
                      </h4>
                      <p>{user.position || 'No especificado'}</p>
                    </div>

                    <Separator />

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <h4 className='text-sm font-medium text-gray-500 mb-1'>
                          Fecha de creación
                        </h4>
                        <p>{formatDate(user.createdAt)}</p>
                      </div>

                      <div>
                        <h4 className='text-sm font-medium text-gray-500 mb-1'>
                          Última actualización
                        </h4>
                        <p>{formatDate(user.updatedAt)}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className='text-sm font-medium text-gray-500 mb-1'>
                        Permisos
                      </h4>
                      <div className='flex flex-wrap gap-2 mt-1'>
                        {user.role === 'ADMIN' ? (
                          <>
                            <Badge variant='secondary'>
                              Administrar usuarios
                            </Badge>
                            <Badge variant='secondary'>
                              Editar movimientos
                            </Badge>
                            <Badge variant='secondary'>
                              Eliminar registros
                            </Badge>
                            <Badge variant='secondary'>
                              Configurar sistema
                            </Badge>
                            <Badge variant='secondary'>Ver reportes</Badge>
                          </>
                        ) : (
                          <>
                            <Badge variant='secondary'>Ver movimientos</Badge>
                            <Badge variant='secondary'>Crear movimientos</Badge>
                            <Badge variant='secondary'>
                              Ver reportes básicos
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        </div>
      </MainLayout>
    </>
  );
}

// Agregar displayName para Fast Refresh
UserDetailPage.displayName = 'UserDetailPage';

export default withAuth(UserDetailPage, { adminOnly: true });
