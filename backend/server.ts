import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes'; // Ensure this points to your user routes
import activityRoutes from './routes/activityRoutes'; // Ensure this points to your activity routes
import { registerUser, loginUser } from './controllers/authController';
import weeklyPlanRoutes from './routes/weeklyPlanRoutes';
dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// Auth routes
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// User routes
app.use('/api/users', userRoutes); 


// Activity routes
app.use('/api/activity', activityRoutes);

app.use('/api/week', weeklyPlanRoutes)

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
