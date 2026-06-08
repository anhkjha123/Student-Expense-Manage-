import { Response } from 'express';
import { AuthenticatedRequest } from './auth';
import { dbInstance } from './db';

export const walletController = {
  getBalance: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const month = req.query.month as string;

      let incomes = dbInstance.getIncomes().filter(i => i.userId === userId);
      let expenses = dbInstance.getExpenses().filter(e => e.userId === userId);

      if (month) {
        incomes = incomes.filter(i => i.date.startsWith(month));
        expenses = expenses.filter(e => e.date.startsWith(month));
      }

      const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
      const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

      res.json({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  getCashFlow: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const month = req.query.month as string;
      if (!month) {
        return res.status(400).json({ error: 'Month parameter is required (YYYY-MM)' });
      }

      const incomes = dbInstance.getIncomes().filter(i => i.userId === userId && i.date.startsWith(month));
      const expenses = dbInstance.getExpenses().filter(e => e.userId === userId && e.date.startsWith(month));

      // Group by date
      const flowMap: Record<string, { date: string, income: number, expense: number }> = {};

      // Initialize all dates in the month
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr, 10);
      const mon = parseInt(monthStr, 10);
      const daysInMonth = new Date(year, mon, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const dStr = `${month}-${i.toString().padStart(2, '0')}`;
        flowMap[dStr] = { date: dStr, income: 0, expense: 0 };
      }

      incomes.forEach(i => {
        if (flowMap[i.date]) {
          flowMap[i.date].income += i.amount;
        }
      });

      expenses.forEach(e => {
        if (flowMap[e.date]) {
          flowMap[e.date].expense += e.amount;
        }
      });

      const cashflow = Object.values(flowMap).sort((a, b) => a.date.localeCompare(b.date));

      res.json(cashflow);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
