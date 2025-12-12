import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { showApi, ShowSeats } from '../api/client';
import './SeatSelection.css';

export const SeatSelection: React.FC = () => {
  const { id: showId } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const [seats, setSeats] = useState<ShowSeats | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showId) {
      loadSeats();
    }
  }, [showId]);

  const loadSeats = async () => {
    try {
      setLoading(true);
      const response = await showApi.getSeats(showId!);
      setSeats(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load seats');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatNumber: number, status: string) => {
    if (status !== 'AVAILABLE') return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((s) => s !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  const handleBook = async () => {
    if (!user || selectedSeats.length === 0 || !showId) return;

    try {
      setBooking(true);
      setError(null);
      const response = await showApi.createBooking(showId, user.id, selectedSeats);
      navigate(`/bookings/${response.data.bookingId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create booking');
      // Reload seats to reflect current availability
      loadSeats();
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading seats...</div>;
  }

  if (error && !seats) {
    return <div className="error">Error: {error}</div>;
  }

  if (!seats) {
    return <div className="error">Show not found</div>;
  }

  // Calculate grid dimensions (assuming 10 seats per row)
  const seatsPerRow = 10;
  const rows = Math.ceil(seats.seats.length / seatsPerRow);

  return (
    <div className="seat-selection">
      <h1>{seats.showTitle}</h1>
      <div className="seat-legend">
        <div className="legend-item">
          <div className="seat-available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="seat-selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="seat-held"></div>
          <span>Held</span>
        </div>
        <div className="legend-item">
          <div className="seat-booked"></div>
          <span>Booked</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stage">STAGE</div>
      <div className="seats-grid">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            {seats.seats
              .slice(rowIndex * seatsPerRow, (rowIndex + 1) * seatsPerRow)
              .map((seat) => {
                const isSelected = selectedSeats.includes(seat.seatNumber);
                return (
                  <button
                    key={seat.seatNumber}
                    className={`seat seat-${seat.status.toLowerCase()} ${
                      isSelected ? 'seat-selected' : ''
                    }`}
                    onClick={() => toggleSeat(seat.seatNumber, seat.status)}
                    disabled={seat.status !== 'AVAILABLE'}
                    title={`Seat ${seat.seatNumber} - ${seat.status}`}
                  >
                    {seat.seatNumber}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      <div className="booking-summary">
        <div className="selected-seats">
          <strong>Selected Seats:</strong>{' '}
          {selectedSeats.length > 0
            ? selectedSeats.sort((a, b) => a - b).join(', ')
            : 'None'}
        </div>
        <button
          className="btn-book"
          onClick={handleBook}
          disabled={selectedSeats.length === 0 || booking}
        >
          {booking ? 'Booking...' : `Book ${selectedSeats.length} Seat(s)`}
        </button>
      </div>
    </div>
  );
};

