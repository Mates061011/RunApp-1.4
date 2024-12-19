import express, { Request, Response } from 'express';
import Activity from '../models/Activity'; // Import your Activity model
import { auth, AuthRequest } from '../middleware/auth'; // Import the auth middleware

const router = express.Router();

// POST request to create an activity
router.post('/create', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, date, description, range, time, tempo } = req.body;

  // Validate input
  if (!name || !date || !description || !range || !time || !tempo) {
    res.status(400).json({ message: 'All fields are required.' });
    return; // Return here to end the function
  }

  try {
    // Create a new activity
    const activity = new Activity({
      user: req.user, // Use the authenticated user's ID
      name,
      date,
      description,
      range,
      time,
      tempo,
    });

    // Save the activity to the database
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/:userId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.userId;

  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized access. No user information found.' });
    return;
  }

  try {
    if (req.user.toString() !== userId) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    const activities = await Activity.find({ user: userId });
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});



export default router;
