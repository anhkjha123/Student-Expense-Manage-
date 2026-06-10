export interface User {
  id: string;
  email: string;
  name: string;
  school: string;
  monthlyIncome: number; // Thu nhập hằng tháng (được chu cấp hoặc làm thêm)
  savingGoal: number;    // Mục tiêu tiết kiệm hằng tháng
  joinedDate: string;
  age?: number;
  avatar?: string;
  phone?: string;
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
  isRecurring?: boolean; // Chi tiêu định kỳ (nếu có)
  receiptImage?: string; // Thumbnail/base64 ảnh hóa đơn gắn với giao dịch (AC6)
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
  currentAmount: number; // Updated via API based on wallet balance or manual input
  deadline: string;
  status: 'On Track' | 'At Risk' | 'Completed';
  categoryId?: string;
}

export interface Income {
  id: string;
  userId: string;
  amount: number;
  source: 'SCHOLARSHIP' | 'PART_TIME' | 'FAMILY' | 'OTHER';
  date: string;
  note?: string;
}

export interface RecurringExpense {
  id: string;
  userId: string;
  amount: number;
  categoryId: string;
  title: string;
  cycle: 'MONTHLY' | 'WEEKLY';
  startDate: string;
  note?: string;
  repeatOn?: string;
  isNecessary?: boolean;
}

export interface Group {
  id: string;
  name: string;
  creatorId: string;
  createdAt: string;
  inviteCode: string;
  inviteExpiresAt: string;
  inviteRevoked?: boolean;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId?: string;
  email: string;
  name: string;
  joinedAt: string;
}

export interface GroupExpenseSplit {
  userId: string;
  email: string;
  amount: number;
}

export interface GroupExpense {
  id: string;
  groupId: string;
  paidBy: string;
  paidByName: string;
  amount: number;
  description: string;
  date: string;
  splitType: 'EQUAL' | 'CUSTOM';
  splits: GroupExpenseSplit[];
}

export interface GroupSettlement {
  id: string;
  groupId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  date: string;
  isPaid: boolean;
}

