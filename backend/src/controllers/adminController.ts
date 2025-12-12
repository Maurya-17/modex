import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export const createShow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, startTime, totalSeats } = req.body;

    // Create show and seats in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const show = await tx.show.create({
        data: {
          title,
          startTime: new Date(startTime),
          totalSeats,
        },
      });

      // Pre-generate seats
      const seats = Array.from({ length: totalSeats }, (_, i) => ({
        showId: show.id,
        seatNumber: i + 1,
        status: 'AVAILABLE' as const,
      }));

      await tx.seat.createMany({
        data: seats,
      });

      return show;
    });

    logger.info(`Created show ${result.id} with ${totalSeats} seats`);

    res.status(201).json({
      id: result.id,
      title: result.title,
      startTime: result.startTime,
      totalSeats: result.totalSeats,
    });
  } catch (error) {
    logger.error('Error creating show:', error);
    next(error);
  }
};


