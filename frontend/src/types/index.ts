export interface Expense {
  _id?: string;
  amount: number;
  currency?: string;
  category: string;
  note?: string;
  date: Date | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpenseInput {
  amount: number;
  currency: 'RM';
  category: string;
  note?: string;
  date: Date | string;
  monthlyBudget?: number;
}

export interface Goal {
  _id?: string;
  title: string;
  progress: number;
  deadline?: Date | string;
  status?: 'active' | 'completed';
  completedAt?: Date | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudySession {
  _id?: string;
  duration: number;
  subject: string;
  date: Date | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppSettings {
  currency: 'RM';
  monthlyBudget: number;
  dailyStudyGoal: number;
  notifications: boolean;
}

export interface Schedule {
  _id?: string;
  title: string;
  startTime: Date | string;
  endTime: Date | string;
  createdAt?: string;
  updatedAt?: string;
}
