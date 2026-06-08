export interface User {
  id: string;
  email: string;
  name: string;
  school: string;
  monthlyIncome: number; // Thu nhập hằng tháng (được chu cấp hoặc làm thêm)
  savingGoal: number;    // Mục tiêu tiết kiệm hằng tháng
  joinedDate: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;         // Tên icon Lucide
  color: string;        // Màu Tailwind class (vd: "bg-red-500")
  textColor: string;    // Màu chữ Tailwind class (vd: "text-red-500")
  description: string;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;       // Số tiền chi tiêu
  categoryId: string;   // Thuộc danh mục nào
  title: string;        // Nội dung chi (vd: "Mua sách giáo trình")
  date: string;         // Định dạng YYYY-MM-DD
  note?: string;        // Ghi chú thêm
  isNecessary: boolean; // Khoản chi bắt buộc (Cần thiết vs Mong muốn)
}

export interface Budget {
  categoryId: string;   // Thuộc danh mục nào (hoặc "all" cho tổng ngân sách)
  amount: number;       // Hạn mức ngân sách đề ra
}

export interface Notification {
  id: string;
  userId: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface DashboardStats {
  totalSpent: number;
  remainingBudget: number;
  spentNecessary: number;
  spentWants: number;
  necessaryPercent: number;
  savingForecast: number;
  budgetWarningActive: boolean;
}

export interface SavingGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'on_track' | 'at_risk' | 'completed';
}

export interface Income {
  id: string;
  userId: string;
  amount: number;
  source: 'scholarship' | 'part_time' | 'family' | 'other';
  date: string;
  note?: string;
}

export interface RecurringExpense {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  title: string;
  cycle: 'monthly' | 'weekly';
  startDate: string;
  nextDate: string;
  isActive: boolean;
}

export interface SpendingInsight {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'success';
  categoryId?: string;
}
