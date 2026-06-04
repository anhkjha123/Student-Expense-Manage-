import { User, Expense, Budget, Notification } from '../types';

const API_BASE = '/api';

export class ApiService {
  private static getHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('sem_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // --- AUTHENTICATION DIALOGS ---
  public static async login(email: string, passwordString: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password: passwordString })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Đăng nhập không thành công');
    }

    const data = await res.json();
    localStorage.setItem('sem_token', data.token);
    localStorage.setItem('sem_user', JSON.stringify(data.user));
    return data;
  }

  public static async register(payload: {
    email: string;
    passwordString: string;
    name: string;
    school: string;
    monthlyIncome: number;
    savingGoal: number;
  }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email: payload.email,
        password: payload.passwordString,
        name: payload.name,
        school: payload.school,
        monthlyIncome: payload.monthlyIncome,
        savingGoal: payload.savingGoal
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Không thể tạo tài khoản');
    }

    const data = await res.json();
    localStorage.setItem('sem_token', data.token);
    localStorage.setItem('sem_user', JSON.stringify(data.user));
    return data;
  }

  // --- EXPENSE CRUD OPERATIONS ---
  public static async getExpenses(): Promise<Expense[]> {
    const res = await fetch(`${API_BASE}/expenses`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Không thể tải danh sách chi tiêu');
    return res.json();
  }

  public static async createExpense(expense: Omit<Expense, 'id' | 'userId'>): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(expense)
    });
    if (!res.ok) throw new Error('Không thể ghi nhận khoản chi');
    return res.json();
  }

  public static async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(expense)
    });
    if (!res.ok) throw new Error('Không thể cập nhật khoản chi');
    return res.json();
  }

  public static async deleteExpense(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return res.ok;
  }

  // --- BUDGET SETTINGS ---
  public static async getBudgets(): Promise<Budget[]> {
    const res = await fetch(`${API_BASE}/budgets`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Không thể tải hạn mức ngân sách');
    return res.json();
  }

  public static async saveBudgets(budgets: Budget[]): Promise<boolean> {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ budgets })
    });
    return res.ok;
  }

  // --- ANALYTICAL STATS FETCHERS ---
  public static async getMonthlyReport(month: string) {
    const res = await fetch(`${API_BASE}/reports/monthly?month=${month}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return null;
    return res.json();
  }

  public static async getWeeklyReport() {
    const res = await fetch(`${API_BASE}/reports/weekly`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return null;
    return res.json();
  }

  public static async getCategoryStats() {
    const res = await fetch(`${API_BASE}/reports/category-stats`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return null;
    return res.json();
  }

  public static async getTopSpending() {
    const res = await fetch(`${API_BASE}/reports/top-spending`, {
      headers: this.getHeaders()
    });
    if (!res.ok) return null;
    return res.json();
  }
}
