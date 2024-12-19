import mongoose, { Schema, Document } from 'mongoose';

// Interface for Strava login
export interface IStravaLogin {
  stravaClientId?: string;
  stravaClientSecret?: string;
}

// Interface for User document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  stravaLogin?: IStravaLogin; // Use a separate interface for better readability
}

// User schema definition
const UserSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  stravaLogin: {
    stravaClientId: {
      type: String,
      required: false, // This can be optional
    },
    stravaClientSecret: {
      type: String,
      required: false, // This can be optional
    },
  },
}, { timestamps: true });

// Exporting the User model
export default mongoose.model<IUser>('User', UserSchema);
