import { User, Expense, Budget, Notification, Income, RecurringExpense, Group, GroupMember, GroupExpense, GroupExpenseSplit, GroupSettlement } from '../types';
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
  writeBatch,
  deleteField
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
      
      // Clean undefined values or set to deleteField() to remove them from Firestore
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          updateData[key] = deleteField();
        }
      });

      await setDoc(doc(db, 'users', userId), updateData, { merge: true });

      // Also update name/email in all groups this user belongs to
      if (updateData.name || updateData.email) {
        try {
          const memberQuery = query(collection(db, 'groupMembers'), where('userId', '==', userId));
          const memberSnapshot = await getDocs(memberQuery);
          if (!memberSnapshot.empty) {
            const batch = writeBatch(db);
            memberSnapshot.docs.forEach(memberDoc => {
              const memberUpdate: any = {};
              if (updateData.name) memberUpdate.name = updateData.name;
              if (updateData.email) memberUpdate.email = updateData.email;
              batch.update(memberDoc.ref, memberUpdate);
            });
            await batch.commit();
          }
        } catch (groupErr) {
          console.warn('Failed to update user name/email in groups:', groupErr);
        }
      }
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
    
    // Clean undefined values to prevent Firestore error
    Object.keys(fullExpense).forEach(key => {
      if (fullExpense[key] === undefined) {
        delete fullExpense[key];
      }
    });
    
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
      
      // Clean undefined values or set to deleteField() to remove them from Firestore
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          updateData[key] = deleteField();
        }
      });
      
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
    
    // Clean undefined values to prevent Firestore error
    Object.keys(full).forEach(key => {
      if (full[key] === undefined) {
        delete full[key];
      }
    });

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
    
    // Clean undefined values to prevent Firestore error
    Object.keys(full).forEach(key => {
      if (full[key] === undefined) {
        delete full[key];
      }
    });

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

  // --- GROUPS CLIENT APIS (FIRESTORE PERSISTENT) ---
  public static calculateEqualSplits(amount: number, members: { userId: string, email: string }[]): GroupExpenseSplit[] {
    const N = members.length;
    if (N === 0) return [];
    if (N === 1) {
      return [{ userId: members[0].userId, email: members[0].email, amount }];
    }

    const rawShare = amount / N;
    const roundedShare = Math.round(rawShare / 1000) * 1000;
    
    const splits: GroupExpenseSplit[] = [];
    let otherSum = 0;
    
    for (let i = 1; i < N; i++) {
      splits.push({
        userId: members[i].userId,
        email: members[i].email,
        amount: roundedShare
      });
      otherSum += roundedShare;
    }
    
    const firstShare = amount - otherSum;
    splits.unshift({
      userId: members[0].userId,
      email: members[0].email,
      amount: firstShare
    });
    
    return splits;
  }

  public static calculateDebts(groupId: string, members: GroupMember[], expenses: GroupExpense[]): GroupSettlement[] {
    const balanceMap: Record<string, number> = {};
    const nameMap: Record<string, string> = {};
    
    members.forEach(m => {
      if (m.userId) {
        balanceMap[m.userId] = 0;
        nameMap[m.userId] = m.name;
      }
    });

    expenses.forEach(exp => {
      const payer = exp.paidBy;
      if (balanceMap[payer] !== undefined) {
        balanceMap[payer] += exp.amount;
      }
      exp.splits.forEach(split => {
        if (balanceMap[split.userId] !== undefined) {
          balanceMap[split.userId] -= split.amount;
        }
      });
    });

    const creditors: { userId: string, name: string, balance: number }[] = [];
    const debtors: { userId: string, name: string, balance: number }[] = [];

    Object.keys(balanceMap).forEach(userId => {
      const bal = balanceMap[userId];
      if (bal > 0.01) {
        creditors.push({ userId, name: nameMap[userId] || userId, balance: bal });
      } else if (bal < -0.01) {
        debtors.push({ userId, name: nameMap[userId] || userId, balance: bal });
      }
    });

    creditors.sort((a, b) => b.balance - a.balance);
    debtors.sort((a, b) => a.balance - b.balance);

    const settlements: GroupSettlement[] = [];
    let cIdx = 0;
    let dIdx = 0;

    while (cIdx < creditors.length && dIdx < debtors.length) {
      const creditor = creditors[cIdx];
      const debtor = debtors[dIdx];
      const debtAmount = Math.abs(debtor.balance);
      const creditAmount = creditor.balance;

      const settleAmount = Math.min(debtAmount, creditAmount);
      const roundedAmount = Math.round(settleAmount);

      if (roundedAmount > 0) {
        settlements.push({
          id: `settle_${groupId}_${debtor.userId}_${creditor.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          groupId,
          fromUserId: debtor.userId,
          fromUserName: debtor.name,
          toUserId: creditor.userId,
          toUserName: creditor.name,
          amount: roundedAmount,
          date: new Date().toISOString().substring(0, 10),
          isPaid: false
        });
      }

      debtor.balance += settleAmount;
      creditor.balance -= settleAmount;

      if (Math.abs(debtor.balance) < 0.01) dIdx++;
      if (creditor.balance < 0.01) cIdx++;
    }

    return settlements;
  }

  public static async createGroup(name: string): Promise<{ group: Group, members: GroupMember[] }> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const inviteCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7);

    const newGroup: Group = {
      id: groupId,
      name: name.trim(),
      creatorId: userId,
      createdAt: new Date().toISOString().substring(0, 10),
      inviteCode,
      inviteExpiresAt: inviteExpiresAt.toISOString(),
      inviteRevoked: false
    };

    await setDoc(doc(db, 'groups', groupId), newGroup);

    const creatorMember: GroupMember = {
      id: `member_${groupId}_${userId}`,
      groupId,
      userId,
      email: auth.currentUser?.email || '',
      name: auth.currentUser?.displayName || 'Người dùng',
      joinedAt: new Date().toISOString().substring(0, 10)
    };

    await setDoc(doc(db, 'groupMembers', creatorMember.id), creatorMember);

    return { group: newGroup, members: [creatorMember] };
  }

  public static async getGroups(): Promise<Group[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    try {
      const q = query(collection(db, 'groupMembers'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const groupIds = snapshot.docs.map(doc => doc.data().groupId);

      if (groupIds.length === 0) return [];

      const groups: Group[] = [];
      for (const groupId of groupIds) {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          groups.push(groupDoc.data() as Group);
        }
      }
      return groups;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'groups');
      return [];
    }
  }

  public static async getGroup(id: string): Promise<{ group: Group, members: GroupMember[], expenses: GroupExpense[], debts: GroupSettlement[] }> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const groupDoc = await getDoc(doc(db, 'groups', id));
    if (!groupDoc.exists()) {
      throw new Error('Không tìm thấy nhóm chi tiêu');
    }
    const group = groupDoc.data() as Group;

    const membersQ = query(collection(db, 'groupMembers'), where('groupId', '==', id));
    const membersSnapshot = await getDocs(membersQ);
    const members = membersSnapshot.docs.map(doc => doc.data() as GroupMember);

    const isMember = members.some(m => m.userId === userId);
    if (!isMember) {
      throw new Error('Bạn không phải là thành viên nhóm này');
    }

    const expensesQ = query(collection(db, 'groupExpenses'), where('groupId', '==', id));
    const expensesSnapshot = await getDocs(expensesQ);
    const expenses = expensesSnapshot.docs.map(doc => doc.data() as GroupExpense);

    const debts = this.calculateDebts(id, members, expenses);

    return {
      group,
      members,
      expenses,
      debts
    };
  }

  public static async generateInvite(id: string): Promise<Group> {
    const inviteCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7);

    const groupRef = doc(db, 'groups', id);
    const updateData = {
      inviteCode,
      inviteExpiresAt: inviteExpiresAt.toISOString(),
      inviteRevoked: false
    };

    await updateDoc(groupRef, updateData);
    const updatedDoc = await getDoc(groupRef);
    return updatedDoc.data() as Group;
  }

  public static async revokeInvite(id: string): Promise<Group> {
    const groupRef = doc(db, 'groups', id);
    await updateDoc(groupRef, { inviteRevoked: true });
    const updatedDoc = await getDoc(groupRef);
    return updatedDoc.data() as Group;
  }

  public static async joinGroup(code: string): Promise<{ message: string, group: Group }> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const groupsQ = query(collection(db, 'groups'), where('inviteCode', '==', code.toUpperCase()));
    const groupsSnapshot = await getDocs(groupsQ);
    if (groupsSnapshot.empty) {
      throw new Error('Mã mời nhóm không tồn tại');
    }

    const groupDoc = groupsSnapshot.docs[0];
    const group = groupDoc.data() as Group;

    if (group.inviteRevoked) {
      throw new Error('Liên kết mời nhóm này đã bị thu hồi');
    }

    const expiry = new Date(group.inviteExpiresAt);
    if (expiry.getTime() < Date.now()) {
      throw new Error('Liên kết mời nhóm đã hết hạn sử dụng');
    }

    const membersQ = query(collection(db, 'groupMembers'), where('groupId', '==', group.id));
    const membersSnapshot = await getDocs(membersQ);
    const members = membersSnapshot.docs.map(doc => doc.data() as GroupMember);

    if (members.length >= 20) {
      throw new Error('Nhóm chi tiêu đã đạt số lượng tối đa 20 thành viên');
    }

    const isAlreadyMember = members.some(m => m.userId === userId);
    if (isAlreadyMember) {
      throw new Error('Bạn đã là thành viên của nhóm chi tiêu này');
    }

    const newMember: GroupMember = {
      id: `member_${group.id}_${userId}`,
      groupId: group.id,
      userId,
      email: auth.currentUser?.email || '',
      name: auth.currentUser?.displayName || 'Người dùng',
      joinedAt: new Date().toISOString().substring(0, 10)
    };

    await setDoc(doc(db, 'groupMembers', newMember.id), newMember);

    return { message: 'Tham gia nhóm thành công', group };
  }

  public static async addGroupExpense(id: string, payload: { description: string, amount: number, date: string, splitType: 'EQUAL' | 'CUSTOM', customSplits?: any[] }): Promise<GroupExpense> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    const groupDoc = await getDoc(doc(db, 'groups', id));
    const group = groupDoc.data() as Group;
    const groupName = group?.name || 'nhóm';

    const membersQ = query(collection(db, 'groupMembers'), where('groupId', '==', id));
    const membersSnapshot = await getDocs(membersQ);
    const members = membersSnapshot.docs.map(doc => doc.data() as GroupMember);

    let splits: GroupExpenseSplit[] = [];
    if (payload.splitType === 'EQUAL') {
      const splitMembers = members.map(m => ({
        userId: m.userId || '',
        email: m.email
      }));
      splits = this.calculateEqualSplits(payload.amount, splitMembers);
    } else if (payload.splitType === 'CUSTOM') {
      splits = (payload.customSplits || []).map(s => ({
        userId: s.userId,
        email: s.email,
        amount: Number(s.amount)
      }));
    }

    const expenseId = `gexp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newExpense: GroupExpense & { categoryId?: string } = {
      id: expenseId,
      groupId: id,
      paidBy: userId,
      paidByName: auth.currentUser?.displayName || 'Thành viên',
      amount: Number(payload.amount),
      description: payload.description.trim(),
      date: payload.date,
      splitType: payload.splitType,
      splits,
      categoryId: 'group_fund'
    };

    await setDoc(doc(db, 'groupExpenses', expenseId), newExpense);

    // Save notifications to Firestore
    for (const split of splits) {
      if (split.userId && split.userId !== userId && split.amount > 0) {
        const notifId = `notif_sys_${Date.now()}_${split.userId}_${Math.random().toString(36).substr(2, 4)}`;
        const debtNotif: Notification = {
          id: notifId,
          userId: split.userId,
          type: 'info',
          title: 'Phát sinh công nợ nhóm',
          message: `Bạn có khoản nợ ${new Intl.NumberFormat('vi-VN').format(split.amount)}đ trong nhóm "${groupName}" từ hóa đơn "${payload.description.trim()}".`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 19),
          read: false
        };
        await setDoc(doc(db, 'notifications', notifId), debtNotif);
      }
    }

    return newExpense;
  }

  public static async settleDebt(id: string, payload: { fromUserId: string, fromUserName: string, toUserId: string, toUserName: string, amount: number }): Promise<GroupExpense> {
    const expenseId = `gexp_settle_${Date.now()}`;
    const settlementExpense: GroupExpense = {
      id: expenseId,
      groupId: id,
      paidBy: payload.fromUserId,
      paidByName: payload.fromUserName,
      amount: Number(payload.amount),
      description: `Tất toán nợ: ${payload.fromUserName} trả ${payload.toUserName}`,
      date: new Date().toISOString().substring(0, 10),
      splitType: 'CUSTOM',
      splits: [
        {
          userId: payload.toUserId,
          email: '',
          amount: Number(payload.amount)
        }
      ],
      categoryId: 'group_fund'
    } as any;

    await setDoc(doc(db, 'groupExpenses', expenseId), settlementExpense);

    return settlementExpense;
  }

  public static async exportGroupCSV(id: string): Promise<Blob> {
    const data = await this.getGroup(id);
    let csvContent = '\uFEFF'; 
    csvContent += 'Mã giao dịch,Thời gian,Nội dung chi,Người chi,Số tiền chi (VND),Phương thức chia,Danh mục\n';

    data.expenses.forEach(e => {
      const descEscaped = e.description.replace(/"/g, '""');
      const paidByNameEscaped = e.paidByName.replace(/"/g, '""');
      csvContent += `"${e.id}","${e.date}","${descEscaped}","${paidByNameEscaped}",${e.amount},"${e.splitType}","Quỹ nhóm"\n`;
    });

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  // --- NOTIFICATIONS PERSISTED ON FIRESTORE ---
  public static async getBackendNotifications(): Promise<Notification[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];

    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Notification);
    } catch (err) {
      console.warn('Failed to fetch notifications from Firestore:', err);
      return [];
    }
  }

  public static async markBackendNotificationsRead(): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(docSnap => {
        batch.update(docSnap.ref, { read: true });
      });
      await batch.commit();
    } catch (err) {
      console.warn('Failed to mark notifications as read on Firestore:', err);
    }
  }
}

