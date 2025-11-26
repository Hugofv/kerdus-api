/**
 * Authentication middleware
 * Validates JWT token and loads user data
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
  accountId?: number | null;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Get prisma instance (will be injected via DI container)
let prismaInstance: PrismaClient | null = null;

export function setPrismaInstance(prisma: PrismaClient): void {
  prismaInstance = prisma;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // In development, allow requests without auth (optional)
    if (process.env.NODE_ENV === 'development' && process.env.ALLOW_UNAUTHENTICATED === 'true') {
      // Set default admin user for development
      req.user = {
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
        accountId: null,
        isAdmin: true,
      };
      return next();
    }

    res.status(401).json({
      success: false,
      error: { message: 'Authorization header required', code: 'UNAUTHORIZED' },
    });
    return;
  }

  try {
    const token = authHeader.replace('Bearer ', '');

    if (!prismaInstance) {
      // Fallback: try to get from container or create new instance
      // In production, this should be injected via DI
      const { PrismaClient } = await import('@prisma/client');
      prismaInstance = new PrismaClient();
    }

    const authService = new AuthService({ prisma: prismaInstance });
    const decoded = authService.verifyToken(token);

    // Load user from database to ensure it's still active
    const user = await authService.getUserById(decoded.userId);

    if (!user || user.deletedAt || !user.isActive) {
      res.status(401).json({
        success: false,
        error: { message: 'User not found or inactive', code: 'UNAUTHORIZED' },
      });
      return;
    }

    // Set user in request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      accountId: decoded.accountId,
      isAdmin: authService.isAdmin(user.role),
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Invalid or expired token',
        code: 'UNAUTHORIZED',
      },
    });
  }
}

