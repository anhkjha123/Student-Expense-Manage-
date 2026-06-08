import fs from 'fs';
import path from 'path';
import { User, Expense, Budget, Notification, SavingGoal, Income, RecurringExpense } from '../types';

export interface DBUser extends User {
  passwordHash: string;
}

export interface DBBudget extends Budget {
  userId: string;
}

export interface Schema {
  users: DBUser[];
  expenses: Expense[];
  budgets: DBBudget[];
  notifications: Notification[];
  savingGoals: SavingGoal[];
  incomes: Income[];
  recurringExpenses: RecurringExpense[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Khởi chạy thư mục và cơ sở dữ liệu mẫu nếu chưa tồn tại
function initDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialSchema: Schema = {
      users: [
        {
          id: 'user_01',
          email: 'sinhvien@hust.edu.vn',
          name: 'Nguyễn Minh Đức',
          school: 'Đại Học Bách Khoa Hà Nội',
          monthlyIncome: 4500000,
          savingGoal: 500000,
          joinedDate: '2026-02-15',
          passwordHash: 'sinhvien_hashed_pw' // Demo password
        }
      ],
      expenses: [
        // Một số khoản chi của tháng 5/2026 và tháng 6/2026 cho người dùng mẫu
        {
          id: 'exp_01',
          userId: 'user_01',
          amount: 1500000,
          categoryId: 'rent',
          title: 'Tiền phòng trọ tháng 5 + điện nước',
          date: '2026-05-02',
          note: 'Đóng đầu tháng cho chủ nhà',
          isNecessary: true
        },
        {
          id: 'exp_02',
          userId: 'user_01',
          amount: 120000,
          categoryId: 'study',
          title: 'Sách giải tích 2 và giáo trình',
          date: '2026-05-04',
          note: 'Mua ở cổng trường',
          isNecessary: true
        },
        {
          id: 'exp_03',
          userId: 'user_01',
          amount: 45000,
          categoryId: 'food',
          title: 'Ăn cơm trưa Bách Khoa',
          date: '2026-05-05',
          note: 'Suất cơm sườn 45k',
          isNecessary: true
        },
        {
          id: 'exp_04',
          userId: 'user_01',
          amount: 60000,
          categoryId: 'entertainment',
          title: 'Trà sữa KOI Thé với bạn',
          date: '2026-05-06',
          note: 'Thèm quá mua uống giải sầu',
          isNecessary: false
        },
        {
          id: 'exp_05',
          userId: 'user_01',
          amount: 90000,
          categoryId: 'transport',
          title: 'Đổ xăng xe máy Wave',
          date: '2026-05-08',
          note: 'Xăng đắt quá đổ đầy bình',
          isNecessary: true
        },
        {
          id: 'exp_06',
          userId: 'user_01',
          amount: 350000,
          categoryId: 'shopping',
          title: 'Mua giày sneaker giá rẻ',
          date: '2026-05-10',
          note: 'Mua sale trên Shopee',
          isNecessary: false
        },
        {
          id: 'exp_07',
          userId: 'user_01',
          amount: 45000,
          categoryId: 'food',
          title: 'Cơm tối bình dân',
          date: '2026-05-11',
          isNecessary: true
        },
        {
          id: 'exp_08',
          userId: 'user_01',
          amount: 250000,
          categoryId: 'study',
          title: 'Tiền quỹ lớp kì II',
          date: '2026-05-12',
          note: 'Đóng cho lớp trưởng',
          isNecessary: true
        },
        {
          id: 'exp_09',
          userId: 'user_01',
          amount: 85000,
          categoryId: 'food',
          title: 'Ăn lẩu ly ăn vặt vỉa hè',
          date: '2026-05-15',
          note: 'Ăn chung với mấy bạn cùng phòng ký túc xá cũ',
          isNecessary: false
        },
        {
          id: 'exp_10',
          userId: 'user_01',
          amount: 110000,
          categoryId: 'shopping',
          title: 'Kem đánh răng, dầu gội, sữa tắm',
          date: '2026-05-16',
          note: 'Mua ở tạp hóa đầu ngõ',
          isNecessary: true
        },
        {
          id: 'exp_11',
          userId: 'user_01',
          amount: 45000,
          categoryId: 'food',
          title: 'Bát phở bò ăn sáng',
          date: '2026-05-18',
          isNecessary: true
        },
        {
          id: 'exp_12',
          userId: 'user_01',
          amount: 150000,
          categoryId: 'entertainment',
          title: 'Vé xem phim Doctor Strange mới',
          date: '2026-05-20',
          note: 'CGV Vincom Bà Triệu',
          isNecessary: false
        },
        {
          id: 'exp_13',
          userId: 'user_01',
          amount: 90000,
          categoryId: 'transport',
          title: 'Đổ xăng lần 2',
          date: '2026-05-22',
          isNecessary: true
        },
        {
          id: 'exp_14',
          userId: 'user_01',
          amount: 420000,
          categoryId: 'food',
          title: 'Ăn buffet lẩu sinh nhật bạn',
          date: '2026-05-24',
          note: 'Buổi tối vui vẻ nhưng hơi xót ví',
          isNecessary: false
        },
        {
          id: 'exp_15',
          userId: 'user_01',
          amount: 250000,
          categoryId: 'other',
          title: 'Thuốc men cảm cúm',
          date: '2026-05-26',
          note: 'Bị sốt mua thuốc tây uống',
          isNecessary: true
        },
        {
          id: 'exp_16',
          userId: 'user_01',
          amount: 50000,
          categoryId: 'food',
          title: 'Bánh mỳ và cafe sáng',
          date: '2026-05-28',
          isNecessary: true
        },
        {
          id: 'exp_17',
          userId: 'user_01',
          amount: 200000,
          categoryId: 'shopping',
          title: 'Mua áo thun mùa hè',
          date: '2026-05-29',
          note: 'Mua chợ đêm',
          isNecessary: false
        },
        {
          id: 'exp_20',
          userId: 'user_01',
          amount: 1600000,
          categoryId: 'rent',
          title: 'Tiền phòng trọ + Internet tháng 6',
          date: '2026-06-01',
          note: 'Đã đóng buổi sáng',
          isNecessary: true
        },
        {
          id: 'exp_21',
          userId: 'user_01',
          amount: 55000,
          categoryId: 'food',
          title: 'Bún chả trưa đầu tháng',
          date: '2026-06-01',
          isNecessary: true
        }
      ],
      budgets: [
        { userId: 'user_01', categoryId: 'rent', amount: 1600000 },
        { userId: 'user_01', categoryId: 'food', amount: 1200000 },
        { userId: 'user_01', categoryId: 'study', amount: 400000 },
        { userId: 'user_01', categoryId: 'transport', amount: 300000 },
        { userId: 'user_01', categoryId: 'entertainment', amount: 300000 },
        { userId: 'user_01', categoryId: 'shopping', amount: 400000 },
        { userId: 'user_01', categoryId: 'other', amount: 200000 }
      ],
      notifications: [
        {
          id: 'not_01',
          userId: 'user_01',
          type: 'success',
          title: 'Chào mừng bạn đến với Student Expense Manager!',
          message: 'Hãy bắt đầu phân chia các khoản ngân sách chi tiêu để không còn cháy túi cuối tháng nhé.',
          date: '2026-06-01 08:00:00',
          read: false
        },
        {
          id: 'not_02',
          userId: 'user_01',
          type: 'warning',
          title: 'Hạn mức Nhà trọ tháng 6 đã đạt tối đa!',
          message: 'Khoản chi "Tiền phòng trọ + Internet" 1,600,000đ đã dùng hết 100% ngân sách danh mục nhà trọ tháng này.',
          date: '2026-06-01 09:15:00',
          read: false
        }
      ],
      savingGoals: [],
      incomes: [],
      recurringExpenses: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialSchema, null, 2), 'utf-8');
  }
}

