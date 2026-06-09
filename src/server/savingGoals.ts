import { Request, Response } from 'express';
import { dbInstance } from './db';
import { SavingGoal, Expense, Income } from '../types';

export const savingGoalsController = {
  getSavingGoals: (req: Request, res: Response) => {
    const userId = (req as any).user?.id || 'user_01';
    const goals = dbInstance.getSavingGoals().filter(g => g.userId === userId);
    res.json(goals);
  },

  createSavingGoal: (req: Request, res: Response) => {
    const userId = (req as any).user?.id || 'user_01';
    const newGoal: SavingGoal = {
      ...req.body,
      id: `goal_${Date.now()}`,
      userId,
      currentAmount: 0,
      status: 'On Track'
    };
    dbInstance.saveSavingGoal(newGoal);
    res.status(201).json(newGoal);
  },

  updateSavingGoal: (req: Request, res: Response) => {
    const userId = (req as any).user?.id || 'user_01';
    const { id } = req.params;
    const goals = dbInstance.getSavingGoals().filter(g => g.userId === userId);
    const existing = goals.find(g => g.id === id);

    if (!existing) {
      return res.status(404).json({ error: 'Saving goal not found' });
    }

    const updated = { ...existing, ...req.body };
    dbInstance.saveSavingGoal(updated);
    res.json(updated);
  },

  deleteSavingGoal: (req: Request, res: Response) => {
    const { id } = req.params;
    const success = dbInstance.deleteSavingGoal(id);
    if (success) {
      res.json({ message: 'Deleted successfully' });
    } else {
      res.status(404).json({ error: 'Saving goal not found' });
    }
  },

  getProgress: (req: Request, res: Response) => {
    const userId = (req as any).user?.id || 'user_01';
    const { id } = req.params;
    const goals = dbInstance.getSavingGoals().filter(g => g.userId === userId);
    const goal = goals.find(g => g.id === id);

    if (!goal) {
      return res.status(404).json({ error: 'Saving goal not found' });
    }

    // Calculate Wallet Balance = SUM(Income) - SUM(Expense)
    const incomes = dbInstance.getIncomes().filter(i => i.userId === userId);
    const expenses = dbInstance.getExpenses().filter(e => e.userId === userId);

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const walletBalance = Math.max(0, totalIncome - totalExpense);

    // According to DoD #2, currentAmount is based on walletBalance.
    // If wallet balance > target, progress is 100%.
    const currentAmount = Math.min(walletBalance, goal.targetAmount);
    let percent = Math.round((currentAmount / goal.targetAmount) * 100);
    if (percent > 100) percent = 100;

    // Calculate days left
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status = 'On Track';
    if (percent >= 100) status = 'Completed';
    else if (daysLeft < 30 && percent < 80) status = 'At Risk';

    res.json({
      currentAmount,
      targetAmount: goal.targetAmount,
      percent,
      daysLeft,
      status
    });
  }
};
