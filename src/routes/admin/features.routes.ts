/**
 * Admin Features Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { AdminFeaturesController } from '../../controllers/admin/featuresController';
import { validate } from '../../middlewares/validation.middleware';
import {
  createFeatureSchema,
  updateFeatureSchema,
} from '../../dtos/features.dto';

const router = Router();
const featuresApi = makeInvoker(AdminFeaturesController);

/**
 * @swagger
 * /api/admin/features:
 *   get:
 *     summary: List all features (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', featuresApi('index'));

/**
 * @swagger
 * /api/admin/features/{id}:
 *   get:
 *     summary: Get feature by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', featuresApi('show'));

/**
 * @swagger
 * /api/admin/features/key/{key}:
 *   get:
 *     summary: Get feature by key (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/key/:key', featuresApi('findByKey'));

/**
 * @swagger
 * /api/admin/features:
 *   post:
 *     summary: Create new feature (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validate(createFeatureSchema), featuresApi('create'));

/**
 * @swagger
 * /api/admin/features/{id}:
 *   put:
 *     summary: Update feature (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', validate(updateFeatureSchema), featuresApi('update'));

/**
 * @swagger
 * /api/admin/features/{id}:
 *   delete:
 *     summary: Delete feature (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', featuresApi('delete'));

export default router;
