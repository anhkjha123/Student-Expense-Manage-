import { Response } from 'express';
import { AuthenticatedRequest } from './auth';
import { dbInstance } from './db';
import { Income } from '../types';

export const incomesController = {
  getIncomes: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const month = req.query.month as string; // Optional: YYYY-MM filter

      let incomes = dbInstance.getIncomes().filter(i => i.userId === userId);
      
      if (month) {
        incomes = incomes.filter(i => i.date.startsWith(month));
      }

      res.json(incomes);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  createIncome: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { amount, source, date, note } = req.body;
      if (!amount || !source || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newIncome: Income = {
        id: `inc_${Date.now()}`,
        userId,
        amount: Number(amount),
        source,
        date,
        note: note || ''
      };

      dbInstance.saveIncome(newIncome);
      res.status(201).json(newIncome);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  updateIncome: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { id } = req.params;
      const { amount, source, date, note } = req.body;

      const existing = dbInstance.getIncomes().find(i => i.id === id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: 'Not found' });
      }

      const updated: Income = {
        ...existing,
        amount: amount !== undefined ? Number(amount) : existing.amount,
        source: source || existing.source,
        date: date || existing.date,
        note: note !== undefined ? note : existing.note
      };

      dbInstance.saveIncome(updated);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  deleteIncome: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { id } = req.params;
      const existing = dbInstance.getIncomes().find(i => i.id === id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: 'Not found' });
      }

      dbInstance.deleteIncome(id);
      res.json({ message: 'Deleted', id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
