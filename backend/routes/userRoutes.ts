import { Router, Request, Response, RequestHandler, NextFunction } from 'express';
import User from '../models/User';
import { IUser } from '../models/User';
import { auth, AuthRequest } from '../middleware/auth'; // Import the JWT auth middleware

const router = Router();

interface StravaLoginRequestBody {
  stravaClientId: string;
  stravaClientSecret: string;
}

interface StravaLoginResponseBody {
  message: string;
  user?: IUser; // Change from Document to your IUser interface
}

// Protected GET request to fetch the logged-in user's profile
router.get('/me', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user).select('-password'); // Do not include the password in the response

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return; // Ensure to return here
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

const stravaLoginHandler: RequestHandler<
  { userId: string }, // Route parameters
  StravaLoginResponseBody, // Standard Response with custom body
  StravaLoginRequestBody // Request body type
> = async (req, res, next): Promise<void> => { // Added 'next'
  const { userId } = req.params;
  const { stravaClientId, stravaClientSecret } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update stravaLogin with provided values
    user.stravaLogin = { stravaClientId, stravaClientSecret };
    await user.save();

    res.status(200).json({ message: 'Strava login updated successfully', user });
  } catch (err) {
    next(err); // Pass any error to the next middleware
  }
};


// Apply auth middleware to protect the PUT request
router.put('/strava-login/:userId', auth, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;

  // Ensure the logged-in user can only update their own data
  if (req.user !== userId) {
    res.status(403).json({ message: 'Access denied. You can only update your own data.' });
    return;
  }

  // Call the Strava longin handler with req, res, and next
  await stravaLoginHandler(req, res, next); // Pass the `next` function here
});



// Protected PUT request to update general user data
router.put('/me', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email } = req.body; // Example fields that the user might want to update

  try {
    const user = await User.findById(req.user);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update user data with the new values from the request body
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.status(200).json({ message: 'User profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

export default router;
