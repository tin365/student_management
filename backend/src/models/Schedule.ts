import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISchedule extends Document {
  userId: Types.ObjectId;
  title: string;
  startTime: Date;
  endTime: Date;
}

const ScheduleSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);
