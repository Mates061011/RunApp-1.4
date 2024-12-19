import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const redirectUri = 'http://localhost:5173/callback';

const StravaCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(location.search).get('code');

    // Retrieve clientId and clientSecret from localStorage
    const clientId = localStorage.getItem('strava_client_id');
    const clientSecret = localStorage.getItem('strava_client_secret');

    console.log('Received code:', code);

    if (code && clientId && clientSecret) {
      axios.post('https://www.strava.com/oauth/token', {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      })
      .then((response) => {
        const { access_token } = response.data;
        console.log('Access token received:', access_token);
        localStorage.setItem('strava_access_token', access_token);
        navigate('/stats');
      })
      .catch((error) => {
        console.error('Error fetching token from Strava:', error);
        if (error.response) {
          console.log('Response data:', error.response.data);
          console.log('Response status:', error.response.status);
        }
      });
    } else {
      console.error('Authorization code or credentials missing.');
    }
  }, [location.search, navigate]);

  return (
    <div>
      <h1>Zpracování přihlášení...</h1>
    </div>
  );
};

export default StravaCallback;
