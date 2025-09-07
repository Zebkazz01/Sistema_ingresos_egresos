const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function changeUserRole() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.log('Uso: node scripts/change-user-role.js <email> <role>');
    console.log('Ejemplo: node scripts/change-user-role.js admin@test.com USER');
    console.log('Roles disponibles: ADMIN, USER');
    process.exit(1);
  }
  
  const [email, newRole] = args;
  
  if (!['ADMIN', 'USER'].includes(newRole)) {
    console.error('❌ Rol inválido. Use ADMIN o USER');
    process.exit(1);
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.error(`❌ Usuario con email ${email} no encontrado`);
      process.exit(1);
    }
    
    console.log(`🔄 Cambiando rol de ${user.name} de ${user.role} a ${newRole}...`);
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: newRole }
    });
    
    console.log(`✅ Rol cambiado exitosamente!`);
    console.log(`   Usuario: ${updatedUser.name} (${updatedUser.email})`);
    console.log(`   Rol anterior: ${user.role}`);
    console.log(`   Rol actual: ${updatedUser.role}`);
    console.log('\n💡 Para probar la redirección:');
    console.log('   1. Inicia sesión con este usuario');
    console.log('   2. Intenta acceder a páginas de administrador (usuarios, reportes, etc.)');
    console.log('   3. Deberías ser redirigido al dashboard con una notificación');
    
  } catch (error) {
    console.error('❌ Error cambiando rol:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

changeUserRole();
