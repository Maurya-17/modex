import { Router } from 'express';
import { getShows, getShowSeats, createBooking } from '../controllers/showController';
import { validateCreateBooking } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/shows:
 *   get:
 *     summary: Get all available shows
 *     tags: [Shows]
 *     responses:
 *       200:
 *         description: List of shows
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Show'
 */
router.get('/', getShows);

/**
 * @swagger
 * /api/shows/{id}/seats:
 *   get:
 *     summary: Get seat availability for a show
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Show ID
 *     responses:
 *       200:
 *         description: Seat availability
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShowSeats'
 *       404:
 *         description: Show not found
 */
router.get('/:id/seats', getShowSeats);

/**
 * @swagger
 * /api/shows/{id}/book:
 *   post:
 *     summary: Create a booking (holds seats)
 *     tags: [Shows]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Show ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookingId:
 *                   type: string
 *                   format: uuid
 *                 status:
 *                   type: string
 *                   enum: [PENDING]
 *                 seats:
 *                   type: array
 *                   items:
 *                     type: integer
 *       409:
 *         description: Seats not available (conflict)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Show or user not found
 */
router.post('/:id/book', validateCreateBooking, createBooking);

export { router as showRoutes };

