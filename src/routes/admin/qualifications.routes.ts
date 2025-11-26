/**
 * Admin Qualifications Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { AdminQualificationsController } from '../../controllers/admin/qualificationsController';
import { validate } from '../../middlewares/validation.middleware';
import {
  createQualificationSchema,
  updateQualificationSchema,
  saveQualificationAnswersSchema,
} from '../../dtos/qualifications.dto';

const router = Router();
const qualificationsApi = makeInvoker(AdminQualificationsController);

/**
 * @swagger
 * /api/admin/qualifications:
 *   get:
 *     summary: List all qualifications (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', qualificationsApi('index'));

/**
 * @swagger
 * /api/admin/qualifications/{id}:
 *   get:
 *     summary: Get qualification by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', qualificationsApi('show'));

/**
 * @swagger
 * /api/admin/qualifications/account/{accountId}:
 *   get:
 *     summary: Get qualifications by account (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/account/:accountId', qualificationsApi('findByAccount'));

/**
 * @swagger
 * /api/admin/qualifications/client/{clientId}:
 *   get:
 *     summary: Get qualifications by client (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/client/:clientId', qualificationsApi('findByClient'));

/**
 * @swagger
 * /api/admin/qualifications:
 *   post:
 *     summary: Create qualification (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  validate(createQualificationSchema),
  qualificationsApi('create')
);

/**
 * @swagger
 * /api/admin/qualifications/save-answers:
 *   post:
 *     summary: Save qualification answers (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/save-answers',
  validate(saveQualificationAnswersSchema),
  qualificationsApi('saveAnswers')
);

/**
 * @swagger
 * /api/admin/qualifications/{id}:
 *   put:
 *     summary: Update qualification (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id',
  validate(updateQualificationSchema),
  qualificationsApi('update')
);

/**
 * @swagger
 * /api/admin/qualifications/{id}:
 *   delete:
 *     summary: Delete qualification (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', qualificationsApi('delete'));

export default router;
