import { User, Expense, Budget, Notification, Income, RecurringExpense, Group, GroupMember, GroupExpense, GroupSettlement } from '../types';
import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { 
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', errInfo);
  throw new Error(JSON.stringify(errInfo));
}

// Generate random ID safely
function generateRandomId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export class ApiService {
  // --- AUTHENTICATION ---
  public static async loginWithEmail(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let finalUser: User;
      
      if (!userDoc.exists()) {
         const newUserProfile: Omit<User, 'id'> = {
           email: userCredential.user.email || email,
           name: email.split('@')[0] || 'User',
           school: 'Chưa cập nhật',
           monthlyIncome: 4000000,
           savingGoal: 500000,
           joinedDate: new Date().toISOString().split('T')[0]
         };
         
         await setDoc(userDocRef, newUserProfile);
         finalUser = { ...newUserProfile, id: userCredential.user.uid };
      } else {
         const userData = userDoc.data() as User;
         finalUser = { ...userData, id: userCredential.user.uid };
      }
      
      localStorage.setItem('sem_user', JSON.stringify(finalUser));
      localStorage.setItem('sem_token', await userCredential.user.getIdToken());
      
      return { token: localStorage.getItem('sem_token')!, user: finalUser };
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || 'Lỗi đăng nhập qua Email/Mật khẩu');
    }
  }

  public static async registerWithEmail(
    email: string, 
    password: string, 
    profile: { name: string; school: string; monthlyIncome: number; savingGoal: number }
  ): Promise<{ token: string; user: User }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const finalUser: User = {
        id: userCredential.user.uid,
        email: email,
        name: profile.name,
        school: profile.school || 'Chưa cập nhật',
        monthlyIncome: Number(profile.monthlyIncome) || 4000000,
        savingGoal: Number(profile.savingGoal) || 500000,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      
      await setDoc(userDocRef, {
        email: finalUser.email,
        name: finalUser.name,
        school: finalUser.school,
        monthlyIncome: finalUser.monthlyIncome,
        savingGoal: finalUser.savingGoal,
        joinedDate: finalUser.joinedDate
      });
      
      localStorage.setItem('sem_user', JSON.stringify(finalUser));
      localStorage.setItem('sem_token', await userCredential.user.getIdToken());
      
      return { token: localStorage.getItem('sem_token')!, user: finalUser };
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || 'Lỗi đăng ký tài khoản');
    }
  }

  public static async loginWithGoogle(): Promise<{ token: string; user: User }> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      const userCredential = await signInWithPopup(auth, provider);
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let finalUser: User;
      
      if (!userDoc.exists()) {
         // Auto register if missing
         const newUserProfile: Omit<User, 'id'> = {
           email: userCredential.user.email || '',
           name: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'Unknown',
           school: 'Chưa cập nhật',
           monthlyIncome: 4000000,
           savingGoal: 500000,
           joinedDate: new Date().toISOString().split('T')[0]
         };
         
         await setDoc(userDocRef, newUserProfile);
         finalUser = { ...newUserProfile, id: userCredential.user.uid };
      } else {
         const userData = userDoc.data() as User;
         finalUser = { ...userData, id: userCredential.user.uid };
      }
      
      localStorage.setItem('sem_user', JSON.stringify(finalUser));
      localStorage.setItem('sem_token', await userCredential.user.getIdToken());
      
      return { token: localStorage.getItem('sem_token')!, user: finalUser };
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || 'Lỗi đăng nhập qua Google');
    }
  }

  public static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch user:', err);
      return null;
    }
  }

  public static async updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
    try {
      const { id, ...updateData } = data as any;
      await setDoc(doc(db, 'users', userId), updateData, { merge: true });
    } catch (err) {
      console.error('Failed to update user:', err);
      throw err;
    }
  }

  // --- EXPENSE CRUD OPERATIONS ---
  public static async getExpenses(): Promise<Expense[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    
    try {
      const q = query(collection(db, 'expenses'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'expenses');
      return []; // fallback
    }
  }

  public static async createExpense(expense: Omit<Expense, 'id' | 'userId'>): Promise<Expense> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    
    const newId = `exp_${generateRandomId()}`;
    const fullExpense: any = {
      ...expense,
      amount: Number(expense.amount),
      userId
    };
    if (fullExpense.note === undefined) {
      delete fullExpense.note;
    }
    
    try {
      await setDoc(doc(db, 'expenses', newId), fullExpense);
      return { id: newId, ...fullExpense } as Expense;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'expenses');
      throw err;
    }
  }

  public static async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');
    
    try {
      const { id: _, userId: __, ...updateData } = expense as any; // Strip constrained fields
      if('amount' in updateData) updateData.amount = Number(updateData.amount);
      if (updateData.note === undefined) {
        delete updateData.note;
      }
      
      await updateDoc(doc(db, 'expenses', id), updateData);
      return { id, ...updateData } as Expense; // optimistic return
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'expenses');
      throw err;
    }
  }

  public static async deleteExpense(id: string): Promise<boolean> {
    const userId = auth.currentUser?.uid;
    if (!userId) return false;
    
    try {
      await deleteDoc(doc(db, 'expenses', id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'expenses');
      return false;
    }
  }

  // --- BUDGET SETTINGS ---
  public static async getBudgets(): Promise<Budget[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    
    try {
      const q = query(collection(db, 'budgets'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          categoryId: data.categoryId || '',
          amount: Number(data.amount || 0)
        } as Budget;
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'budgets');
      return [];
    }
  }

  public static async saveBudgets(budgets: Budget[]): Promise<boolean> {
    const userId = auth.currentUser?.uid;
    if (!userId) return false;
    
    try {
      const batch = writeBatch(db);
      for (const b of budgets) {
         const budgetId = `bud_${userId}_${b.categoryId}`;
         const docRef = doc(db, 'budgets', budgetId);
         batch.set(docRef, {
           categoryId: b.categoryId,
           amount: Number(b.amount),
           userId: userId
         });
      }
      await batch.commit();
      return true;
    } catch (err) {
       handleFirestoreError(err, OperationType.WRITE, 'budgets');
       return false;
    }
  }

  // --- INCOMES ---
  public static async getIncomes(month?: string): Promise<Income[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    try {
      const q = query(collection(db, 'incomes'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      let results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Income));
      if (month) {
        results = results.filter(i => i.date.startsWith(month));
      }
      return results;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'incomes');
      return [];
    }
  }

  public static async createIncome(income: Omit<Income, 'id' | 'userId'>): Promise<Income> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const newId = `inc_${generateRandomId()}`;
    const full: any = { ...income, amount: Number(income.amount), userId };
    if (full.note === undefined) delete full.note;

    try {
      await setDoc(doc(db, 'incomes', newId), full);
      return { id: newId, ...full } as Income;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'incomes');
      throw err;
    }
  }

  public static async deleteIncome(id: string): Promise<boolean> {
    const userId = auth.currentUser?.uid;
    if (!userId) return false;

    try {
      await deleteDoc(doc(db, 'incomes', id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'incomes');
      return false;
    }
  }

  // --- RECURRING EXPENSES ---
  public static async getRecurringExpenses(): Promise<RecurringExpense[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    try {
      const q = query(collection(db, 'recurringExpenses'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as RecurringExpense));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'recurringExpenses');
      return [];
    }
  }

  public static async createRecurringExpense(rec: Omit<RecurringExpense, 'id' | 'userId'>): Promise<RecurringExpense> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const newId = `rec_${generateRandomId()}`;
    const full: any = { ...rec, amount: Number(rec.amount), userId };
    if (full.note === undefined) delete full.note;
    if (full.repeatOn === undefined) delete full.repeatOn;

    try {
      await setDoc(doc(db, 'recurringExpenses', newId), full);
      return { id: newId, ...full } as RecurringExpense;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'recurringExpenses');
      throw err;
    }
  }

  public static async deleteRecurringExpense(id: string): Promise<boolean> {
    const userId = auth.currentUser?.uid;
    if (!userId) return false;

    try {
      await deleteDoc(doc(db, 'recurringExpenses', id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'recurringExpenses');
      return false;
    }
  }


  // We will stub the reports since they are computed purely on the client side now
  public static async getMonthlyReport(month: string) {}
  public static async getWeeklyReport() {}
  public static async getCategoryStats() {}
  public static async getTopSpending() {}

  private static async getAuthToken(): Promise<string | null> {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const refreshedToken = await currentUser.getIdToken();
        localStorage.setItem('sem_token', refreshedToken);
        return refreshedToken;
      } catch (err) {
        console.warn('Unable to refresh auth token', err);
      }
    }

    return localStorage.getItem('sem_token');
  }

  private static async buildAuthHeaders(baseHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    if (token) {
      return {
        ...baseHeaders,
        Authorization: `Bearer ${token}`
      };
    }
    return baseHeaders;
  }

  // --- OCR SCANNING ---
  private static async safeFetchJson(url: string, options: RequestInit): Promise<any> {
    let response;
    try {
      response = await fetch(url, options);
    } catch (networkErr: any) {
      throw new Error(`Lỗi mạng: Không thể kết nối tới server tại ${url}. Trạng thái server có thể đang offline. Chi tiết: ${networkErr.message}`);
    }

    const responseText = await response.text();

    if (!response.ok) {
      try {
        const errObj = JSON.parse(responseText);
        throw new Error(errObj.error || `Yêu cầu thất bại với mã lỗi ${response.status}`);
      } catch {
        // Returned HTML page or plain text instead of JSON error object
        throw new Error(`Server gặp sự cố (Mã: ${response.status}). Chi tiết phản hồi:\n${responseText.substring(0, 3000)}...`);
      }
    }

    try {
      return JSON.parse(responseText);
    } catch {
      throw new Error(`Dữ liệu server phản hồi không đúng định dạng JSON. Chi tiết:\n${responseText.substring(0, 3000)}...`);
    }
  }

  public static async scanReceipt(imageBase64: string, filename: string, mimeType: string): Promise<any> {
    const headers = await this.buildAuthHeaders({ 'Content-Type': 'application/json' });
    return this.safeFetchJson('/api/expenses/scan-receipt', {
      method: 'POST',
      headers,
      body: JSON.stringify({ image: imageBase64, name: filename, mimeType })
    });
  }

  // --- GROUPS CLIENT APIS ---
  public static async createGroup(name: string): Promise<{ group: Group, members: GroupMember[] }> {
    const headers = await this.buildAuthHeaders({ 'Content-Type': 'application/json' });
    return this.safeFetchJson('/api/groups', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name })
    });
  }

  public static async getGroups(): Promise<Group[]> {
    const headers = await this.buildAuthHeaders();
    return this.safeFetchJson('/api/groups', { headers });
  }

  public static async getGroup(id: string): Promise<{ group: Group, members: GroupMember[], expenses: GroupExpense[], debts: GroupSettlement[] }> {
    const headers = await this.buildAuthHeaders();
    return this.safeFetchJson(`/api/groups/${id}`, { headers });
  }

  public static async generateInvite(id: string): Promise<Group> {
    const headers = await this.buildAuthHeaders();
    return this.safeFetchJson(`/api/groups/${id}/invite`, {
      method: 'POST',
      headers
    });
  }

  public static async revokeInvite(id: string): Promise<Group> {
    const headers = await this.buildAuthHeaders();
    return this.safeFetchJson(`/api/groups/${id}/invite/revoke`, {
      method: 'POST',
      headers
    });
  }

  public static async joinGroup(code: string): Promise<{ message: string, group: Group }> {
    const headers = await this.buildAuthHeaders();
    return this.safeFetchJson(`/api/groups/join/${code}`, {
      method: 'POST',
      headers
    });
  }

  public static async addGroupExpense(id: string, payload: { description: string, amount: number, date: string, splitType: 'EQUAL' | 'CUSTOM', customSplits?: any[] }): Promise<GroupExpense> {
    const headers = await this.buildAuthHeaders({ 'Content-Type': 'application/json' });
    return this.safeFetchJson(`/api/groups/${id}/expenses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
  }

  public static async settleDebt(id: string, payload: { fromUserId: string, fromUserName: string, toUserId: string, toUserName: string, amount: number }): Promise<GroupExpense> {
    const headers = await this.buildAuthHeaders({ 'Content-Type': 'application/json' });
    return this.safeFetchJson(`/api/groups/${id}/settle`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
  }

  public static async exportGroupCSV(id: string): Promise<Blob> {
    const headers = await this.buildAuthHeaders();
    const response = await fetch(`/api/groups/${id}/export`, { headers });
    if (!response.ok) {
      throw new Error('Lỗi xuất dữ liệu CSV');
    }
    return response.blob();
  }

  public static async getBackendNotifications(): Promise<Notification[]> {
    const headers = await this.buildAuthHeaders();
    try {
      return await this.safeFetchJson('/api/notifications', { headers });
    } catch (err) {
      console.warn('Failed to fetch backend notifications:', err);
      return [];
    }
  }

  public static async markBackendNotificationsRead(): Promise<void> {
    const headers = await this.buildAuthHeaders();
    try {
      await this.safeFetchJson('/api/notifications/mark-read', {
        method: 'POST',
        headers
      });
    } catch (err) {
      console.warn('Failed to mark backend notifications as read:', err);
    }
  }
}

