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
import SavingGoals from './components/SavingGoals';
import Incomes from './components/Incomes';
import CalendarView from './components/CalendarView';
import RecurringExpenses from './components/RecurringExpenses';

export default function App() {
  // --- CORE STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // App views & UI Controls
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(false);

  // --- INITIAL LOAD OF USER ON MOUNT ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const isGuest = localStorage.getItem('sem_guest_mode') === 'true';
      if (firebaseUser) {
        setIsFirebaseSynced(true);
        localStorage.setItem('sem_guest_mode', 'false');
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
        setIsFirebaseSynced(false);
        if (isGuest) {
          localStorage.setItem('sem_token', 'demo_offline_token_xyz');
          const storedUser = localStorage.getItem('sem_user');
          if (storedUser) {
            try {
              setCurrentUser(JSON.parse(storedUser));
            } catch (err) {
              setCurrentUser(null);
            }
          } else {
            setCurrentUser(null);
          }
          setIsLoading(false);
        } else {
          localStorage.removeItem('sem_user');
          setCurrentUser(null);
          setIsLoading(false);
        }
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
      const isGuest = localStorage.getItem('sem_guest_mode') === 'true';
      const userExpensesKey = `sem_${currentUser.id}_expenses`;
      const userBudgetsKey = `sem_${currentUser.id}_budgets`;
      const userProfileSyncedKey = `sem_${currentUser.id}_profile_synced`;
      const userBudgetsSyncedKey = `sem_${currentUser.id}_budgets_synced`;

      if (isGuest) {
        // Tải hoàn toàn offline từ LocalStorage trong chế độ Khách Trải Nghiệm
        const storedExpenses = localStorage.getItem(userExpensesKey);
        const storedBudgets = localStorage.getItem(userBudgetsKey);
        const userNotifsKey = `sem_${currentUser.id}_notifs`;
        const storedNotifs = localStorage.getItem(userNotifsKey);

        let finalExpenses: Expense[] = [];
        let finalBudgets: Budget[] = [];
        let finalNotifs: Notification[] = [];

        if (storedExpenses) {
          finalExpenses = JSON.parse(storedExpenses);
        } else {
          finalExpenses = INITIAL_EXPENSES.map(e => ({ ...e, id: `exp_init_${Math.random().toString(36).substr(2)}`, userId: currentUser.id }));
          localStorage.setItem(userExpensesKey, JSON.stringify(finalExpenses));
        }

        if (storedBudgets) {
          finalBudgets = JSON.parse(storedBudgets);
        } else {
          finalBudgets = INITIAL_BUDGETS.map(b => ({ ...b, userId: currentUser.id }));
          localStorage.setItem(userBudgetsKey, JSON.stringify(finalBudgets));
        }

        if (storedNotifs) {
          finalNotifs = JSON.parse(storedNotifs);
        } else {
          finalNotifs = INITIAL_NOTIFICATIONS.filter(n => n.userId === 'user_01').map(n => ({ 
            ...n, 
            id: `notif_init_${Math.random().toString(36).substr(2)}`, 
            userId: currentUser.id 
          }));
          localStorage.setItem(userNotifsKey, JSON.stringify(finalNotifs));
        }

        setExpenses(finalExpenses);
        setBudgets(finalBudgets);
        setNotifications(finalNotifs);
        setIsLoading(false);
        return;
      }

      try {
        if (!navigator.onLine) {
          throw new Error('Network offline');
        }

        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Fetch timeout')), 2500)
        );

        // 1. Đồng bộ ngầm thông tin cá nhân lên Firestore nếu chưa đồng bộ thành công trước đó
        const profileSynced = localStorage.getItem(userProfileSyncedKey);
        if (profileSynced === 'false') {
          try {
            const storedUser = localStorage.getItem('sem_user');
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              await ApiService.updateUserProfile(currentUser.id, parsedUser);
              localStorage.setItem(userProfileSyncedKey, 'true');
              console.log("[Ok] Silent sync successful for user profile");
            }
          } catch (profileSyncErr) {
            console.warn("Silent sync failed for user profile:", profileSyncErr);
          }
        }

        // Tải dữ liệu từ Firestore qua ApiService (bọc trong timeout)
        const [apiExpenses, apiBudgets] = await Promise.race([
          Promise.all([ApiService.getExpenses(), ApiService.getBudgets()]),
          timeoutPromise
        ]);
        
        let finalExpenses = [...apiExpenses];
        
        // Tránh ghi đè mất mát các bản ghi offline chưa kịp đồng bộ (có ID bắt đầu bằng exp_added_)
        const storedExpenses = localStorage.getItem(userExpensesKey);
        if (storedExpenses) {
          try {
            const localEst = JSON.parse(storedExpenses) as Expense[];
            const unsavedLocal = localEst.filter(le => {
              if (!le || !le.id || typeof le.id !== 'string' || !le.id.startsWith('exp_added_')) {
                return false;
              }
              // Kiểm tra trùng lặp thông tin trên server để tránh upload trùng
              const alreadyExistsOnServer = apiExpenses.some(ae => 
                Number(ae.amount) === Number(le.amount) &&
                ae.categoryId === le.categoryId &&
                ae.title?.trim() === le.title?.trim() &&
                ae.date === le.date &&
                ae.isNecessary === le.isNecessary
              );
              return !alreadyExistsOnServer;
            });
            if (unsavedLocal.length > 0) {
              finalExpenses = [...unsavedLocal, ...finalExpenses];
              // Đẩy đồng bộ ngầm các khoản chi chưa đồng bộ lên Firestore
              for (const unsaved of unsavedLocal) {
                const { id, userId, ...cleanData } = unsaved as any;
                ApiService.createExpense(cleanData)
                  .then(synced => {
                    console.log("[Ok] Silent sync successful for local expense:", synced);
                  })
                  .catch(err => {
                    console.warn("Silent sync failed for expense:", err);
                  });
              }
            }
          } catch (jsonErr) {
            console.error("Error parsing local expenses:", jsonErr);
          }
        }

        // Tối ưu hóa nạp hạn mức (nhập chỉ tiêu)
        let finalBudgets = [...apiBudgets];
        const storedBudgets = localStorage.getItem(userBudgetsKey);
        const budgetsSynced = localStorage.getItem(userBudgetsSyncedKey);

        if (budgetsSynced === 'false' && storedBudgets) {
          try {
            const localB = JSON.parse(storedBudgets);
            if (localB && localB.length > 0) {
              finalBudgets = localB;
              // Đồng bộ ngầm toàn bộ hạn mức lên Firestore
              await ApiService.saveBudgets(localB);
              localStorage.setItem(userBudgetsSyncedKey, 'true');
              console.log("[Ok] Silent sync successful for budget settings");
            }
          } catch (budgetSyncErr) {
            console.warn("Silent sync failed for budget settings:", budgetSyncErr);
          }
        } else if (apiBudgets.length === 0 && storedBudgets) {
          try {
            const localB = JSON.parse(storedBudgets);
            if (localB && localB.length > 0) {
              finalBudgets = localB;
              // Đồng bộ ngầm toàn bộ hạn mức lên Firestore nếu Firestore trống nhưng client có lưu
              ApiService.saveBudgets(localB).then(() => {
                localStorage.setItem(userBudgetsSyncedKey, 'true');
              }).catch(err => {
                console.warn("Silent sync failed for empty budgets case:", err);
              });
            }
          } catch (jsonErr) {
            console.error("Error parsing local budgets:", jsonErr);
          }
        }
        
        setExpenses(finalExpenses);
        setBudgets(finalBudgets);
        
        // Lưu lại dữ liệu hợp nhất vào LocalStorage
        localStorage.setItem(userExpensesKey, JSON.stringify(finalExpenses));
        localStorage.setItem(userBudgetsKey, JSON.stringify(finalBudgets));

      } catch (e) {
        console.warn('API load failed, loading from LocalStorage instead:', e);
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
  }, [currentUser?.id]);

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
  const handleLoginSuccess = (user: User, isGuest = false) => {
    if (isGuest) {
      localStorage.setItem('sem_guest_mode', 'true');
      localStorage.setItem('sem_token', 'demo_offline_token_xyz');
    } else {
      localStorage.setItem('sem_guest_mode', 'false');
    }
    setCurrentUser(user);
    localStorage.setItem('sem_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    const isGuest = localStorage.getItem('sem_guest_mode') === 'true';
    if (!isGuest) {
      try {
        await auth.signOut();
      } catch(err) {
        console.warn("Logout error", err);
      }
    }
    localStorage.removeItem('sem_guest_mode');
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

    const isGuest = localStorage.getItem('sem_guest_mode') === 'true';
    if (!isGuest) {
      try {
        // 1. Set flags synced to false indicating local has newer un-synced content until success
        localStorage.setItem(`sem_${currentUser.id}_profile_synced`, 'false');
        localStorage.setItem(`sem_${currentUser.id}_budgets_synced`, 'false');

        if (!navigator.onLine) {
          throw new Error('Network offline');
        }

        // 2. Run Firestore updates in parallel with independent error handling
        // We send the FULL target user object to satisfy the Firestore Security Rule schemas validation.
        const profilePromise = ApiService.updateUserProfile(currentUser.id, updatedUser)
          .then(() => {
            localStorage.setItem(`sem_${currentUser.id}_profile_synced`, 'true');
          })
          .catch(err => {
            console.error("Failed to update user profile on database:", err);
          });

        const budgetsPromise = ApiService.saveBudgets(budgetUpdates)
          .then(() => {
            localStorage.setItem(`sem_${currentUser.id}_budgets_synced`, 'true');
          })
          .catch(err => {
            console.error("Failed to save budgets on database:", err);
          });

        // Set a timeout of 1500ms to avoid blocking UI updates if internet is slow/unstable
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1500));
        await Promise.race([
          Promise.all([profilePromise, budgetsPromise]),
          timeoutPromise
        ]);
      } catch (e) {
        console.warn('Could not save to API server, updated locally:', e);
      }
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
  const handleAddExpense = async (newExpenseInput: Omit<Expense, 'id' | 'userId'> & { recurringCycle?: 'NONE' | 'WEEKLY' | 'MONTHLY' }) => {
    if (!currentUser) return;

    const { recurringCycle, ...newExpenseData } = newExpenseInput;
    const isGuest = localStorage.getItem('sem_guest_mode') === 'true';

    // --- AUTOMATIC RECURRING EXPENSE REGISTRATION ONLY ---
    if (recurringCycle && recurringCycle !== 'NONE') {
      const dateObj = new Date(newExpenseData.date);
      let repeatOn = '';
      if (recurringCycle === 'MONTHLY') {
        repeatOn = `Ngày ${dateObj.getDate()} hàng tháng`;
      } else {
        const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        repeatOn = `${weekdays[dateObj.getDay()]} hàng tuần`;
      }

      const newRec: RecurringExpense = {
        id: `rec_added_${Date.now()}`,
        userId: currentUser.id,
        amount: Number(newExpenseData.amount),
        categoryId: newExpenseData.categoryId,
        title: newExpenseData.title,
        cycle: recurringCycle,
        startDate: newExpenseData.date,
        note: newExpenseData.note,
        repeatOn,
        isNecessary: newExpenseData.isNecessary
      };

      if (isGuest) {
        const localRecsKey = `sem_${currentUser.id}_recurring_expenses`;
        const stored = localStorage.getItem(localRecsKey);
        const list = stored ? JSON.parse(stored) : [];
        const updated = [newRec, ...list];
        localStorage.setItem(localRecsKey, JSON.stringify(updated));
      } else {
        try {
          await fetch('/api/recurring-expenses', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('sem_token')}`
            },
            body: JSON.stringify({
              title: newRec.title,
              amount: newRec.amount,
              categoryId: newRec.categoryId,
              cycle: newRec.cycle,
              startDate: newRec.startDate,
              note: newRec.note,
              repeatOn: newRec.repeatOn,
              isNecessary: newRec.isNecessary
            })
          });
        } catch (err) {
          console.error("Failed to call recurring-expenses API:", err);
          const localRecsKey = `sem_${currentUser.id}_recurring_expenses`;
          const stored = localStorage.getItem(localRecsKey);
          const list = stored ? JSON.parse(stored) : [];
          const updated = [newRec, ...list];
          localStorage.setItem(localRecsKey, JSON.stringify(updated));
        }
      }

      const recurringNotif: Notification = {
        id: `notif_sys_${Date.now()}_rec`,
        userId: currentUser.id,
        type: 'success',
        title: 'Chi tiêu định kỳ mới!',
        message: `Khoản chi "${newExpenseData.title}" đã được thiết lập tự động lặp lại ${recurringCycle === 'WEEKLY' ? 'hàng tuần' : 'hàng tháng'}.`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        read: false
      };
      setNotifications(prev => {
        const updated = [recurringNotif, ...prev];
        localStorage.setItem(`sem_${currentUser.id}_notifs`, JSON.stringify(updated));
        return updated;
      });
      const todayLocal = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const isStartToday = newExpenseData.date === todayLocal;
      
      if (isStartToday) {
        newExpenseData.isRecurring = true;
      } else {
        return;
      }
    }

    // --- NORMAL EXPENSE (DO NOT REPEAT) ---
    let createdExpense: Expense;
    
    if (isGuest) {
      createdExpense = {
        ...newExpenseData,
        id: `exp_added_${Date.now()}`,
        userId: currentUser.id
      };
    } else {
      const createPromise = ApiService.createExpense(newExpenseData);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));

      try {
        if (!navigator.onLine) {
          throw new Error('Network offline');
        }

        const result = await Promise.race([createPromise, timeoutPromise]);

        if (result === null) {
          console.warn("API write timed out, treating as offline write");
          const tempId = `exp_added_${Date.now()}`;
          createdExpense = {
            ...newExpenseData,
            id: tempId,
            userId: currentUser.id
          };

          createPromise.then((syncedExpense) => {
            console.log("[Ok] Background write completed successfully:", syncedExpense);
            setExpenses(prev => {
              const updated = prev.map(exp => exp.id === tempId ? syncedExpense : exp);
              if (currentUser) {
                localStorage.setItem(`sem_${currentUser.id}_expenses`, JSON.stringify(updated));
              }
              return updated;
            });
          }).catch(err => {
            console.warn("Background write failed eventually:", err);
          });
        } else {
          createdExpense = result;
        }
      } catch (e) {
        console.warn('API create expense failed or offline, writing locally:', e);
        createdExpense = {
          ...newExpenseData,
          id: `exp_added_${Date.now()}`,
          userId: currentUser.id
        };
      }
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

    const isGuest = localStorage.getItem('sem_guest_mode') === 'true';
    if (!isGuest) {
      try {
        await ApiService.deleteExpense(id);
      } catch (e) {
        console.warn('API delete expense failed:', e);
      }
    }
  };

  // --- UPDATE EXPENSE HANDLER (OPTIMISTIC & OFFLINE PRE-VALIDATIVE) ---
  const handleUpdateExpense = async (id: string, updatedExpenseData: Omit<Expense, 'id' | 'userId'>) => {
    if (!currentUser) return;

    // Update locally first for instant, lag-free UI update
    const updatedLocally: Expense = {
      ...updatedExpenseData,
      id,
      userId: currentUser.id
    };

    const nextExpensesList = expenses.map(exp => exp.id === id ? updatedLocally : exp);
    saveExpenses(nextExpensesList);

    const isGuest = localStorage.getItem('sem_guest_mode') === 'true';
    if (!isGuest) {
      const updatePromise = ApiService.updateExpense(id, updatedExpenseData);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));

      try {
        if (!navigator.onLine) {
          throw new Error('Network offline');
        }

        const result = await Promise.race([updatePromise, timeoutPromise]);
        
        if (result === null) {
          console.warn("API update timed out, relying on client-side state, syncing background in progress");
        } else {
          console.log("[Ok] API update completed successfully:", result);
          const serverSynced = result as Expense;
          setExpenses(prev => {
            const updated = prev.map(exp => exp.id === id ? serverSynced : exp);
            localStorage.setItem(`sem_${currentUser.id}_expenses`, JSON.stringify(updated));
            return updated;
          });
        }
      } catch (e) {
        console.warn('API update expense failed or offline, kept changes locally:', e);
      }
    }

    // --- RE-CHECK TARGET LIMIT IN REAL-TIME ---
    const categoryId = updatedExpenseData.categoryId;
    const catObject = DEFAULT_CATEGORIES.find(c => c.id === categoryId);
    
    const catBudgetObj = budgets.find(b => b.categoryId === categoryId);
    const catBudgetLimit = catBudgetObj ? catBudgetObj.amount : 0;

    const currentYearMonth = updatedExpenseData.date.substring(0, 7);
    const currentMonthExpenses = nextExpensesList.filter(
      e => e.categoryId === categoryId && e.date.startsWith(currentYearMonth)
    );
    const totalSpentInCat = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);

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
      } else if (parentPercent >= 80) {
        const warningNotif: Notification = {
          id: `notif_${Date.now()}_almost`,
          userId: currentUser.id,
          type: 'warning',
          title: `Sắp chạm trần: ${catObject.name}`,
          message: `Khoản chi vừa cập nhật đẩy danh mục ${catObject.name} chạm ngưỡng ${Math.round(parentPercent)}% ngân sách tháng này.`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 19),
          read: false
        };
        saveNotifications([warningNotif, ...notifications]);
      }
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
          isFirebaseOffline={!isFirebaseSynced}
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
              onEditExpense={(expense) => setEditingExpense(expense)}
            />
          )}

          {activeTab === 'history' && (
            <ExpenseHistory
              expenses={expenses}
              categories={DEFAULT_CATEGORIES}
              onDeleteExpense={handleDeleteExpense}
              onEditExpense={(expense) => setEditingExpense(expense)}
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

          {activeTab === 'saving-goals' && (
            <SavingGoals user={currentUser} />
          )}

          {activeTab === 'incomes' && (
            <Incomes user={currentUser} />
          )}

          {activeTab === 'calendar' && (
            <CalendarView expenses={expenses} categories={DEFAULT_CATEGORIES} />
          )}

          {activeTab === 'recurring' && (
            <RecurringExpenses user={currentUser} categories={DEFAULT_CATEGORIES} />
          )}
        </main>

        {/* FOOTER */}
        <footer className="pt-6 pb-24 sm:py-6 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm text-center text-slate-400 text-xs font-medium relative z-20">
          <p>© 2026 Student Expense Manager (SemTietKiem) | MVP Cắt giảm lạm chi cho Sinh viên</p>
        </footer>
      </div>

      {/* Quick Entry Dynamic Insertion Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen || !!editingExpense}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        categories={DEFAULT_CATEGORIES}
        onAddExpense={handleAddExpense}
        editingExpense={editingExpense}
        onEditExpense={handleUpdateExpense}
      />
    </div>
  );
}
