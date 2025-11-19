/**
 * Role-based access control middleware
 */

import { Request, Response, NextFunction } from 'express';
import HttpStatusCodes from '../common/HttpStatusCodes';
import { UserRole } from '../constants/enums';

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({
        success: false,
        error: { message: 'Authentication required', code: 'UNAUTHORIZED' },
      });
      return;
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      res.status(HttpStatusCodes.FORBIDDEN).json({
        success: false,
        error: {
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          code: 'FORBIDDEN',
        },
      });
      return;
    }

    next();
  };
}

// Convenience functions
export const requireOwner = requireRole(UserRole.OWNER);
export const requireAdmin = requireRole(UserRole.OWNER, UserRole.ADMIN);
export const requireOwnerOrAdmin = requireRole(UserRole.OWNER, UserRole.ADMIN);

