import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  amount: number;
  category: string;
  note: string;
  date: Date;
}

const ExpenseSchema: Schema = new Schema({
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  note: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
