import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { enqueueBookingExpiry } from '../jobs/bookingExpiry';

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { showId } = req.params;
    const { userId, seats: seatNumbers } = req.body;

    // Validate show exists
    const show = await prisma.show.findUnique({
      where: { id: showId },
    });

    if (!show) {
      return next(new AppError(404, 'Show not found'));
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    // Transaction with row-level locks for concurrency safety
    const booking = await prisma.$transaction(async (tx) => {
      // Lock seats using FOR UPDATE (row-level lock)
      const seats = await tx.$queryRaw<Array<{
        id: string;
        seatNumber: number;
        status: string;
      }>>`
        SELECT id, "seatNumber", status
        FROM "Seat"
        WHERE "showId" = ${showId}::uuid
        AND "seatNumber" = ANY(${seatNumbers}::int[])
        FOR UPDATE
      `;

      // Check if all requested seats exist and are available
      if (seats.length !== seatNumbers.length) {
        const foundSeatNumbers = seats.map((s) => s.seatNumber);
        const missing = seatNumbers.filter((sn: number) => !foundSeatNumbers.includes(sn));
        throw new AppError(
          400,
          `Seats not found: ${missing.join(', ')}`
        );
      }

      // Check if all seats are available
      const unavailableSeats = seats.filter((s) => s.status !== 'AVAILABLE');
      if (unavailableSeats.length > 0) {
        const unavailableNumbers = unavailableSeats.map((s) => s.seatNumber);
        throw new AppError(
          409,
          `Seats ${unavailableNumbers.join(', ')} are not available`
        );
      }

      // Create booking
      const booking = await tx.booking.create({
        data: {
          showId,
          userId,
          seats: seatNumbers,
          status: 'PENDING',
        },
      });

      // Update seats to HELD
      await tx.seat.updateMany({
        where: {
          showId,
          seatNumber: { in: seatNumbers },
        },
        data: {
          status: 'HELD',
          heldByBookingId: booking.id,
        },
      });

      return booking;
    }, {
      timeout: 10000, // 10 second timeout
    });

    // Enqueue expiry job
    await enqueueBookingExpiry(booking.id);

    logger.info(`Created booking ${booking.id} for show ${showId}`);

    res.status(201).json({
      bookingId: booking.id,
      status: booking.status,
      seats: seatNumbers,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    logger.error('Error creating booking:', error);
    next(error);
  }
};

export const getBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        show: {
          select: {
            id: true,
            title: true,
            startTime: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!booking) {
      return next(new AppError(404, 'Booking not found'));
    }

    res.json(booking);
  } catch (error) {
    logger.error('Error fetching booking:', error);
    next(error);
  }
};

export const confirmBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const booking = await prisma.$transaction(async (tx) => {
      // Lock booking row using FOR UPDATE (row-level lock)
      // Use $queryRawUnsafe to avoid UUID casting issues
      const bookingResult = await tx.$queryRawUnsafe<Array<{
        id: string;
        showId: string;
        userId: string;
        seats: any;
        status: string;
        version: number;
      }>>(
        `SELECT id, "showId", "userId", seats, status, version
        FROM "Booking"
        WHERE id = $1
        FOR UPDATE`,
        id
      );

      if (!bookingResult || bookingResult.length === 0) {
        throw new AppError(404, 'Booking not found');
      }

      const bookingData = bookingResult[0];

      // Check version for optimistic locking
      if (bookingData.status !== 'PENDING') {
        throw new AppError(
          400,
          `Cannot confirm booking with status: ${bookingData.status}`
        );
      }

      const seatNumbers = bookingData.seats as number[];

      // Update seats to BOOKED
      await tx.seat.updateMany({
        where: {
          showId: bookingData.showId,
          seatNumber: { in: seatNumbers },
        },
        data: {
          status: 'BOOKED',
          heldByBookingId: null,
        },
      });

      // Update booking status with version check (optimistic locking)
      // Use $executeRawUnsafe to avoid UUID casting issues
      const updateResult = await tx.$executeRawUnsafe(
        `UPDATE "Booking"
        SET status = 'CONFIRMED', version = version + 1, "updatedAt" = NOW()
        WHERE id = $1
        AND version = $2`,
        bookingData.id,
        bookingData.version
      );

      if (updateResult === 0) {
        throw new AppError(409, 'Booking was modified by another request');
      }

      const updatedBooking = await tx.booking.findUnique({
        where: { id: bookingData.id },
      });

      if (!updatedBooking) {
        throw new AppError(404, 'Booking not found after update');
      }

      return updatedBooking;
    });

    logger.info(`Confirmed booking ${id}`);

    res.json({
      bookingId: booking.id,
      status: booking.status,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    logger.error('Error confirming booking:', error);
    next(error);
  }
};

export const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const booking = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id },
      });

      if (!booking) {
        throw new AppError(404, 'Booking not found');
      }

      if (booking.status === 'CONFIRMED') {
        // For confirmed bookings, we could either:
        // 1. Forbid cancellation (return error)
        // 2. Allow cancellation and release seats
        // For now, we'll allow it but log a warning
        logger.warn(`Cancelling confirmed booking ${id}`);
      }

      if (booking.status === 'FAILED') {
        throw new AppError(400, 'Booking is already cancelled/failed');
      }

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

      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: {
          status: 'FAILED',
          version: { increment: 1 },
        },
      });

      return updatedBooking;
    });

    logger.info(`Cancelled booking ${id}`);

    res.json({
      bookingId: booking.id,
      status: booking.status,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    logger.error('Error cancelling booking:', error);
    next(error);
  }
};


