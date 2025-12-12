import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingApi, Booking } from '../api/client';
import './BookingConfirmation.css';

export const BookingConfirmation: React.FC = () => {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
      // Poll for status updates if pending
      const interval = setInterval(() => {
        if (booking?.status === 'PENDING') {
          loadBooking();
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [bookingId, booking?.status]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.get(bookingId!);
      setBooking(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!bookingId) return;

    try {
      setProcessing(true);
      setError(null);
      await bookingApi.confirm(bookingId);
      await loadBooking();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to confirm booking');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!bookingId) return;

    try {
      setProcessing(true);
      setError(null);
      await bookingApi.cancel(bookingId);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading booking...</div>;
  }

  if (error && !booking) {
    return (
      <div className="error-container">
        <div className="error">Error: {error}</div>
        <button className="btn-secondary" onClick={() => navigate('/')}>
          Back to Shows
        </button>
      </div>
    );
  }

  if (!booking) {
    return <div className="error">Booking not found</div>;
  }

  const seats = booking.seats as number[];
  const isPending = booking.status === 'PENDING';
  const isConfirmed = booking.status === 'CONFIRMED';
  const isFailed = booking.status === 'FAILED';

  return (
    <div className="booking-confirmation">
      <h1>Booking {booking.status}</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="booking-details">
        <div className="detail-section">
          <h2>Show Information</h2>
          <p>
            <strong>Title:</strong> {booking.show?.title || 'N/A'}
          </p>
          <p>
            <strong>Start Time:</strong>{' '}
            {booking.show?.startTime
              ? new Date(booking.show.startTime).toLocaleString()
              : 'N/A'}
          </p>
        </div>

        <div className="detail-section">
          <h2>Booking Details</h2>
          <p>
            <strong>Booking ID:</strong> {booking.id}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`status status-${booking.status.toLowerCase()}`}>
              {booking.status}
            </span>
          </p>
          <p>
            <strong>Seats:</strong> {seats.sort((a, b) => a - b).join(', ')}
          </p>
          <p>
            <strong>Created:</strong>{' '}
            {new Date(booking.createdAt).toLocaleString()}
          </p>
        </div>

        {isPending && (
          <div className="pending-warning">
            ⏰ Your booking will expire in 2 minutes if not confirmed.
          </div>
        )}

        {isConfirmed && (
          <div className="success-message">
            ✅ Your booking has been confirmed!
          </div>
        )}

        {isFailed && (
          <div className="error-message">
            ❌ This booking has been cancelled or expired.
          </div>
        )}
      </div>

      <div className="booking-actions">
        {isPending && (
          <>
            <button
              className="btn-confirm"
              onClick={handleConfirm}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Confirm Booking'}
            </button>
            <button
              className="btn-cancel"
              onClick={handleCancel}
              disabled={processing}
            >
              Cancel
            </button>
          </>
        )}
        <button className="btn-secondary" onClick={() => navigate('/')}>
          Back to Shows
        </button>
      </div>
    </div>
  );
};

