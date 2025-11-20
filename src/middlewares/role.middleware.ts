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

/**
 * Require admin role (platform-wide access, no account needed)
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      success: false,
      error: { message: 'Authentication required', code: 'UNAUTHORIZED' },
    });
    return;
  }

  if (!req.user.isAdmin) {
    res.status(HttpStatusCodes.FORBIDDEN).json({
      success: false,
      error: {
        message: 'Access denied. Admin role required',
        code: 'FORBIDDEN',
      },
    });
    return;
  }

  next();
}

/**
 * Require owner or admin role
 */
export function requireOwnerOrAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      success: false,
      error: { message: 'Authentication required', code: 'UNAUTHORIZED' },
    });
    return;
  }

  const isAllowed = req.user.isAdmin || req.user.role === UserRole.OWNER;
  if (!isAllowed) {
    res.status(HttpStatusCodes.FORBIDDEN).json({
      success: false,
      error: {
        message: 'Access denied. Owner or Admin role required',
        code: 'FORBIDDEN',
      },
    });
    return;
  }

  next();
}

/**
 * Require account access (user must have accountId or be admin)
 */
export function requireAccountAccess(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      success: false,
      error: { message: 'Authentication required', code: 'UNAUTHORIZED' },
    });
    return;
  }

  // Admin has access to everything
  if (req.user.isAdmin) {
    return next();
  }

  // For other roles, check if they have an account
  const requestedAccountId = req.body.accountId || req.query.accountId || req.params.accountId;
  const userAccountId = req.user.accountId;

  if (requestedAccountId && userAccountId && Number(requestedAccountId) !== Number(userAccountId)) {
    res.status(HttpStatusCodes.FORBIDDEN).json({
      success: false,
      error: {
        message: 'Access denied. You do not have access to this account',
        code: 'FORBIDDEN',
      },
    });
    return;
  }

  next();
}

