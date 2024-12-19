import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import WeeklyPlan from '../models/WeeklyPlan';

// Define a type for the request body
interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

// Register a new user
export const registerUser: RequestHandler<{}, {}, RegisterRequestBody> = async (req, res): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      res.status(500).json({ error: 'JWT_SECRET is not defined' });
      return;
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Initialize WeeklyPlan for the user
    const activities = Array.from({ length: 7 }, (_, index) => ({
      day: index, // 0-6 for Sunday-Saturday
      activities: [] // Empty array for activities
    }));

    const weeklyPlan = new WeeklyPlan({
      user: user._id, // Link the weekly plan to the user
      activities
    });

    await weeklyPlan.save();

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      weeklyPlan
    });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

// Log in an existing user
export const loginUser: RequestHandler<{}, {}, LoginRequestBody> = async (req, res): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};
