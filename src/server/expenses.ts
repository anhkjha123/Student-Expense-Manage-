import { Response } from 'express';
import { AuthenticatedRequest } from './auth';
import { dbInstance } from './db';
import { Expense, Notification } from '../types';

export const expensesController = {
  // S1-14: API Get Expense
  getExpenses: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const allExpenses = dbInstance.getExpenses();
      const userExpenses = allExpenses.filter(e => e.userId === userId);

      res.json(userExpenses);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  // S1-15: API Create Expense
  createExpense: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const { amount, categoryId, title, date, note, isNecessary, isRecurring } = req.body;
      if (!amount || !categoryId || !title || !date) {
        return res.status(400).json({ error: 'Vui lòng điền các trường bắt buộc của khoản chi' });
      }

      const newExpense: Expense = {
        id: `exp_added_${Date.now()}`,
        userId,
        amount: Number(amount),
        categoryId,
        title,
        date,
        note: note || '',
        isNecessary: !!isNecessary,
        isRecurring: !!isRecurring
      };

      dbInstance.saveExpense(newExpense);

      // --- KIỂM TRA HẠN MỨC NGÂN SÁCH TRÊN SERVER (Auto-warning alerts at 80% and 100%) ---
      const budgets = dbInstance.getBudgets().filter(b => b.userId === userId);
      const catBudget = budgets.find(b => b.categoryId === categoryId);

      if (catBudget && catBudget.amount > 0) {
        const yearMonth = date.substring(0, 7); // yyyy-mm
        const catExpenses = dbInstance.getExpenses().filter(
          e => e.userId === userId && e.categoryId === categoryId && e.date.startsWith(yearMonth)
        );
        const totalSpent = catExpenses.reduce((s, item) => s + item.amount, 0);
        const percent = (totalSpent / catBudget.amount) * 100;

        // Bắn cảnh báo nếu chạm trần hoặc chạm ngưỡng
        if (percent >= 100) {
          const alertNotif: Notification = {
            id: `notif_sys_${Date.now()}_exceeded`,
            userId,
            type: 'alert',
            title: `VỢT QUÁ HẠN MỨC NGÂN SÁCH!`,
            message: `Chú ý: Bạn đã tiêu quá ${new Intl.NumberFormat('vi-VN').format(totalSpent)}đ trên mốc giới hạn ${new Intl.NumberFormat('vi-VN').format(catBudget.amount)}đ của danh mục này.`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 19),
            read: false
          };
          dbInstance.saveNotification(alertNotif);
        } else if (percent >= 80) { // S2-15 Cảnh báo 80%
          const warnNotif: Notification = {
            id: `notif_sys_${Date.now()}_warning_80`,
            userId,
            type: 'warning',
            title: `Cảnh báo: Sắp chạm trần hạn mức`,
            message: `Bạn đã sử dụng ${Math.round(percent)}% hạn mức dã gán của danh mục này tháng này (${new Intl.NumberFormat('vi-VN').format(totalSpent)}đ / ${new Intl.NumberFormat('vi-VN').format(catBudget.amount)}đ).`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 19),
            read: false
          };
          dbInstance.saveNotification(warnNotif);
        }
      }

      res.status(201).json(newExpense);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  // S1-16: API Update Expense
  updateExpense: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const { id } = req.params;
      const { amount, categoryId, title, date, note, isNecessary, isRecurring } = req.body;

      const allExpenses = dbInstance.getExpenses();
      const existing = allExpenses.find(e => e.id === id);

      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy khoản chi tiêu cần cập nhật' });
      }

      if (existing.userId !== userId) {
        return res.status(403).json({ error: 'Không có quyền chỉnh sửa khoản chi tiêu của người khác' });
      }

      const updatedExpense: Expense = {
        ...existing,
        amount: amount !== undefined ? Number(amount) : existing.amount,
        categoryId: categoryId || existing.categoryId,
        title: title || existing.title,
        date: date || existing.date,
        note: note !== undefined ? note : existing.note,
        isNecessary: isNecessary !== undefined ? !!isNecessary : existing.isNecessary,
        isRecurring: isRecurring !== undefined ? !!isRecurring : existing.isRecurring
      };

      dbInstance.saveExpense(updatedExpense);
      res.json(updatedExpense);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  // S1-17: API Delete Expense
  deleteExpense: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const { id } = req.params;
      const allExpenses = dbInstance.getExpenses();
      const existing = allExpenses.find(e => e.id === id);

      if (!existing) {
        return res.status(404).json({ error: 'Không tìm thấy khoản chi để xóa' });
      }

      if (existing.userId !== userId) {
        return res.status(403).json({ error: 'Không có quyền xóa khoản chi tiêu của người khác' });
      }

      dbInstance.deleteExpense(id);
      res.json({ message: 'Đã xóa khoản chi tiêu thành công', id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
