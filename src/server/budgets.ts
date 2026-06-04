import { Response } from 'express';
import { AuthenticatedRequest } from './auth';
import { dbInstance } from './db';
import { Budget, Notification } from '../types';

export const budgetsController = {
  // S2-04: API Get Budget
  getBudgets: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const allBudgets = dbInstance.getBudgets();
      const userBudgets = allBudgets
        .filter(b => b.userId === userId)
        .map(b => ({
          categoryId: b.categoryId,
          amount: b.amount
        }));

      res.json(userBudgets);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  // S2-03, S2-05: API Create, Update Budgets (Save a full list)
  saveBudgets: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const { budgets } = req.body; // Mảng budgets: { categoryId, amount }[]
      if (!Array.isArray(budgets)) {
        return res.status(400).json({ error: 'Đầu vào budgets phải là một danh sách hợp lệ' });
      }

      dbInstance.saveBudgetsForUser(userId, budgets);

      // Phát sinh thông báo thành công hạn mức mới
      const newNotif: Notification = {
        id: `notif_sys_${Date.now()}_budget_upd`,
        userId,
        type: 'success',
        title: 'Cập nhật hạn mức thành công!',
        message: 'Bạn vừa lưu cấu hình phân phối hạn mức ngân sách thông minh tháng này.',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        read: false
      };
      dbInstance.saveNotification(newNotif);

      res.json({ message: 'Lưu ngân sách hạn mức thành công', budgets });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
