import { Router, Request, Response } from 'express';
import { auth, AuthRequest } from '../middleware/auth'; // Import the JWT auth middleware
import WeeklyPlan, { IWeeklyPlan } from '../models/WeeklyPlan'; // Import the WeeklyPlan model and interface

const router = Router();

router.put('/:userId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.userId;
  const { Mon, Tue, Wed, Thu, Fri, Sat, Sun } = req.body; // Expecting activity arrays for each day
  try {
    if (req.user !== userId) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    // Find or create the weekly plan for the user
    let weeklyPlan = await WeeklyPlan.findOne({ user: userId });

    if (!weeklyPlan) {
      // Create a new weekly plan if one doesn't exist
      weeklyPlan = new WeeklyPlan({ user: userId });
    }

    // Handle null, arrays, or single activity values for each day
    weeklyPlan.Mon = Mon === null ? null : (Array.isArray(Mon) ? Mon : Mon ? [Mon] : []);
    weeklyPlan.Tue = Tue === null ? null : (Array.isArray(Tue) ? Tue : Tue ? [Tue] : []);
    weeklyPlan.Wed = Wed === null ? null : (Array.isArray(Wed) ? Wed : Wed ? [Wed] : []);
    weeklyPlan.Thu = Thu === null ? null : (Array.isArray(Thu) ? Thu : Thu ? [Thu] : []);
    weeklyPlan.Fri = Fri === null ? null : (Array.isArray(Fri) ? Fri : Fri ? [Fri] : []);
    weeklyPlan.Sat = Sat === null ? null : (Array.isArray(Sat) ? Sat : Sat ? [Sat] : []);
    weeklyPlan.Sun = Sun === null ? null : (Array.isArray(Sun) ? Sun : Sun ? [Sun] : []);

    // Save the updated weekly plan
    await weeklyPlan.save();

    res.status(200).json(weeklyPlan);
  } catch (error) {
    const typedError = error as Error;
    console.error('Error in PUT request:', typedError.message);
    res.status(500).json({ message: 'Server error', error: typedError.message });
  }
});


// GET request to retrieve the weekly plan for a user
router.get('/:userId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.userId;

  try {
    // Check if the authenticated user matches the userId in the params
    if (req.user !== userId) {
      res.status(403).json({ message: 'Access denied.' });
      return; // Return here to end the function
    }

    // Find the weekly plan for the user
    const weeklyPlan: IWeeklyPlan | null = await WeeklyPlan.findOne({ user: userId });

    if (!weeklyPlan) {
      res.status(404).json({ message: 'Weekly plan not found.' });
      return;
    }

    res.status(200).json(weeklyPlan);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// DELETE request to remove the weekly plan for a user
router.delete('/:userId', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.params.userId;

  try {
    // Check if the authenticated user matches the userId in the params
    if (req.user !== userId) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    // Find and delete the weekly plan for the user
    const weeklyPlan = await WeeklyPlan.findOneAndDelete({ user: userId });

    if (!weeklyPlan) {
      res.status(404).json({ message: 'Weekly plan not found.' });
      return;
    }

    res.status(200).json({ message: 'Weekly plan deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
