import React, { useState, useEffect } from 'react';
import { 
  User, 
  Expense, 
  Category, 
  Budget, 
  Notification 
} from './types';
import { 
  DEFAULT_CATEGORIES, 
  MOCK_USERS, 
  INITIAL_EXPENSES, 
  INITIAL_BUDGETS, 
  INITIAL_NOTIFICATIONS 
} from './mockData';
import { ApiService } from './lib/api';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// import components
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ExpenseHistory from './components/ExpenseHistory';
import BudgetSettings from './components/BudgetSettings';
import Reports from './components/Reports';
import AddExpenseModal from './components/AddExpenseModal';
import LoginRegister from './components/LoginRegister';

export default function App() {
  // --- CORE STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // App views & UI Controls
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- INITIAL LOAD OF USER ON MOUNT ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await ApiService.getUserProfile(firebaseUser.uid);
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem('sem_user', JSON.stringify(profile));
          } else {
            const storedUser = localStorage.getItem('sem_user');
            if (storedUser) {
              setCurrentUser(JSON.parse(storedUser));
            } else {
              setCurrentUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.email?.split('@')[0] || 'Unknown',
                school: 'Updating...',
                monthlyIncome: 0,
                savingGoal: 0,
                joinedDate: new Date().toISOString().split('T')[0]
              });
            }
          }
        } catch (e) {
          console.error("Firebase auth processing error", e);
        } finally {
          setIsLoading(false);
        }
      } else {
        localStorage.removeItem('sem_user');
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- LOAD USER-SCOPED DATA WHEN USER CHANGES ---
  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      setBudgets([]);
      setNotifications([]);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Tải dữ liệu từ Firestore qua ApiService
        const apiExpenses = await ApiService.getExpenses();
        const apiBudgets = await ApiService.getBudgets();
        
        setExpenses(apiExpenses);
        setBudgets(apiBudgets);
      } catch (e) {
        console.warn('API load failed, loading from LocalStorage instead:', e);
        const userExpensesKey = `sem_${currentUser.id}_expenses`;
        const userBudgetsKey = `sem_${currentUser.id}_budgets`;

        const storedExpenses = localStorage.getItem(userExpensesKey);
        const storedBudgets = localStorage.getItem(userBudgetsKey);

        let finalExpenses: Expense[] = [];
        let finalBudgets: Budget[] = [];

        if (storedExpenses) finalExpenses = JSON.parse(storedExpenses);
        if (storedBudgets) finalBudgets = JSON.parse(storedBudgets);

        setExpenses(finalExpenses);
        setBudgets(finalBudgets);
      } finally {
        // Tải thông báo từ local storage
        const userNotifsKey = `sem_${currentUser.id}_notifs`;
        const storedNotifs = localStorage.getItem(userNotifsKey);
        let finalNotifs: Notification[] = [];

        if (storedNotifs) {
          finalNotifs = JSON.parse(storedNotifs);
        } else {
          finalNotifs = INITIAL_NOTIFICATIONS.filter(n => n.userId === currentUser.id);
          localStorage.setItem(userNotifsKey, JSON.stringify(finalNotifs));
        }
        setNotifications(finalNotifs);
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // --- SAVE TO USER-SCOPED LOCALSTORAGE ON UPDATES ---
  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    if (currentUser) {
      localStorage.setItem(`sem_${currentUser.id}_expenses`, JSON.stringify(newExpenses));
    }
  };

  const saveBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    if (currentUser) {
      localStorage.setItem(`sem_${currentUser.id}_budgets`, JSON.stringify(newBudgets));
    }
  };

  const saveNotifications = (newNotifs: Notification[]) => {
    setNotifications(newNotifs);
    if (currentUser) {
      localStorage.setItem(`sem_${currentUser.id}_notifs`, JSON.stringify(newNotifs));
    }
  };

  // --- USER HANDLERS ---
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('sem_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch(err) {
      console.warn("Logout error", err);
    }
    setCurrentUser(null);
    localStorage.removeItem('sem_user');
    localStorage.removeItem('sem_token');
    setExpenses([]);
    setBudgets([]);
    setNotifications([]);
  };

  // --- BUDGET UPDATE HANDLER ---
  const handleUpdateBudget = async (userUpdates: Partial<User>, budgetUpdates: Budget[]) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...userUpdates } as User;
    setCurrentUser(updatedUser);
    localStorage.setItem('sem_user', JSON.stringify(updatedUser));
    saveBudgets(budgetUpdates);

    try {
      await ApiService.updateUserProfile(currentUser.id, userUpdates);
      await ApiService.saveBudgets(budgetUpdates);
    } catch (e) {
      console.warn('Could not save to API server, updated locally:', e);
    }

    // Phát sinh thông báo thành công hằng tháng
    const newNotif: Notification = {
      id: `notif_sys_${Date.now()}`,
      userId: currentUser.id,
      type: 'success',
      title: 'Hạn mức ngân sách mới!',
      message: `Bạn vừa đặt tổng ngân sách mới. Mức chi tiêu tối ưu tháng này là ${new Intl.NumberFormat('vi-VN').format(updatedUser.monthlyIncome - updatedUser.savingGoal)}đ`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: false
    };

    saveNotifications([newNotif, ...notifications]);
  };

  // --- ADD EXPENSE PROCESS & REAL-TIME INCURSION CHECK ---
  const handleAddExpense = async (newExpenseData: Omit<Expense, 'id' | 'userId'>) => {
    if (!currentUser) return;

    let createdExpense: Expense;
    try {
      createdExpense = await ApiService.createExpense(newExpenseData);
    } catch (e) {
      console.warn('API create expense failed, writing locally:', e);
      createdExpense = {
        ...newExpenseData,
        id: `exp_added_${Date.now()}`,
        userId: currentUser.id
      };
    }

    const nextExpensesList = [createdExpense, ...expenses];
    saveExpenses(nextExpensesList);

    // --- KIỂM TRA HẠN MỨC NGAY LẬP TỨC (Real-time target breach monitoring) ---
    const categoryId = newExpenseData.categoryId;
    const catObject = DEFAULT_CATEGORIES.find(c => c.id === categoryId);
    
    // 1. Tính tổng hạn mức của danh mục này
    const catBudgetObj = budgets.find(b => b.categoryId === categoryId);
    const catBudgetLimit = catBudgetObj ? catBudgetObj.amount : 0;

    // 2. Tính tổng thực chi trong tháng hiện tại
    const currentYearMonth = newExpenseData.date.substring(0, 7);
    const currentMonthExpenses = nextExpensesList.filter(
      e => e.categoryId === categoryId && e.date.startsWith(currentYearMonth)
    );
    const totalSpentInCat = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);

    // Phát sinh thông báo nếu vượt ngưỡng 80% hoặc 100% hạn mức danh mục
    if (catBudgetLimit > 0 && catObject) {
      const parentPercent = (totalSpentInCat / catBudgetLimit) * 100;

      if (parentPercent >= 100) {
        const warningNotif: Notification = {
          id: `notif_${Date.now()}_limit`,
          userId: currentUser.id,
          type: 'alert',
          title: `VỢT HẠN MỨC: ${catObject.name}!`,
          message: `Ứng dụng khuyên giảm: Bạn đã tiêu quá ${new Intl.NumberFormat('vi-VN').format(totalSpentInCat)}đ trên mức giới hạn ${new Intl.NumberFormat('vi-VN').format(catBudgetLimit)}đ của mục ${catObject.name}.`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 19),
          read: false
        };
        saveNotifications([warningNotif, ...notifications]);
      } else if (parentPercent >= 80) { // S2-15 Cảnh báo 80%
        const warningNotif: Notification = {
          id: `notif_${Date.now()}_almost`,
          userId: currentUser.id,
          type: 'warning',
          title: `Sắp chạm trần: ${catObject.name}`,
          message: `Khoản chi vừa nhập đẩy danh mục ${catObject.name} chạm ngưỡng ${Math.round(parentPercent)}% ngân sách tháng này.`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 19),
          read: false
        };
        saveNotifications([warningNotif, ...notifications]);
      }
    }
  };

  // --- DELETE EXPENSE HANDLER ---
  const handleDeleteExpense = async (id: string) => {
    const updated = expenses.filter(exp => exp.id !== id);
    saveExpenses(updated);

    try {
      await ApiService.deleteExpense(id);
    } catch (e) {
      console.warn('API delete expense failed:', e);
    }
  };

  // --- NOTIFICATION UTILS ---
  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => {
      if (n.id === id) return { ...n, read: true };
      return n;
    });
    saveNotifications(updated);
  };

  const clearNotifications = () => {
    saveNotifications([]);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-500" />
          <p className="text-xs font-bold text-slate-500 font-mono">Đang khởi tạo hệ thống ví...</p>
        </div>
      </div>
    );
  }

  // Chuyển hướng nếu chưa đăng nhập
  if (!currentUser) {
    return (
      <LoginRegister 
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-200 relative overflow-hidden">
      
      {/* Decorative Modern Background Blobs */}
      <div className="absolute top-[-5%] left-[-10%] w-[60%] h-[50%] rounded-full bg-emerald-200/20 blur-[100px] object-cover pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/20 blur-[120px] object-cover pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[10%] w-[30%] h-[40%] rounded-full bg-amber-100/30 blur-[100px] object-cover pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col flex-1 w-full">
        {/* Dynamic Header & Actions Bar */}
        <Navbar
          user={currentUser}
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          notifications={notifications}
          markNotificationAsRead={markNotificationAsRead}
          clearNotifications={clearNotifications}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        />

        {/* Main Content Render area */}
        <main className="flex-1 pb-4 sm:pb-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              user={currentUser}
              expenses={expenses}
              categories={DEFAULT_CATEGORIES}
              budgets={budgets}
              notifications={notifications}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'history' && (
            <ExpenseHistory
              expenses={expenses}
              categories={DEFAULT_CATEGORIES}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetSettings
              user={currentUser}
              categories={DEFAULT_CATEGORIES}
              budgets={budgets}
              onUpdateBudget={handleUpdateBudget}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              expenses={expenses}
              categories={DEFAULT_CATEGORIES}
              user={currentUser}
            />
          )}
        </main>

        {/* FOOTER */}
        <footer className="pt-6 pb-24 sm:py-6 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm text-center text-slate-400 text-xs font-medium relative z-20">
          <p>© 2026 Student Expense Manager (SemTietKiem) | MVP Cắt giảm lạm chi cho Sinh viên</p>
        </footer>
      </div>

      {/* Quick Entry Dynamic Insertion Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        categories={DEFAULT_CATEGORIES}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
}
