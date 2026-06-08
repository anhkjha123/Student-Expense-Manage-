import { Response } from 'express';
import { AuthenticatedRequest } from './auth';
import { dbInstance } from './db';
import { RecurringExpense, Expense } from '../types';

export const recurringController = {
  getRecurringExpenses: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const recurrings = dbInstance.getRecurringExpenses().filter(r => r.userId === userId);
      res.json(recurrings);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  createRecurringExpense: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { amount, categoryId, title, cycle, startDate } = req.body;
      if (!amount || !categoryId || !title || !cycle || !startDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newRec: RecurringExpense = {
        id: `rec_${Date.now()}`,
        userId,
        amount: Number(amount),
        categoryId,
        title,
        cycle,
        startDate,
        nextDate: startDate, // first generation will happen on or after startDate
        isActive: true
      };

      dbInstance.saveRecurringExpense(newRec);
      res.status(201).json(newRec);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  updateRecurringExpense: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { id } = req.params;
      const { amount, categoryId, title, cycle, startDate, nextDate, isActive } = req.body;

      const existing = dbInstance.getRecurringExpenses().find(r => r.id === id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: 'Not found' });
      }

      const updated: RecurringExpense = {
        ...existing,
        amount: amount !== undefined ? Number(amount) : existing.amount,
        categoryId: categoryId || existing.categoryId,
        title: title || existing.title,
        cycle: cycle || existing.cycle,
        startDate: startDate || existing.startDate,
        nextDate: nextDate || existing.nextDate,
        isActive: isActive !== undefined ? !!isActive : existing.isActive
      };

      dbInstance.saveRecurringExpense(updated);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  deleteRecurringExpense: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { id } = req.params;
      const existing = dbInstance.getRecurringExpenses().find(r => r.id === id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: 'Not found' });
      }

      dbInstance.deleteRecurringExpense(id);
      res.json({ message: 'Deleted', id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  processRecurring: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const today = new Date().toISOString().split('T')[0];
      const recurrings = dbInstance.getRecurringExpenses().filter(r => r.userId === userId && r.isActive);
      let generatedCount = 0;

      for (const rec of recurrings) {
        // If nextDate is today or in the past
        if (rec.nextDate <= today) {
          // Generate an expense
          const newExpense: Expense = {
            id: `exp_rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            userId,
            amount: rec.amount,
            categoryId: rec.categoryId,
            title: rec.title,
            date: rec.nextDate,
            note: 'Tạo tự động từ khoản chi lặp lại',
            isNecessary: true // usually fixed expenses are necessary
          };
          dbInstance.saveExpense(newExpense);
          generatedCount++;

          // Calculate next date
          const nextD = new Date(rec.nextDate);
          if (rec.cycle === 'monthly') {
            nextD.setMonth(nextD.getMonth() + 1);
          } else if (rec.cycle === 'weekly') {
            nextD.setDate(nextD.getDate() + 7);
          }
          
          rec.nextDate = nextD.toISOString().split('T')[0];
          dbInstance.saveRecurringExpense(rec);
        }
      }

      res.json({ message: 'Processed', generated: generatedCount });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
