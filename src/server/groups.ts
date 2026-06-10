import { Response } from 'express';
import { AuthenticatedRequest } from './auth';
import { dbInstance } from './db';
import { Group, GroupMember, GroupExpense, GroupExpenseSplit, GroupSettlement, Notification } from '../types';

// Equal splitting with rounding to 1000 VND (AC3)
export function calculateEqualSplits(amount: number, members: { userId: string, email: string }[]): GroupExpenseSplit[] {
  const N = members.length;
  if (N === 0) return [];
  if (N === 1) {
    return [{ userId: members[0].userId, email: members[0].email, amount }];
  }

  const rawShare = amount / N;
  const roundedShare = Math.round(rawShare / 1000) * 1000;
  
  const splits: GroupExpenseSplit[] = [];
  let otherSum = 0;
  
  // Members 1 to N-1 get rounded share
  for (let i = 1; i < N; i++) {
    splits.push({
      userId: members[i].userId,
      email: members[i].email,
      amount: roundedShare
    });
    otherSum += roundedShare;
  }
  
  // First member gets the remainder
  const firstShare = amount - otherSum;
  splits.unshift({
    userId: members[0].userId,
    email: members[0].email,
    amount: firstShare
  });
  
  return splits;
}

// Calculate outstanding settlements dynamically
export function calculateDebts(groupId: string, members: GroupMember[], expenses: GroupExpense[]): GroupSettlement[] {
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

export const groupsController = {
  // S5-16: UI create group & invites
  createGroup: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const { name } = req.body;
      if (!name || name.trim().length < 3 || name.trim().length > 50) {
        return res.status(400).json({ error: 'Tên nhóm phải từ 3 đến 50 ký tự' });
      }

      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const inviteCode = Math.random().toString(36).substr(2, 8).toUpperCase();
      
      const inviteExpiresAt = new Date();
      inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7); // Expiry 7 days (AC2)

      const newGroup: Group = {
        id: groupId,
        name: name.trim(),
        creatorId: userId,
        createdAt: new Date().toISOString().substring(0, 10),
        inviteCode,
        inviteExpiresAt: inviteExpiresAt.toISOString()
      };

      dbInstance.saveGroup(newGroup);

      const creatorMember: GroupMember = {
        id: `member_${groupId}_${userId}`,
        groupId,
        userId,
        email: req.user?.email || '',
        name: req.user?.name || 'Người dùng',
        joinedAt: new Date().toISOString().substring(0, 10)
      };

      dbInstance.saveGroupMember(creatorMember);

      res.status(201).json({ group: newGroup, members: [creatorMember] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  getGroups: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const allGroups = dbInstance.getGroups();
      const allMembers = dbInstance.getGroupMembers();
      
      // Filter groups where current user is a member
      const userGroupIds = allMembers.filter(m => m.userId === userId).map(m => m.groupId);
      const userGroups = allGroups.filter(g => userGroupIds.includes(g.id));

      res.json(userGroups);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  getGroup: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const { id } = req.params;
      const groups = dbInstance.getGroups();
      const group = groups.find(g => g.id === id);

      if (!group) {
        return res.status(404).json({ error: 'Không tìm thấy nhóm chi tiêu' });
      }

      const allMembers = dbInstance.getGroupMembers();
      const groupMembers = allMembers.filter(m => m.groupId === id);

      // Verify membership
      const isMember = groupMembers.some(m => m.userId === userId);
      if (!isMember) {
        return res.status(403).json({ error: 'Bạn không phải là thành viên nhóm này' });
      }

      const allExpenses = dbInstance.getGroupExpenses();
      const groupExpenses = allExpenses.filter(e => e.groupId === id);

      // Dynamically calculate current debts (AC4)
      const debts = calculateDebts(id, groupMembers, groupExpenses);

      res.json({
        group,
        members: groupMembers,
        expenses: groupExpenses,
        debts
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  generateInvite: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const { id } = req.params;
      const groups = dbInstance.getGroups();
      const group = groups.find(g => g.id === id);

      if (!group) {
        return res.status(404).json({ error: 'Không tìm thấy nhóm chi tiêu' });
      }

      // Generate new invite code
      const inviteCode = Math.random().toString(36).substr(2, 8).toUpperCase();
      const inviteExpiresAt = new Date();
      inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7); // 7 days (AC2)

      group.inviteCode = inviteCode;
      group.inviteExpiresAt = inviteExpiresAt.toISOString();
      group.inviteRevoked = false;

      dbInstance.saveGroup(group);

      res.json(group);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  revokeInvite: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const { id } = req.params;
      const groups = dbInstance.getGroups();
      const group = groups.find(g => g.id === id);

      if (!group) {
        return res.status(404).json({ error: 'Không tìm thấy nhóm chi tiêu' });
      }

      group.inviteRevoked = true; // Revoke (AC2)
      dbInstance.saveGroup(group);

      res.json(group);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  joinGroup: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const { code } = req.params;
      const groups = dbInstance.getGroups();
      const group = groups.find(g => g.inviteCode === code.toUpperCase());

      if (!group) {
        return res.status(404).json({ error: 'Mã mời nhóm không tồn tại' });
      }

      if (group.inviteRevoked) {
        return res.status(400).json({ error: 'Liên kết mời nhóm này đã bị thu hồi' });
      }

      const expiry = new Date(group.inviteExpiresAt);
      if (expiry.getTime() < Date.now()) {
        return res.status(400).json({ error: 'Liên kết mời nhóm đã hết hạn sử dụng' });
      }

      const allMembers = dbInstance.getGroupMembers();
      const groupMembers = allMembers.filter(m => m.groupId === group.id);

      // Verify group size (max 20 members - AC1)
      if (groupMembers.length >= 20) {
        return res.status(400).json({ error: 'Nhóm chi tiêu đã đạt số lượng tối đa 20 thành viên' });
      }

      // Check if already a member
      const isAlreadyMember = groupMembers.some(m => m.userId === userId);
      if (isAlreadyMember) {
        return res.status(400).json({ error: 'Bạn đã là thành viên của nhóm chi tiêu này' });
      }

      const newMember: GroupMember = {
        id: `member_${group.id}_${userId}`,
        groupId: group.id,
        userId,
        email: req.user?.email || '',
        name: req.user?.name || 'Người dùng',
        joinedAt: new Date().toISOString().substring(0, 10)
      };

      dbInstance.saveGroupMember(newMember);

      res.json({ message: 'Tham gia nhóm thành công', group });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  // S5-17: Logic chia tiền (equal/custom ratio) và settlement
  addGroupExpense: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const { id } = req.params;
      const { description, amount, date, splitType, customSplits, categoryId } = req.body;

      if (!description || !amount || amount <= 0 || !date || !splitType) {
        return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin khoản chi nhóm' });
      }

      const allMembers = dbInstance.getGroupMembers();
      const groupMembers = allMembers.filter(m => m.groupId === id);

      const isMember = groupMembers.some(m => m.userId === userId);
      if (!isMember) {
        return res.status(403).json({ error: 'Bạn không phải là thành viên nhóm này' });
      }

      let splits: GroupExpenseSplit[] = [];

      if (splitType === 'EQUAL') {
        const splitMembers = groupMembers.map(m => ({
          userId: m.userId || '',
          email: m.email
        }));
        splits = calculateEqualSplits(amount, splitMembers);
      } else if (splitType === 'CUSTOM') {
        if (!customSplits || !Array.isArray(customSplits)) {
          return res.status(400).json({ error: 'Dữ liệu phân chia tự chọn (CUSTOM) không hợp lệ' });
        }
        
        let splitSum = 0;
        customSplits.forEach((s: any) => {
          splitSum += Number(s.amount || 0);
        });

        if (Math.abs(splitSum - amount) > 10) { // Allow tiny rounding difference
          return res.status(400).json({ 
            error: `Tổng tiền phân chia (${splitSum}đ) phải trùng khớp với tổng tiền hóa đơn (${amount}đ)` 
          });
        }
        
        splits = customSplits.map(s => ({
          userId: s.userId,
          email: s.email,
          amount: Number(s.amount)
        }));
      }

      const newExpense: GroupExpense & { categoryId?: string } = {
        id: `gexp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        groupId: id,
        paidBy: userId,
        paidByName: req.user?.name || 'Thành viên',
        amount: Number(amount),
        description: description.trim(),
        date,
        splitType,
        splits,
        categoryId: categoryId || 'other'
      };

      dbInstance.saveGroupExpense(newExpense);

      const groups = dbInstance.getGroups();
      const group = groups.find(g => g.id === id);
      const groupName = group?.name || 'nhóm chi tiêu';

      splits.forEach(split => {
        if (!split.userId || split.amount <= 0) return;

        const personalExpense = {
          id: `exp_group_${Date.now()}_${split.userId}_${Math.random().toString(36).substr(2, 4)}`,
          userId: split.userId,
          amount: split.amount,
          categoryId: categoryId || 'group_fund',
          title: `Chi phí nhóm: ${description.trim()}`,
          date,
          isNecessary: true,
          note: `Nhóm: ${groupName} | Người trả trước: ${req.user?.name || 'Người dùng'}`
        };

        dbInstance.saveExpense(personalExpense);

        if (split.userId !== userId) {
          const debtNotif: Notification = {
            id: `notif_sys_${Date.now()}_${split.userId}_${Math.random().toString(36).substr(2, 4)}`,
            userId: split.userId,
            type: 'info',
            title: 'Phát sinh công nợ nhóm',
            message: `Bạn có khoản nợ ${new Intl.NumberFormat('vi-VN').format(split.amount)}đ trong nhóm "${groupName}" từ hóa đơn "${description.trim()}".`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 19),
            read: false
          };
          dbInstance.saveNotification(debtNotif);
        }
      });

      res.status(201).json(newExpense);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  settleDebt: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const { id } = req.params;
      const { fromUserId, fromUserName, toUserId, toUserName, amount } = req.body;

      if (!fromUserId || !toUserId || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Thông tin thanh toán nợ không đầy đủ' });
      }

      // Record a special group payment transaction (AC4 toggle)
      const settlementExpense: GroupExpense = {
        id: `gexp_settle_${Date.now()}`,
        groupId: id,
        paidBy: fromUserId,
        paidByName: fromUserName,
        amount: Number(amount),
        description: `Tất toán nợ: ${fromUserName} trả ${toUserName}`,
        date: new Date().toISOString().substring(0, 10),
        splitType: 'CUSTOM',
        splits: [
          {
            userId: toUserId,
            email: '',
            amount: Number(amount)
          }
        ]
      };

      dbInstance.saveGroupExpense(settlementExpense);

      // Save an individual personal expense for the debtor in local JSON DB
      const personalExpense = {
        id: `exp_settle_${Date.now()}`,
        userId: fromUserId,
        amount: Number(amount),
        categoryId: 'group_fund',
        title: `Tất toán nợ nhóm: Trả cho ${toUserName}`,
        date: new Date().toISOString().substring(0, 10),
        isNecessary: true,
        note: `Tất toán nợ trong nhóm`
      };
      dbInstance.saveExpense(personalExpense);

      res.json(settlementExpense);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  // AC5: Export Group CSV
  exportCSV: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const { id } = req.params;
      const groups = dbInstance.getGroups();
      const group = groups.find(g => g.id === id);

      if (!group) {
        return res.status(404).json({ error: 'Không tìm thấy nhóm chi tiêu' });
      }

      const allMembers = dbInstance.getGroupMembers();
      const isMember = allMembers.some(m => m.groupId === id && m.userId === userId);
      if (!isMember) {
        return res.status(403).json({ error: 'Bạn không phải là thành viên nhóm này' });
      }

      const allExpenses = dbInstance.getGroupExpenses();
      const groupExpenses = allExpenses.filter(e => e.groupId === id);

      // Construct CSV
      let csvContent = '\uFEFF'; // UTF-8 BOM
      csvContent += 'Mã giao dịch,Nội dung chi tiêu,Người trả,Số tiền (VND),Ngày chi,Kiểu phân chia\n';

      groupExpenses.forEach(exp => {
        csvContent += `"${exp.id}","${exp.description.replace(/"/g, '""')}","${exp.paidByName.replace(/"/g, '""')}",${exp.amount},"${exp.date}","${exp.splitType}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=LichSuNhom_${id}.csv`);
      res.send(csvContent);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
