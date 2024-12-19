import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IActivity extends Document {
  user: IUser['_id'];  // Reference to the user
  name: string;
  date: Date;
  description: string;
  range: number;       // Distance, e.g., kilometers
  time: string;        // Time for the activity, e.g., "30 minutes"
  tempo: string;       // Speed or tempo, e.g., "4:30 min/km"
}

const ActivitySchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  range: { type: Number, required: true },
  time: { type: String, required: true },
  tempo: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IActivity>('Activity', ActivitySchema);
