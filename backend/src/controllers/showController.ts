import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { enqueueBookingExpiry } from '../jobs/bookingExpiry';

export const getShows = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shows = await prisma.show.findMany({
      orderBy: {
        startTime: 'asc',
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        totalSeats: true,
        createdAt: true,
      },
    });

    res.json(shows);
  } catch (error) {
    logger.error('Error fetching shows:', error);
    next(error);
  }
};

export const getShowSeats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const show = await prisma.show.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!show) {
      return next(new AppError(404, 'Show not found'));
    }

    const seats = await prisma.seat.findMany({
      where: { showId: id },
      orderBy: { seatNumber: 'asc' },
      select: {
        seatNumber: true,
        status: true,
      },
    });

    res.json({
      showId: id,
      showTitle: show.title,
      seats,
    });
  } catch (error) {
    logger.error('Error fetching show seats:', error);
    next(error);
  }
};

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: showId } = req.params;
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
      // Use proper parameter binding for UUID and array
      const seatNumbersStr = seatNumbers.join(',');
      const seats = await tx.$queryRawUnsafe<Array<{
        id: string;
        seatNumber: number;
        status: string;
      }>>(
        `SELECT id, "seatNumber", status
        FROM "Seat"
        WHERE "showId" = $1
        AND "seatNumber" = ANY(ARRAY[${seatNumbersStr}]::int[])
        FOR UPDATE`,
        showId
      );

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

    // Enqueue expiry job (non-blocking - don't fail booking if queue fails)
    enqueueBookingExpiry(booking.id).catch((err) => {
      logger.error(`Failed to enqueue expiry job for booking ${booking.id}:`, err);
    });

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

