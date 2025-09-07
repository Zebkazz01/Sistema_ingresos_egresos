import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest, handleApiError, validateMethod, getPagination } from '../../../lib/middleware';

// Datos simulados para desarrollo
const mockMovements = [
  {
    id: 'mov_1',
    concept: 'Venta de producto',
    amount: 150.50,
    date: new Date('2024-01-15'),
    type: 'INCOME',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-123',
      name: 'Usuario de Prueba',
      email: 'test@example.com'
    }
  },
  {
    id: 'mov_2',
    concept: 'Compra de materiales',
    amount: 75.25,
    date: new Date('2024-01-14'),
    type: 'EXPENSE',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-123',
      name: 'Usuario de Prueba',
      email: 'test@example.com'
    }
  },
  {
    id: 'mov_3',
    concept: 'Pago por servicios',
    amount: 200.00,
    date: new Date('2024-01-13'),
    type: 'INCOME',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-123',
      name: 'Usuario de Prueba',
      email: 'test@example.com'
    }
  }
];

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Validar método HTTP
  if (validateMethod(req, res, ['GET', 'POST'])) return;

  try {
    switch (req.method) {
      case 'GET':
        await getMovements(req, res);
        break;
      case 'POST':
        await createMovement(req, res);
        break;
    }
  } catch (error) {
    handleApiError(error, res);
  }
}

// GET /api/movements/simple - Listar movimientos (simulados)
async function getMovements(req: AuthenticatedRequest, res: NextApiResponse) {
  const { page, limit } = getPagination(req);
  const { search, type } = req.query;

  let filteredMovements = [...mockMovements];

  // Aplicar filtros
  if (search) {
    filteredMovements = filteredMovements.filter(m => 
      m.concept.toLowerCase().includes((search as string).toLowerCase())
    );
  }

  if (type && (type === 'INCOME' || type === 'EXPENSE')) {
    filteredMovements = filteredMovements.filter(m => m.type === type);
  }

  // Paginación
  const total = filteredMovements.length;
  const startIndex = (page - 1) * limit;
  const paginatedMovements = filteredMovements.slice(startIndex, startIndex + limit);

  // Calcular totales
  const totalIncome = mockMovements
    .filter(m => m.type === 'INCOME')
    .reduce((sum, m) => sum + m.amount, 0);
  
  const totalExpense = mockMovements
    .filter(m => m.type === 'EXPENSE')
    .reduce((sum, m) => sum + m.amount, 0);

  const balance = totalIncome - totalExpense;

  res.status(200).json({
    movements: paginatedMovements,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    summary: {
      totalAmount: totalIncome + totalExpense,
      totalMovements: mockMovements.length,
      income: totalIncome,
      expense: totalExpense,
      balance
    }
  });
}

// POST /api/movements/simple - Crear movimiento (simulado)
async function createMovement(req: AuthenticatedRequest, res: NextApiResponse) {
  // Solo admins pueden crear movimientos
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Solo los administradores pueden crear movimientos' 
    });
  }

  const { concept, amount, date, type } = req.body;

  // Validaciones
  if (!concept || !amount || !date || !type) {
    return res.status(400).json({ 
      error: 'Todos los campos son requeridos: concept, amount, date, type' 
    });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ 
      error: 'El monto debe ser un número positivo' 
    });
  }

  if (type !== 'INCOME' && type !== 'EXPENSE') {
    return res.status(400).json({ 
      error: 'El tipo debe ser INCOME o EXPENSE' 
    });
  }

  // Crear movimiento simulado
  const newMovement = {
    id: `mov_${Date.now()}`,
    concept,
    amount: parseFloat(amount),
    date: new Date(date),
    type,
    userId: req.user!.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: req.user!.id,
      name: req.user!.name,
      email: req.user!.email
    }
  };

  // Agregar a la lista simulada
  mockMovements.unshift(newMovement);

  res.status(201).json({
    message: 'Movimiento creado exitosamente (simulado)',
    movement: newMovement
  });
}

export default withAuth(handler);