export class Database {
  constructor() {
    initDB();
  }

  private read(): Schema {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data) as Schema;
    } catch (e) {
      console.error('Lỗi khi đọc file database:', e);
      return { users: [], expenses: [], budgets: [], notifications: [], savingGoals: [], incomes: [], recurringExpenses: [] };
    }
  }

  private write(schema: Schema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), 'utf-8');
    } catch (e) {
      console.error('Lỗi khi ghi file database:', e);
    }
  }

  // --- USERS ---
  public getUsers(): DBUser[] {
    return this.read().users;
  }

  public saveUser(user: DBUser): void {
    const schema = this.read();
    const idx = schema.users.findIndex(u => u.id === user.id || u.email === user.email);
    if (idx >= 0) {
      schema.users[idx] = user;
    } else {
      schema.users.push(user);
    }
    this.write(schema);
  }

  // --- EXPENSES ---
  public getExpenses(): Expense[] {
    return this.read().expenses;
  }

  public saveExpense(expense: Expense): void {
    const schema = this.read();
    const idx = schema.expenses.findIndex(e => e.id === expense.id);
    if (idx >= 0) {
      schema.expenses[idx] = expense;
    } else {
      schema.expenses.push(expense);
    }
    this.write(schema);
  }

  public deleteExpense(expenseId: string): boolean {
    const schema = this.read();
    const filter = schema.expenses.filter(e => e.id !== expenseId);
    if (filter.length === schema.expenses.length) return false;
    schema.expenses = filter;
    this.write(schema);
    return true;
  }

  // --- BUDGETS ---
  public getBudgets(): DBBudget[] {
    return this.read().budgets;
  }

  public saveBudgetsForUser(userId: string, budgets: Budget[]): void {
    const schema = this.read();
    // Xóa các hạn mức cũ của user
    schema.budgets = schema.budgets.filter(b => b.userId !== userId);
    // Thêm hạn mức mới
    budgets.forEach(b => {
      schema.budgets.push({
        userId,
        categoryId: b.categoryId,
        amount: b.amount
      });
    });
    this.write(schema);
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): Notification[] {
    return this.read().notifications;
  }

  public saveNotification(notif: Notification): void {
    const schema = this.read();
    const idx = schema.notifications.findIndex(n => n.id === notif.id);
    if (idx >= 0) {
      schema.notifications[idx] = notif;
    } else {
      schema.notifications.unshift(notif);
    }
    this.write(schema);
  }

  public saveAllNotifications(notifs: Notification[]): void {
    const schema = this.read();
    schema.notifications = notifs;
    this.write(schema);
  }

  // --- SAVING GOALS ---
  public getSavingGoals(): SavingGoal[] {
    return this.read().savingGoals || [];
  }
  public saveSavingGoal(goal: SavingGoal): void {
    const schema = this.read();
    if (!schema.savingGoals) schema.savingGoals = [];
    const idx = schema.savingGoals.findIndex(g => g.id === goal.id);
    if (idx >= 0) schema.savingGoals[idx] = goal;
    else schema.savingGoals.push(goal);
    this.write(schema);
  }
  public deleteSavingGoal(id: string): boolean {
    const schema = this.read();
    if (!schema.savingGoals) return false;
    const len = schema.savingGoals.length;
    schema.savingGoals = schema.savingGoals.filter(g => g.id !== id);
    if (schema.savingGoals.length !== len) {
      this.write(schema);
      return true;
    }
    return false;
  }

  // --- INCOMES ---
  public getIncomes(): Income[] {
    return this.read().incomes || [];
  }
  public saveIncome(income: Income): void {
    const schema = this.read();
    if (!schema.incomes) schema.incomes = [];
    const idx = schema.incomes.findIndex(i => i.id === income.id);
    if (idx >= 0) schema.incomes[idx] = income;
    else schema.incomes.push(income);
    this.write(schema);
  }
  public deleteIncome(id: string): boolean {
    const schema = this.read();
    if (!schema.incomes) return false;
    const len = schema.incomes.length;
    schema.incomes = schema.incomes.filter(i => i.id !== id);
    if (schema.incomes.length !== len) {
      this.write(schema);
      return true;
    }
    return false;
  }

  // --- RECURRING EXPENSES ---
  public getRecurringExpenses(): RecurringExpense[] {
    return this.read().recurringExpenses || [];
  }
  public saveRecurringExpense(recurring: RecurringExpense): void {
    const schema = this.read();
    if (!schema.recurringExpenses) schema.recurringExpenses = [];
    const idx = schema.recurringExpenses.findIndex(r => r.id === recurring.id);
    if (idx >= 0) schema.recurringExpenses[idx] = recurring;
    else schema.recurringExpenses.push(recurring);
    this.write(schema);
  }
  public deleteRecurringExpense(id: string): boolean {
    const schema = this.read();
    if (!schema.recurringExpenses) return false;
    const len = schema.recurringExpenses.length;
    schema.recurringExpenses = schema.recurringExpenses.filter(r => r.id !== id);
    if (schema.recurringExpenses.length !== len) {
      this.write(schema);
      return true;
    }
    return false;
  }
}

export const dbInstance = new Database();
