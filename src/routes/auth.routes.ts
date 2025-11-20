/**
 * Authentication Routes
 */

import { Router, Request, Response } from 'express';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from '../dtos/auth.dto';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AuthService } from '../services/auth';
import { AuthController } from '../controllers/auth';
import { prisma } from '../prisma/client';

const router = Router();

// Create controller instance directly (bypassing Awilix for auth routes)
// This ensures auth routes work even if Awilix has issues resolving the controller
// Using the shared PrismaClient instance from prisma/client.ts
const authService = new AuthService(prisma);
const authController = new AuthController(authService);

// Helper to wrap controller methods with error handling
const wrapHandler = (handler: (req: Request, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response) => {
    try {
      await handler(req, res);
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            message: error instanceof Error ? error.message : 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
        });
      }
    }
  };
};

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autenticação de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     expiresIn:
 *                       type: integer
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validate(loginSchema), wrapHandler((req, res) => authController.login(req, res)));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *       401:
 *         description: Refresh token inválido
 */
router.post('/refresh', validate(refreshTokenSchema), wrapHandler((req, res) => authController.refresh(req, res)));

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar reset de senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email enviado (sempre retorna sucesso por segurança)
 */
router.post('/forgot-password', validate(forgotPasswordSchema), wrapHandler((req, res) => authController.forgotPassword(req, res)));

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Resetar senha com token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Senha resetada com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.post('/reset-password', validate(resetPasswordSchema), wrapHandler((req, res) => authController.resetPassword(req, res)));

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obter dados do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Não autenticado
 */
router.get('/me', authMiddleware, wrapHandler((req, res) => authController.me(req, res)));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout (remove token client-side)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado
 */
router.post('/logout', authMiddleware, wrapHandler((req, res) => authController.logout(req, res)));

export default router;
