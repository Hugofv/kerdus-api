/**
 * Admin Plans Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { AdminPlansController } from '../../controllers/admin/plans';
import { validate } from '../../middlewares/validation.middleware';
import {
  createPlanSchema,
  updatePlanSchema,
} from '../../dtos/plans.dto';

const router = Router();
const plansApi = makeInvoker(AdminPlansController);

/**
 * @swagger
 * /api/admin/plans:
 *   get:
 *     summary: List all plans (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 */
router.get('/', plansApi('index'));

/**
 * @swagger
 * /api/admin/plans/{id}:
 *   get:
 *     summary: Get plan by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', plansApi('show'));

/**
 * @swagger
 * /api/admin/plans:
 *   post:
 *     summary: Create new plan (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validate(createPlanSchema), plansApi('create'));

/**
 * @swagger
 * /api/admin/plans/{id}:
 *   put:
 *     summary: Update plan (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', validate(updatePlanSchema), plansApi('update'));

/**
 * @swagger
 * /api/admin/plans/{id}:
 *   delete:
 *     summary: Delete plan (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', plansApi('delete'));

/**
 * @swagger
 * /api/admin/plans/recommended:
 *   post:
 *     summary: Get recommended plans based on qualification (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/recommended', plansApi('getRecommended'));

export default router;

