import { Router } from 'express';
import { createShow } from '../controllers/adminController';
import { validateCreateShow } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/admin/shows:
 *   post:
 *     summary: Create a new show with seats
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShowRequest'
 *     responses:
 *       201:
 *         description: Show created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Show'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/shows', validateCreateShow, createShow);

export { router as adminRoutes };


