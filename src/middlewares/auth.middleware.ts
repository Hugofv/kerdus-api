/**
 * Authentication middleware (stub)
 * TODO: Implement actual JWT/token validation
 */

import { Request, Response, NextFunction } from 'express';
import HttpStatusCodes from '../common/HttpStatusCodes';

export interface AuthenticatedUser {
  id: number;
  role: string;
  accountId?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Stub implementation - reads Authorization header
  // TODO: Implement actual token validation (JWT, OAuth, etc.)
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // For now, allow requests without auth (development mode)
    // In production, uncomment below:
    // res.status(HttpStatusCodes.UNAUTHORIZED).json({
    //   success: false,
    //   error: { message: 'Authorization header required', code: 'UNAUTHORIZED' },
    // });
    // return;
    req.user = { id: 1, role: 'owner' }; // Default user for development
    return next();
  }

  // TODO: Parse and validate token
  // Example: const token = authHeader.replace('Bearer ', '');
  // const decoded = verifyToken(token);
  // req.user = { id: decoded.userId, role: decoded.role };

  // Stub: extract user from header (format: "Bearer userId:role")
  const parts = authHeader.replace('Bearer ', '').split(':');
  if (parts.length >= 2) {
    req.user = {
      id: parseInt(parts[0], 10),
      role: parts[1],
    };
  } else {
    req.user = { id: 1, role: 'owner' }; // Default
  }

  next();
}

