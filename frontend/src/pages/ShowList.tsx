import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showApi, Show } from '../api/client';
import './ShowList.css';

export const ShowList: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    try {
      setLoading(true);
      const response = await showApi.getAll();
      setShows(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load shows');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShow = (showId: string) => {
    navigate(`/shows/${showId}/seats`);
  };

  if (loading) {
    return <div className="loading">Loading shows...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="show-list">
      <h1>Available Shows</h1>
      {shows.length === 0 ? (
        <div className="empty-state">No shows available at the moment.</div>
      ) : (
        <div className="shows-grid">
          {shows.map((show) => (
            <div key={show.id} className="show-card" onClick={() => handleSelectShow(show.id)}>
              <h2>{show.title}</h2>
              <p className="show-time">
                {new Date(show.startTime).toLocaleString()}
              </p>
              <p className="show-seats">{show.totalSeats} seats available</p>
              <button className="btn-primary">Select Seats</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

