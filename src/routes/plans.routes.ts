/**
 * Public Plans Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { PlansController } from '../controllers/plans';

const router = Router();
const api = makeInvoker(PlansController);

// Public routes (no authentication required)

/**
 * @swagger
 * /api/plans/public:
 *   get:
 *     summary: Get public plans
 *     tags: [Plans]
 *     description: Get all active public plans for onboarding/plan selection
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of public plans
 */
router.get('/public', api('getPublic'));

/**
 * @swagger
 * /api/plans/recommended:
 *   post:
 *     summary: Get recommended plans based on qualification
 *     tags: [Plans]
 *     description: Get recommended plans based on qualification answers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionKey:
 *                       type: string
 *                     answer:
 *                       type: string | number | array | object
 *     responses:
 *       200:
 *         description: Recommended plans
 */
router.post('/recommended', api('getRecommended'));

export default router;

