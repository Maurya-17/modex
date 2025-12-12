import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './errorHandler';

const createShowSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startTime: z.string().datetime('Invalid ISO datetime format'),
  totalSeats: z.number().int().positive('Total seats must be a positive integer'),
});

const createBookingSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  seats: z.array(z.number().int().positive()).min(1, 'At least one seat must be selected'),
});

export const validateCreateShow = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    createShowSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
};

export const validateCreateBooking = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    createBookingSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(400, error.errors[0].message));
    }
    next(error);
  }
};


