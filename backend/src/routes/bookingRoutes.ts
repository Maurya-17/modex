import { Router } from 'express';
import {
  getBooking,
  confirmBooking,
  cancelBooking,
} from '../controllers/bookingController';

const router = Router();

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking details
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getBooking);

/**
 * @swagger
 * /api/bookings/{id}/confirm:
 *   post:
 *     summary: Confirm a pending booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking confirmed
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
 *                   enum: [CONFIRMED]
 *       400:
 *         description: Invalid booking status
 *       404:
 *         description: Booking not found
 */
router.post('/:id/confirm', confirmBooking);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled
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
 *                   enum: [FAILED]
 *       404:
 *         description: Booking not found
 */
router.delete('/:id/cancel', cancelBooking);

export { router as bookingRoutes };

