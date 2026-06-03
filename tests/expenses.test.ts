import { describe, it, expect } from 'vitest';
import { User, Expense, Category, Budget } from '../src/types';

// Các hàm tiện ích kiểm thử mô phỏng từ logic nghiệp vụ của Dashboard.tsx và App.tsx
function calculateBudgetStats(user: User, expenses: Expense[]) {
  const currentMonthStr = '2026-06';
  const currentMonthExpenses = expenses.filter(exp => exp.date.startsWith(currentMonthStr));

  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = user.monthlyIncome;
  const savingGoal = user.savingGoal;
  const availableToSpend = totalIncome - savingGoal;
  const remainingBudget = availableToSpend - totalSpentThisMonth;

  const spentNecessary = currentMonthExpenses.filter(e => e.isNecessary).reduce((sum, item) => sum + item.amount, 0);
  const spentWants = currentMonthExpenses.filter(e => !e.isNecessary).reduce((sum, item) => sum + item.amount, 0);

  // Tính điểm đánh giá trạng thái ví
  const currentDay = 1;
  const daysInMonth = 30;
  
  const rentSpent = currentMonthExpenses.filter(e => e.categoryId === 'rent').reduce((sum, item) => sum + item.amount, 0);
  const variableBudget = availableToSpend - rentSpent;
  const variableSpent = totalSpentThisMonth - rentSpent;
  
  const dailySafeAllowance = variableBudget / daysInMonth; 
  const safeSpentUpToNow = dailySafeAllowance * currentDay;

  let walletStatus: 'safe' | 'warning' | 'danger' = 'safe';
  
  if (remainingBudget < 0) {
    walletStatus = 'danger';
  } else if (variableSpent > safeSpentUpToNow * 1.5) {
    walletStatus = 'danger';
  } else if (variableSpent > safeSpentUpToNow) {
    walletStatus = 'warning';
  } else {
    walletStatus = 'safe';
  }

  return {
    totalSpentThisMonth,
    availableToSpend,
    remainingBudget,
    spentNecessary,
    spentWants,
    walletStatus
  };
}

describe('Student Expense Manager - Financial Core Engine Logic', () => {
  const mockUser: User = {
    id: 'test_user_01',
    email: 'test@hust.edu.vn',
    name: 'Sinh Viên Kiểm Thử',
    school: 'Đồng Nai University',
    monthlyIncome: 5000000, // 5 triệu VND chu cấp hằng tháng
    savingGoal: 1000000,    // Mục tiêu tích lũy 1 triệu hằng tháng
    joinedDate: '2026-06-01'
  };

  it('tính toán số tiền khả dụng chính xác từ thu nhập và mục tiêu tiết kiệm', () => {
    const expenses: Expense[] = [];
    const stats = calculateBudgetStats(mockUser, expenses);
    
    // khả dụng = thu nhập (5tr) - tiết kiệm (1tr) = 4 triệu
    expect(stats.availableToSpend).toBe(4000000);
    expect(stats.remainingBudget).toBe(4000000);
    expect(stats.totalSpentThisMonth).toBe(0);
  });

  it('phân nhóm chính xác chi tiêu Cần thiết (Needs) và Mong muốn (Wants)', () => {
    const expenses: Expense[] = [
      {
        id: 'exp_1',
        userId: 'test_user_01',
        amount: 1500000,
        categoryId: 'rent',
        title: 'Tiền phòng trọ',
        date: '2026-06-01',
        isNecessary: true
      },
      {
        id: 'exp_2',
        userId: 'test_user_01',
        amount: 80000,
        categoryId: 'food',
        title: 'Ăn cà phê sáng',
        date: '2026-06-01',
        isNecessary: false
      }
    ];

    const stats = calculateBudgetStats(mockUser, expenses);
    
    expect(stats.spentNecessary).toBe(1500000);
    expect(stats.spentWants).toBe(80000);
    expect(stats.totalSpentThisMonth).toBe(1580000);
    expect(stats.remainingBudget).toBe(4000000 - 1580000); // 2,420,000 VND
  });

  it('phát hiện đúng trạng thái ví ĐỨT XÍCH (Danger) khi chi dùng lạm phát vượt thu nhập khả dụng', () => {
    const highExpenses: Expense[] = [
      {
        id: 'exp_1',
        userId: 'test_user_01',
        amount: 3500000,
        categoryId: 'rent',
        title: 'Tiền phòng trọ siêu sang',
        date: '2026-06-01',
        isNecessary: true
      },
      {
        id: 'exp_2',
        userId: 'test_user_01',
        amount: 1000000,
        categoryId: 'entertainment',
        title: 'Đi đu idol',
        date: '2026-06-01',
        isNecessary: false
      }
    ];

    // Tổng chi: 4.5tr. Khả dụng: 4tr. Bị âm ví.
    const stats = calculateBudgetStats(mockUser, highExpenses);
    
    expect(stats.remainingBudget).toBe(-500000);
    expect(stats.walletStatus).toBe('danger');
  });

  it('bảo toàn tính chính xác khi có giao dịch ở tháng khác', () => {
    const mixedExpenses: Expense[] = [
      {
        id: 'exp_prev',
        userId: 'test_user_01',
        amount: 3000000,
        categoryId: 'rent',
        title: 'Trọ tháng trước',
        date: '2026-05-30', // Tháng 5
        isNecessary: true
      },
      {
        id: 'exp_curr',
        userId: 'test_user_01',
        amount: 200000,
        categoryId: 'food',
        title: 'Ăn trưa',
        date: '2026-06-01', // Tháng 6
        isNecessary: true
      }
    ];

    const stats = calculateBudgetStats(mockUser, mixedExpenses);
    
    // Giao dịch tháng 5 không được tính vào tổng chi tiêu tháng 6
    expect(stats.totalSpentThisMonth).toBe(200000);
    expect(stats.remainingBudget).toBe(3800000);
  });
});
