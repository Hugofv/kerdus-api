/**
 * Accounts Routes
 */

import { Router } from 'express';
import { makeInvoker } from 'awilix-express';
import { AccountsController } from '../controllers/accounts';
import { validate } from '../middlewares/validation.middleware';
import { createAccountSchema, updateAccountSchema } from '../dtos/accounts.dto';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const api = makeInvoker(AccountsController);

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Listar contas
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de contas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', api('index'));

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Obter conta por ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da conta
 *     responses:
 *       200:
 *         description: Dados da conta
 *       404:
 *         description: Conta não encontrada
 */
router.get('/:id', api('show'));

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Criar nova conta
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               document:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *               currency:
 *                 type: string
 *                 default: BRL
 *     responses:
 *       201:
 *         description: Conta criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', validate(createAccountSchema), api('create'));

/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Atualizar conta
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conta atualizada
 *       404:
 *         description: Conta não encontrada
 */
router.put('/:id', validate(updateAccountSchema), api('update'));

/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     summary: Deletar conta (soft delete)
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Conta deletada
 *       404:
 *         description: Conta não encontrada
 */
router.delete('/:id', api('delete'));

export default router;
