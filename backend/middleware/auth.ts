import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: string; // or a more complex type depending on your user model
  params: {
    userId: string; // Add userId to params
  };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Get token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if token is provided
  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return; // Ensure that we return here after sending the response
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = (decoded as { userId: string }).userId; // Assuming your token payload contains userId
    next(); // Call the next middleware/route handler
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
    return; // Ensure that we return here after sending the response
  }
};
