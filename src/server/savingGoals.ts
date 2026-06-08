import { Response } from 'express';
import { AuthenticatedRequest } from './auth';
import { dbInstance } from './db';
import { SavingGoal } from '../types';

export const savingGoalsController = {
  getSavingGoals: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const goals = dbInstance.getSavingGoals().filter(g => g.userId === userId);
      res.json(goals);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  createSavingGoal: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { name, targetAmount, deadline } = req.body;
      if (!name || !targetAmount || !deadline) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newGoal: SavingGoal = {
        id: `sg_${Date.now()}`,
        userId,
        name,
        targetAmount: Number(targetAmount),
        currentAmount: 0,
        deadline,
        status: 'on_track'
      };

      dbInstance.saveSavingGoal(newGoal);
      res.status(201).json(newGoal);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  updateSavingGoal: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { id } = req.params;
      const { name, targetAmount, currentAmount, deadline, status } = req.body;

      const existing = dbInstance.getSavingGoals().find(g => g.id === id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: 'Not found' });
      }

      const updated: SavingGoal = {
        ...existing,
        name: name || existing.name,
        targetAmount: targetAmount !== undefined ? Number(targetAmount) : existing.targetAmount,
        currentAmount: currentAmount !== undefined ? Number(currentAmount) : existing.currentAmount,
        deadline: deadline || existing.deadline,
        status: status || existing.status
      };

      dbInstance.saveSavingGoal(updated);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  deleteSavingGoal: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { id } = req.params;
      const existing = dbInstance.getSavingGoals().find(g => g.id === id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ error: 'Not found' });
      }

      dbInstance.deleteSavingGoal(id);
      res.json({ message: 'Deleted', id });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  getProgress: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { id } = req.params;
      const goal = dbInstance.getSavingGoals().find(g => g.id === id);
      if (!goal || goal.userId !== userId) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Calculate Wallet Balance
      const incomes = dbInstance.getIncomes().filter(i => i.userId === userId);
      const expenses = dbInstance.getExpenses().filter(e => e.userId === userId);
      
      const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
      const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
      let walletBalance = totalIncome - totalExpense;
      if (walletBalance < 0) walletBalance = 0;

      // Update currentAmount to min of wallet balance and target amount
      const currentAmount = Math.min(walletBalance, goal.targetAmount);
      
      const percent = (currentAmount / goal.targetAmount) * 100;
      
      const deadlineDate = new Date(goal.deadline);
      const today = new Date();
      const diffTime = deadlineDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Auto update status
      let status = 'on_track';
      if (percent >= 100) status = 'completed';
      else if (daysLeft < 7 && percent < 80) status = 'at_risk';

      const updatedGoal = { ...goal, currentAmount, status };
      dbInstance.saveSavingGoal(updatedGoal);

      res.json({
        currentAmount,
        targetAmount: goal.targetAmount,
        percent: Math.min(percent, 100),
        daysLeft,
        status
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
