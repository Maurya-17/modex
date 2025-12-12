import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user } = useUser();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🎭 Modex Tickets
        </Link>
        {user && (
          <div className="navbar-user">
            <span>Welcome, {user.name}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

