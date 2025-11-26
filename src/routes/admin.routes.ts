/**
 * Admin Routes
 * Admin-only routes for managing plans, features, and qualifications
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { AdminPlansController } from '../controllers/admin/plans';
import { AdminFeaturesController } from '../controllers/admin/features';
import { AdminQualificationsController } from '../controllers/admin/qualifications';
import { validate } from '../middlewares/validation.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import {
  createPlanSchema,
  updatePlanSchema,
} from '../dtos/plans.dto';
import {
  createFeatureSchema,
  updateFeatureSchema,
} from '../dtos/features.dto';
import {
  createQualificationSchema,
  updateQualificationSchema,
  saveQualificationAnswersSchema,
} from '../dtos/qualifications.dto';

const router = Router();

// All admin routes require admin role
router.use(requireAdmin);

const plansApi = makeInvoker(AdminPlansController);
const featuresApi = makeInvoker(AdminFeaturesController);
const qualificationsApi = makeInvoker(AdminQualificationsController);

// ========== PLANS ==========

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
router.get('/plans', plansApi('index'));

/**
 * @swagger
 * /api/admin/plans/{id}:
 *   get:
 *     summary: Get plan by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/plans/:id', plansApi('show'));

/**
 * @swagger
 * /api/admin/plans:
 *   post:
 *     summary: Create new plan (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/plans', validate(createPlanSchema), plansApi('create'));

/**
 * @swagger
 * /api/admin/plans/{id}:
 *   put:
 *     summary: Update plan (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put('/plans/:id', validate(updatePlanSchema), plansApi('update'));

/**
 * @swagger
 * /api/admin/plans/{id}:
 *   delete:
 *     summary: Delete plan (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/plans/:id', plansApi('delete'));

/**
 * @swagger
 * /api/admin/plans/recommended:
 *   post:
 *     summary: Get recommended plans based on qualification (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/plans/recommended', plansApi('getRecommended'));

// ========== FEATURES ==========

/**
 * @swagger
 * /api/admin/features:
 *   get:
 *     summary: List all features (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/features', featuresApi('index'));

/**
 * @swagger
 * /api/admin/features/{id}:
 *   get:
 *     summary: Get feature by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/features/:id', featuresApi('show'));

/**
 * @swagger
 * /api/admin/features/key/{key}:
 *   get:
 *     summary: Get feature by key (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/features/key/:key', featuresApi('findByKey'));

/**
 * @swagger
 * /api/admin/features:
 *   post:
 *     summary: Create new feature (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/features', validate(createFeatureSchema), featuresApi('create'));

/**
 * @swagger
 * /api/admin/features/{id}:
 *   put:
 *     summary: Update feature (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put('/features/:id', validate(updateFeatureSchema), featuresApi('update'));

/**
 * @swagger
 * /api/admin/features/{id}:
 *   delete:
 *     summary: Delete feature (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/features/:id', featuresApi('delete'));

// ========== QUALIFICATIONS ==========

/**
 * @swagger
 * /api/admin/qualifications:
 *   get:
 *     summary: List all qualifications (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/qualifications', qualificationsApi('index'));

/**
 * @swagger
 * /api/admin/qualifications/{id}:
 *   get:
 *     summary: Get qualification by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/qualifications/:id', qualificationsApi('show'));

/**
 * @swagger
 * /api/admin/qualifications/account/{accountId}:
 *   get:
 *     summary: Get qualifications by account (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/qualifications/account/:accountId', qualificationsApi('findByAccount'));

/**
 * @swagger
 * /api/admin/qualifications/client/{clientId}:
 *   get:
 *     summary: Get qualifications by client (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/qualifications/client/:clientId', qualificationsApi('findByClient'));

/**
 * @swagger
 * /api/admin/qualifications:
 *   post:
 *     summary: Create qualification (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/qualifications', validate(createQualificationSchema), qualificationsApi('create'));

/**
 * @swagger
 * /api/admin/qualifications/save-answers:
 *   post:
 *     summary: Save qualification answers (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post('/qualifications/save-answers', validate(saveQualificationAnswersSchema), qualificationsApi('saveAnswers'));

/**
 * @swagger
 * /api/admin/qualifications/{id}:
 *   put:
 *     summary: Update qualification (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put('/qualifications/:id', validate(updateQualificationSchema), qualificationsApi('update'));

/**
 * @swagger
 * /api/admin/qualifications/{id}:
 *   delete:
 *     summary: Delete qualification (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/qualifications/:id', qualificationsApi('delete'));

export default router;

