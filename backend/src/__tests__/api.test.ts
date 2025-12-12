import request from 'supertest';
import app from '../index';
import { prisma } from '../utils/prisma';

describe('API Endpoints', () => {
  const testUserId = '00000000-0000-0000-0000-000000000002';
  let testShowId: string;
  let testBookingId: string;

  beforeAll(async () => {
    // Create a test show
    const show = await prisma.show.create({
      data: {
        title: 'Test Show',
        startTime: new Date('2024-12-31T20:00:00Z'),
        totalSeats: 10,
      },
    });
    testShowId = show.id;

    // Create seats
    await prisma.seat.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        showId: show.id,
        seatNumber: i + 1,
        status: 'AVAILABLE',
      })),
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.booking.deleteMany({ where: { showId: testShowId } });
    await prisma.seat.deleteMany({ where: { showId: testShowId } });
    await prisma.show.delete({ where: { id: testShowId } });
    await prisma.$disconnect();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('GET /api/shows', () => {
    it('should return list of shows', async () => {
      const response = await request(app).get('/api/shows');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/shows/:id/seats', () => {
    it('should return seat availability', async () => {
      const response = await request(app).get(`/api/shows/${testShowId}/seats`);
      expect(response.status).toBe(200);
      expect(response.body.showId).toBe(testShowId);
      expect(Array.isArray(response.body.seats)).toBe(true);
      expect(response.body.seats.length).toBe(10);
    });

    it('should return 404 for non-existent show', async () => {
      const response = await request(app).get(
        '/api/shows/00000000-0000-0000-0000-000000000000/seats'
      );
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/shows/:id/book', () => {
    it('should create a booking', async () => {
      const response = await request(app)
        .post(`/api/shows/${testShowId}/book`)
        .send({
          userId: testUserId,
          seats: [1, 2],
        });

      expect(response.status).toBe(201);
      expect(response.body.bookingId).toBeDefined();
      expect(response.body.status).toBe('PENDING');
      testBookingId = response.body.bookingId;
    });

    it('should return 409 if seats are not available', async () => {
      const response = await request(app)
        .post(`/api/shows/${testShowId}/book`)
        .send({
          userId: testUserId,
          seats: [1, 2], // Already booked
        });

      expect(response.status).toBe(409);
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post(`/api/shows/${testShowId}/book`)
        .send({
          userId: testUserId,
          seats: [], // Empty seats
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return booking details', async () => {
      const response = await request(app).get(`/api/bookings/${testBookingId}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testBookingId);
      expect(response.body.status).toBe('PENDING');
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app).get(
        '/api/bookings/00000000-0000-0000-0000-000000000000'
      );
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/bookings/:id/confirm', () => {
    it('should confirm a pending booking', async () => {
      // Create a new booking first
      const bookingResponse = await request(app)
        .post(`/api/shows/${testShowId}/book`)
        .send({
          userId: testUserId,
          seats: [3, 4],
        });

      const bookingId = bookingResponse.body.bookingId;

      const response = await request(app).post(
        `/api/bookings/${bookingId}/confirm`
      );
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('CONFIRMED');
    });

    it('should return 400 if booking is not pending', async () => {
      // Try to confirm already confirmed booking
      const response = await request(app).post(
        `/api/bookings/${testBookingId}/confirm`
      );
      // This might be 400 or 404 depending on state
      expect([400, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/bookings/:id/cancel', () => {
    it('should cancel a booking', async () => {
      // Create a new booking first
      const bookingResponse = await request(app)
        .post(`/api/shows/${testShowId}/book`)
        .send({
          userId: testUserId,
          seats: [5, 6],
        });

      const bookingId = bookingResponse.body.bookingId;

      const response = await request(app).delete(
        `/api/bookings/${bookingId}/cancel`
      );
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('FAILED');
    });
  });

  describe('POST /api/admin/shows', () => {
    it('should create a show with seats', async () => {
      const response = await request(app)
        .post('/api/admin/shows')
        .send({
          title: 'Admin Test Show',
          startTime: '2024-12-31T21:00:00Z',
          totalSeats: 20,
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Admin Test Show');
      expect(response.body.totalSeats).toBe(20);

      // Verify seats were created
      const seats = await prisma.seat.findMany({
        where: { showId: response.body.id },
      });
      expect(seats.length).toBe(20);

      // Cleanup
      await prisma.seat.deleteMany({ where: { showId: response.body.id } });
      await prisma.show.delete({ where: { id: response.body.id } });
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/admin/shows')
        .send({
          title: '',
          startTime: 'invalid-date',
          totalSeats: -1,
        });

      expect(response.status).toBe(400);
    });
  });
});

describe('Concurrency Tests', () => {
  const testUserId1 = '00000000-0000-0000-0000-000000000002';
  const testUserId2 = '00000000-0000-0000-0000-000000000001';
  let testShowId: string;

  beforeAll(async () => {
    const show = await prisma.show.create({
      data: {
        title: 'Concurrency Test Show',
        startTime: new Date('2024-12-31T22:00:00Z'),
        totalSeats: 5,
      },
    });
    testShowId = show.id;

    await prisma.seat.createMany({
      data: Array.from({ length: 5 }, (_, i) => ({
        showId: show.id,
        seatNumber: i + 1,
        status: 'AVAILABLE',
      })),
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { showId: testShowId } });
    await prisma.seat.deleteMany({ where: { showId: testShowId } });
    await prisma.show.delete({ where: { id: testShowId } });
    await prisma.$disconnect();
  });

  it('should prevent double booking of the same seat', async () => {
    // Try to book the same seat simultaneously
    const [response1, response2] = await Promise.all([
      request(app).post(`/api/shows/${testShowId}/book`).send({
        userId: testUserId1,
        seats: [1],
      }),
      request(app).post(`/api/shows/${testShowId}/book`).send({
        userId: testUserId2,
        seats: [1],
      }),
    ]);

    // One should succeed, one should fail with 409
    const successCount = [response1, response2].filter(
      (r) => r.status === 201
    ).length;
    const conflictCount = [response1, response2].filter(
      (r) => r.status === 409
    ).length;

    expect(successCount).toBe(1);
    expect(conflictCount).toBe(1);
  });
});

