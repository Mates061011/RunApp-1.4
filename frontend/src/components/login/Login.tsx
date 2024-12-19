import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

interface AuthFormData {
  name?: string;
  email: string;
  password: string;
}

const AuthForm: React.FC = () => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [formData, setFormData] = useState<AuthFormData>({
    name: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleInputFocus = (name: string) => {
    setFocusedInput(name);
  };

  const handleInputBlur = () => {
    setFocusedInput(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const url = isRegister
      ? 'http://localhost:5000/api/auth/register'
      : 'http://localhost:5000/api/auth/login';

    const payload = isRegister
      ? { name: formData.name, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Something went wrong.');
      } else {
        const data = await response.json();
        setSuccess(isRegister ? 'Registration successful!' : 'Login successful!');

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('JWT_TOKEN', data.token);
        localStorage.setItem('userId', data.user._id);

        navigate('/account');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className='login-wrapper'>
      <h1 className='login-text'>{isRegister ? 'Register' : 'Login'}</h1>
      <div className='login-cont'>
        <div className='circle'></div>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <input
                type="text"
                id="name"
                name="name"
                placeholder={focusedInput === 'name' ? '' : 'name'} // Clear placeholder on focus
                value={formData.name || ''}
                onChange={handleInputChange}
                onFocus={() => handleInputFocus('name')}
                onBlur={handleInputBlur}
                required={isRegister}
              />
            </div>
          )}
          <div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder={focusedInput === 'email' ? '' : 'email'} // Clear placeholder on focus
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => handleInputFocus('email')}
              onBlur={handleInputBlur}
              required
            />
          </div>
          <div>
            <input
              type="password"
              id="password"
              placeholder={focusedInput === 'password' ? '' : 'password'} // Clear placeholder on focus
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => handleInputFocus('password')}
              onBlur={handleInputBlur}
              required
            />
          </div>
          <span className='buttons'>
            <p onClick={() => setIsRegister((prev) => !prev)}>
              {isRegister ? 'I have an account' : 'I dont have an account'}
            </p>
            <div>
              <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
            </div>
          </span>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </div>
    </div>
  );
};

export default AuthForm;
