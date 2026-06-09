import { Request, Response } from 'express';
import { dbInstance } from './db';
import { Income } from '../types';

export const incomesController = {
  getIncomes: (req: Request, res: Response) => {
    const userId = (req as any).user?.id || 'user_01';
    const month = req.query.month as string;
    const source = req.query.source as string;
    
    let incomes = dbInstance.getIncomes().filter(i => i.userId === userId);

    if (month) {
      incomes = incomes.filter(i => i.date.startsWith(month));
    }
    
    if (source) {
      incomes = incomes.filter(i => i.source === source);
    }

    res.json(incomes);
  },

  createIncome: (req: Request, res: Response) => {
    const userId = (req as any).user?.id || 'user_01';
    const newIncome: Income = {
      ...req.body,
      id: `inc_${Date.now()}`,
      userId
    };
    dbInstance.saveIncome(newIncome);
    res.status(201).json(newIncome);
  },

  updateIncome: (req: Request, res: Response) => {
    const userId = (req as any).user?.id || 'user_01';
    const { id } = req.params;
    const incomes = dbInstance.getIncomes().filter(i => i.userId === userId);
    const existing = incomes.find(i => i.id === id);

    if (!existing) {
      return res.status(404).json({ error: 'Income not found' });
    }

    const updated = { ...existing, ...req.body };
    dbInstance.saveIncome(updated);
    res.json(updated);
  },

  deleteIncome: (req: Request, res: Response) => {
    const { id } = req.params;
    const success = dbInstance.deleteIncome(id);
    if (success) {
      res.json({ message: 'Deleted successfully' });
    } else {
      res.status(404).json({ error: 'Income not found' });
    }
  }
};
