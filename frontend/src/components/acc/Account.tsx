import React, { useState, useEffect } from 'react';
import './account.css';
import StravaLogin from '../StravaLogin';

const MyAccount: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>(''); // Initial state empty
  const [userName, setUserName] = useState<string>(''); // Initial state empty
  const [stravaClientId, setStravaClientId] = useState<string>(''); // Initial state empty
  const [stravaClientSecret, setStravaClientSecret] = useState<string>(''); // Initial state empty

  const [originalUserEmail, setOriginalUserEmail] = useState<string>(''); // State to store original email from API
  const [originalUserName, setOriginalUserName] = useState<string>(''); // State to store original name from API
  const [originalStravaClientId, setOriginalStravaClientId] = useState<string>(''); // Original Strava client ID
  const [originalStravaClientSecret, setOriginalStravaClientSecret] = useState<string>(''); // Original Strava client secret

  const [editMode, setEditMode] = useState<boolean>(false);
  const [stravaEditMode, setStravaEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to fetch user data
  const fetchUserData = async () => {
    const token = localStorage.getItem('JWT_TOKEN'); // Get JWT token from localStorage

    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Add Bearer token
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserName(data.user.name); // Update userName state
      setUserEmail(data.user.email); // Update userEmail state
      setOriginalUserName(data.user.name); // Store original name
      setOriginalUserEmail(data.user.email); // Store original email

      // Check if Strava login data exists and update state
      if (data.user.stravaLogin) {
        setStravaClientId(data.user.stravaLogin.stravaClientId);
        setStravaClientSecret(data.user.stravaLogin.stravaClientSecret);
        setOriginalStravaClientId(data.user.stravaLogin.stravaClientId);
        setOriginalStravaClientSecret(data.user.stravaLogin.stravaClientSecret);
      }

      setLoading(false); // Stop loading
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Save Strava credentials to local storage when they are updated
  useEffect(() => {
    if (stravaClientId) {
      localStorage.setItem('strava_client_id', stravaClientId);
    }
    if (stravaClientSecret) {
      localStorage.setItem('strava_client_secret', stravaClientSecret);
    }
  }, [stravaClientId, stravaClientSecret]); // This effect runs whenever stravaClientId or stravaClientSecret changes

  // Function to handle form submission and update user data (name & email)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('JWT_TOKEN'); // Get JWT token from localStorage

    if (!token) {
      console.error('No token found');
      return;
    }

    const updatedData: { name?: string; email?: string } = {};

    // Compare with original data fetched from the API and send only changed fields
    if (userName !== originalUserName) {
      updatedData.name = userName;
    }
    if (userEmail !== originalUserEmail) {
      updatedData.email = userEmail;
    }

    // If nothing has changed, no need to make a request
    if (Object.keys(updatedData).length === 0) {
      setEditMode(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Add Bearer token
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      const data = await response.json();
      console.log('User updated successfully:', data);

      setEditMode(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // Function to handle Strava data update
  const handleStravaSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('JWT_TOKEN'); // Get JWT token from localStorage
    const userId = localStorage.getItem('userId'); // Get userId from localStorage

    if (!token || !userId) {
      console.error('Token or userId not found');
      return;
    }

    const updatedStravaData: { stravaClientId: string; stravaClientSecret: string } = {
      stravaClientId: stravaClientId !== originalStravaClientId ? stravaClientId : originalStravaClientId,
      stravaClientSecret: stravaClientSecret !== originalStravaClientSecret ? stravaClientSecret : originalStravaClientSecret,
    };

    // If nothing has changed, no need to make a request
    if (Object.keys(updatedStravaData).length === 0) {
      setStravaEditMode(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/strava-login/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Add Bearer token
        },
        body: JSON.stringify(updatedStravaData),
      });

      if (!response.ok) {
        throw new Error('Failed to update Strava login data');
      }

      const data = await response.json();
      console.log('Strava data updated successfully:', data);

      setStravaEditMode(false);
    } catch (error) {
      console.error('Error updating Strava data:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className='settings-wrapper'>
      <h1>My Account</h1>

      {/* Account Settings */}
      <section style={{ marginBottom: '20px' }}>
        <div className="settings-section-header">
          <h2>Account Settings</h2>
          {!editMode ? (
            <button className="small-button" onClick={() => setEditMode(true)}>Edit</button>
          ) : null}
        </div>
        {!editMode ? (
          <div>
            <p><strong>Name:</strong> {userName}</p>
            <p><strong>Email:</strong> {userEmail}</p>
          </div>
        ) : (
          <form onSubmit={handleSaveSettings}>
            <div>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </div>
            <div className="edit-buttons">
              <button className='small-button main-button' type="submit">Save</button>
              <button className="small-button" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </form>
        )}
      </section>

      {/* Strava Login */}
      <section>
        <div className="settings-section-header">
          <h2>Strava Login</h2>
          {!stravaEditMode ? (
            <button className="small-button" onClick={() => setStravaEditMode(true)}>Edit</button>
          ) : null}
        </div>
        {!stravaEditMode ? (
          <div>
            <p><strong>Strava Client ID:</strong> {stravaClientId || 'N/A'}</p>
            <p><strong>Strava Client Secret:</strong> {stravaClientSecret || 'N/A'}</p>
          </div>
        ) : (
          <form onSubmit={handleStravaSave}>
            <div>
              <label htmlFor="stravaClientId">Strava Client ID:</label>
              <input
                type="text"
                id="stravaClientId"
                value={stravaClientId}
                onChange={(e) => setStravaClientId(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="stravaClientSecret">Strava Client Secret:</label>
              <input
                type="text"
                id="stravaClientSecret"
                value={stravaClientSecret}
                onChange={(e) => setStravaClientSecret(e.target.value)}
                required
              />
            </div>
            <div className="edit-buttons">
              <button className='small-button main-button' type="submit">Save</button>
              <button className="small-button" onClick={() => setStravaEditMode(false)}>Cancel</button>
            </div>
          </form>
        )}
      </section>

      <StravaLogin clientId={stravaClientId}/>
    </div>
  );
};

export default MyAccount;
