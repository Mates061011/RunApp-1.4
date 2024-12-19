import React, { useEffect, useState } from 'react';

interface StravaLoginProps {
  clientId: string;
}

const redirectUri = 'http://localhost:5173/callback'; // Replace with your actual redirect URI
const scope = 'read,activity:read';

const StravaLogin: React.FC<StravaLoginProps> = ({ clientId }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLogin = () => {
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&approval_prompt=auto`;
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('strava_access_token');
    if (accessToken) {
      setIsLoggedIn(true);
      return; // Already logged in, no need to fetch token again
    }

    // Check for the OAuth 'code' in the URL after redirect
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    if (authCode) {
      // Exchange authorization code for an access token
      fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: localStorage.getItem('strava_client_secret'),
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri, // Ensure this matches exactly
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to exchange auth code for access token');
          }
          return response.json();
        })
        .then((data) => {
          console.log("funguje")
          console.log('Strava Access Token:', data.access_token); // Log the token for debugging
          localStorage.setItem('strava_access_token', data.access_token); // Store the token
          setIsLoggedIn(true);
          window.history.replaceState({}, document.title, '/'); // Clear URL params
        })
        .catch((error) => console.error('Error fetching Strava access token:', error));
    }
  }, [clientId]);

  return (
    <section>
      {!isLoggedIn ? (
        <div>
          <button onClick={handleLogin}>Přihlásit se Strava</button>
        </div>
      ) : (
        <p>You are already logged in to Strava.</p>
      )}
    </section>
  );
};

export default StravaLogin;
