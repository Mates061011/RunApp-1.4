import mongoose, { Schema, Document } from 'mongoose';
import { IActivity } from './Activity';

export interface IWeeklyPlan {
  user: string; // User ID
  Mon?: IActivity[] | null; // Array of Activities for Monday or null
  Tue?: IActivity[] | null;
  Wed?: IActivity[] | null;
  Thu?: IActivity[] | null;
  Fri?: IActivity[] | null;
  Sat?: IActivity[] | null;
  Sun?: IActivity[] | null;
}

const WeeklyPlanSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  Mon: { type: [{ type: Schema.Types.Mixed }], default: null },  // Allow null or array of Mixed type
  Tue: { type: [{ type: Schema.Types.Mixed }], default: null },
  Wed: { type: [{ type: Schema.Types.Mixed }], default: null },
  Thu: { type: [{ type: Schema.Types.Mixed }], default: null },
  Fri: { type: [{ type: Schema.Types.Mixed }], default: null },
  Sat: { type: [{ type: Schema.Types.Mixed }], default: null },
  Sun: { type: [{ type: Schema.Types.Mixed }], default: null },
}, { timestamps: true });

export default mongoose.model<IWeeklyPlan & Document>('WeeklyPlan', WeeklyPlanSchema);
