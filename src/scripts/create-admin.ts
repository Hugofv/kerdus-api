/**
 * Script to create admin user
 * Run: npx ts-node src/scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  try {
    console.log('=== Create Admin User ===\n');

    const name = await question('Name: ');
    const email = await question('Email: ');
    const password = await question('Password: ');

    if (!name || !email || !password) {
      console.error('All fields are required');
      process.exit(1);
    }

    // Check if user already exists
    const existing = await (prisma as any).platformUser.findUnique({
      where: { email },
    });

    if (existing) {
      console.error('User with this email already exists');
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await (prisma as any).platformUser.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'admin',
        isActive: true,
        emailVerifiedAt: new Date(),
      },
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdmin();

