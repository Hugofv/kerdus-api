/**
 * Prisma Seed Script
 * Run with: npx prisma db seed
 * 
 * Creates initial admin user for the platform
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Default admin credentials (change in production!)
const DEFAULT_ADMIN = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin' as const,
};

async function main() {
  console.log('🌱 Starting seed...\n');

  // Check if admin already exists
  const existingAdmin = await (prisma as any).platformUser.findUnique({
    where: { email: DEFAULT_ADMIN.email },
  });

  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists:');
    console.log('   📧 Email:', existingAdmin.email);
    console.log('   👤 Role:', existingAdmin.role);
    console.log('   🆔 ID:', existingAdmin.id);
    console.log('\n💡 To create a new admin, use: npx ts-node src/scripts/create-admin.ts');
    return;
  }

  // Create admin user
  console.log('📝 Creating admin user...');
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

  const admin = await (prisma as any).platformUser.create({
    data: {
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      passwordHash,
      role: DEFAULT_ADMIN.role,
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('\n✅ Admin user created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Password:', DEFAULT_ADMIN.password);
  console.log('👤 Role:', admin.role);
  console.log('🆔 ID:', admin.id);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error running seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

