import Bull from 'bull';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const EXPIRY_MINUTES = parseInt(process.env.BOOKING_EXPIRY_MINUTES || '2', 10);

// Create Bull queue for booking expiry
const bookingExpiryQueue = new Bull('booking-expiry', REDIS_URL);

// Process expiry jobs
bookingExpiryQueue.process(async (job) => {
  const { bookingId } = job.data;

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      // Only expire if still PENDING
      if (booking && booking.status === 'PENDING') {
        const seatNumbers = booking.seats as number[];

        // Release seats back to AVAILABLE
        await tx.seat.updateMany({
          where: {
            showId: booking.showId,
            seatNumber: { in: seatNumbers },
          },
          data: {
            status: 'AVAILABLE',
            heldByBookingId: null,
          },
        });

        // Mark booking as FAILED
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: 'FAILED',
            version: { increment: 1 },
          },
        });

        logger.info(`Expired booking ${bookingId}`);
      }
    });
  } catch (error) {
    logger.error(`Error expiring booking ${bookingId}:`, error);
    throw error;
  }
});

// Enqueue a booking expiry job
export const enqueueBookingExpiry = async (bookingId: string) => {
  try {
    const delay = EXPIRY_MINUTES * 60 * 1000; // Convert minutes to milliseconds

    await bookingExpiryQueue.add(
      { bookingId },
      {
        delay,
        attempts: 1, // Only try once
      }
    );

    logger.debug(`Enqueued expiry job for booking ${bookingId} (${EXPIRY_MINUTES} minutes)`);
  } catch (error) {
    logger.error(`Failed to enqueue expiry job for booking ${bookingId}:`, error);
    // Don't throw - booking should succeed even if queue fails
  }
};

// Start the queue processor (called from index.ts)
export const startBookingExpiryJob = () => {
  logger.info('Booking expiry job processor started');
  logger.info(`Bookings will expire after ${EXPIRY_MINUTES} minutes`);
};


