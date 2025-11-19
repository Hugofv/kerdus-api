/**
 * Request validation middleware using Zod
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import HttpStatusCodes from '../common/HttpStatusCodes';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        });
        return;
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Query validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        });
        return;
      }
      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Parameter validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors,
          },
        });
        return;
      }
      next(error);
    }
  };
}

