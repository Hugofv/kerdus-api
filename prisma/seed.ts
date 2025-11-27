/**
 * Prisma Seed Script
 * Run with: npx prisma db seed
 * 
 * Creates initial admin user, modules, and features for the platform
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

// Modules and Features to create
const MODULES_AND_FEATURES = [
  {
    module: {
      key: 'LOAN',
      name: 'Controle de Empréstimos',
      description: 'Módulo para gerenciamento de operações de empréstimo',
      category: 'lending',
      sortOrder: 1,
    },
    features: [
      {
        key: 'LOAN_OPERATIONS',
        name: 'Operações de Empréstimo',
        description: 'Criar e gerenciar operações de empréstimo com parcelas e controle de pagamentos',
        category: 'operations',
        sortOrder: 1,
      },
    ],
  },
  {
    module: {
      key: 'PROMISSORY_NOTE',
      name: 'Controle por Notas Promissórias',
      description: 'Módulo para gerenciamento de notas promissórias',
      category: 'lending',
      sortOrder: 2,
    },
    features: [
      {
        key: 'PROMISSORY_NOTE_OPERATIONS',
        name: 'Operações de Notas Promissórias',
        description: 'Criar e gerenciar operações baseadas em notas promissórias',
        category: 'operations',
        sortOrder: 1,
      },
    ],
  },
  {
    module: {
      key: 'RENT_ROOM',
      name: 'Controle de Aluguel de Quartos',
      description: 'Módulo para gerenciamento de aluguel de quartos',
      category: 'real_estate',
      sortOrder: 3,
    },
    features: [
      {
        key: 'RENT_ROOM_OPERATIONS',
        name: 'Operações de Aluguel de Quartos',
        description: 'Criar e gerenciar operações de aluguel de quartos com controle de mensalidades',
        category: 'operations',
        sortOrder: 1,
      },
    ],
  },
  {
    module: {
      key: 'RENT_HOUSE',
      name: 'Controle de Aluguel de Casas/Kitnet',
      description: 'Módulo para gerenciamento de aluguel de casas e kitnets',
      category: 'real_estate',
      sortOrder: 4,
    },
    features: [
      {
        key: 'RENT_HOUSE_OPERATIONS',
        name: 'Operações de Aluguel de Casas/Kitnet',
        description: 'Criar e gerenciar operações de aluguel de casas e kitnets com controle de mensalidades',
        category: 'operations',
        sortOrder: 1,
      },
    ],
  },
  {
    module: {
      key: 'RENT_VEHICLE',
      name: 'Controle de Veículos',
      description: 'Módulo para gerenciamento de aluguel de veículos',
      category: 'vehicles',
      sortOrder: 5,
    },
    features: [
      {
        key: 'RENT_VEHICLE_OPERATIONS',
        name: 'Operações de Aluguel de Veículos',
        description: 'Criar e gerenciar operações de aluguel de veículos com controle de pagamentos',
        category: 'operations',
        sortOrder: 1,
      },
    ],
  },
];

async function main() {
  console.log('🌱 Starting seed...\n');

  // Create or update admin user
  console.log('📝 Creating/updating admin user...');
  const existingAdmin = await (prisma as any).platformUser.findUnique({
    where: { email: DEFAULT_ADMIN.email },
  });

  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists');
    console.log('   📧 Email:', existingAdmin.email);
    console.log('   👤 Role:', existingAdmin.role);
    console.log('   🆔 ID:', existingAdmin.id);
  } else {
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
    console.log('✅ Admin user created');
    console.log('   📧 Email:', admin.email);
    console.log('   🔑 Password:', DEFAULT_ADMIN.password);
    console.log('   👤 Role:', admin.role);
    console.log('   🆔 ID:', admin.id);
  }

  console.log('\n📦 Creating modules and features...\n');

  // Create modules and features
  for (const { module: moduleData, features } of MODULES_AND_FEATURES) {
    // Check if module exists
    let module = await (prisma as any).module.findUnique({
      where: { key: moduleData.key },
    });

    if (module) {
      console.log(`ℹ️  Module "${moduleData.name}" already exists (key: ${moduleData.key})`);
      // Update module if needed
      module = await (prisma as any).module.update({
        where: { key: moduleData.key },
        data: {
          name: moduleData.name,
          description: moduleData.description,
          category: moduleData.category,
          sortOrder: moduleData.sortOrder,
        },
      });
    } else {
      module = await (prisma as any).module.create({
        data: moduleData,
      });
      console.log(`✅ Created module: ${moduleData.name} (key: ${moduleData.key})`);
    }

    // Create features for this module
    for (const featureData of features) {
      const existingFeature = await (prisma as any).feature.findUnique({
        where: { key: featureData.key },
      });

      if (existingFeature) {
        console.log(`   ℹ️  Feature "${featureData.name}" already exists (key: ${featureData.key})`);
        // Update feature if needed
        await (prisma as any).feature.update({
          where: { key: featureData.key },
          data: {
            name: featureData.name,
            description: featureData.description,
            category: featureData.category,
            moduleId: module.id,
            sortOrder: featureData.sortOrder,
          },
        });
      } else {
        await (prisma as any).feature.create({
          data: {
            ...featureData,
            moduleId: module.id,
          },
        });
        console.log(`   ✅ Created feature: ${featureData.name} (key: ${featureData.key})`);
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Seed completed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📊 Summary:');
  console.log(`   • Modules: ${MODULES_AND_FEATURES.length}`);
  console.log(`   • Features: ${MODULES_AND_FEATURES.reduce((sum, m) => sum + m.features.length, 0)}`);
  console.log('\n⚠️  IMPORTANT: Change the default admin password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error running seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

