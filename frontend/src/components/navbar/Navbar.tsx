import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';
const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear entire local storage
    navigate('/login'); // Redirect to login page
  };
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return (
    <nav style={{ padding: '10px', background: '#f8f9fa' }}>
      <ul style={{ listStyle: 'none', display: 'flex', gap: '20px' }}>
        <li>
          <Link to="/">Home</Link>
        </li>
        
        {isLoggedIn ? (
          <>
          <li>
            <Link to="/stats">Activities</Link>
          </li>
          <li>
            <Link to="/week">Week</Link>
          </li>
            <li>
              <Link to="/account">Settings</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
