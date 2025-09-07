const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log(' Starting database seeding...');

  // Crear test para usuarios
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      id: 'usr_admin_001',
      name: 'Admin User',
      email: 'admin@test.com',
      emailVerified: true,
      role: 'ADMIN',
      phone: '+57 300 123 4567',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      id: 'usr_user_001',
      name: 'Regular User',
      email: 'user@test.com',
      emailVerified: true,
      role: 'USER',
      phone: '+57 300 765 4321',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`Created users:`, {
    adminUser: adminUser.email,
    regularUser: regularUser.email,
  });

  // Crear test para movimientos
  const movements = [
    {
      id: 'mov_001',
      concept: 'Venta de producto A',
      amount: 500000,
      date: new Date('2024-01-15'),
      type: 'INCOME' as const,
      category: 'ventas',
      description: 'Venta inicial del mes de enero',
      userId: adminUser.id,
    },
    {
      id: 'mov_002',
      concept: 'Compra de suministros',
      amount: 150000,
      date: new Date('2024-01-10'),
      type: 'EXPENSE' as const,
      category: 'suministros',
      description: 'Materiales para producción',
      userId: adminUser.id,
    },
    {
      id: 'mov_003',
      concept: 'Servicios profesionales',
      amount: 1200000,
      date: new Date('2024-01-20'),
      type: 'INCOME' as const,
      category: 'servicios',
      description: 'Consultoría de sistemas',
      userId: adminUser.id,
    },
    {
      id: 'mov_004',
      concept: 'Pago de arriendo oficina',
      amount: 800000,
      date: new Date('2024-01-05'),
      type: 'EXPENSE' as const,
      category: 'arriendo',
      description: 'Arriendo mensual de oficina',
      userId: adminUser.id,
    },
    {
      id: 'mov_005',
      concept: 'Venta de licencia software',
      amount: 2500000,
      date: new Date('2024-01-25'),
      type: 'INCOME' as const,
      category: 'software',
      description: 'Licencia anual de software empresarial',
      userId: adminUser.id,
    },
    {
      id: 'mov_006',
      concept: 'Egresos de marketing',
      amount: 350000,
      date: new Date('2024-01-12'),
      type: 'EXPENSE' as const,
      category: 'marketing',
      description: 'Campaña publicitaria en redes sociales',
      userId: adminUser.id,
    },
  ];

  for (const movement of movements) {
    await prisma.movement.upsert({
      where: { id: movement.id },
      update: {},
      create: {
        ...movement,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log(`Created ${movements.length} sample movements`);

  const movementCount = await prisma.movement.count();
  const userCount = await prisma.user.count();

  console.log(`Seeding completed!`);
  console.log(`Database now has:`);
  console.log(`   - ${userCount} users`);
  console.log(`   - ${movementCount} movements`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
