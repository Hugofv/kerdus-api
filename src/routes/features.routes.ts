/**
 * Admin Features Routes
 * Features management (admin only)
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { AdminFeaturesController } from '../controllers/admin/features';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// All features routes require admin role
router.use(requireAdmin);

const api = makeInvoker(AdminFeaturesController);

/**
 * @swagger
 * /api/features:
 *   get:
 *     summary: List all features (Admin only)
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     description: Get all features (admin only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of features
 */
router.get('/', api('index'));

/**
 * @swagger
 * /api/features/{id}:
 *   get:
 *     summary: Get feature by ID (Admin only)
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Feature details
 */
router.get('/:id', api('show'));

/**
 * @swagger
 * /api/features/key/{key}:
 *   get:
 *     summary: Get feature by key (Admin only)
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feature details
 */
router.get('/key/:key', api('findByKey'));

export default router;

