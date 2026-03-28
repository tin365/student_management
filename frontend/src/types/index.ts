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

export interface Task {
  _id?: string;
  goal?: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed';
  dueDate?: Date | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  _id?: string;
  title: string;
  category: 'academic' | 'health' | 'skill' | string;
  deadline?: Date | string;
  priority: 'high' | 'medium' | 'low';
  description?: string;
  progress: number;
  status?: 'active' | 'completed';
  completedAt?: Date | string | null;
  tasks?: Task[];
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
