import { Request, Response } from 'express';
import { dbInstance } from './db';

export const walletController = {
  getBalance: (req: Request, res: Response) => {
    const userId = (req as any).user?.id || 'user_01';
    const month = req.query.month as string; // YYYY-MM
    
    let incomes = dbInstance.getIncomes().filter(i => i.userId === userId);
    let expenses = dbInstance.getExpenses().filter(e => e.userId === userId);

    if (month) {
      incomes = incomes.filter(i => i.date.startsWith(month));
      expenses = expenses.filter(e => e.date.startsWith(month));
    }

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.filter(e => !e.isRecurring).reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpense;

    res.json({
      balance,
      totalIncome,
      totalExpense
    });
  },

  getCashFlow: (req: Request, res: Response) => {
    const userId = (req as any).user?.id || 'user_01';
    const month = req.query.month as string; // YYYY-MM

    if (!month) {
      return res.status(400).json({ error: 'Month parameter is required (YYYY-MM)' });
    }

    const incomes = dbInstance.getIncomes().filter(i => i.userId === userId && i.date.startsWith(month));
    const expenses = dbInstance.getExpenses().filter(e => e.userId === userId && e.date.startsWith(month));

    // Group by day
    const flowMap: Record<string, { income: number; expense: number }> = {};
    
    // Get days in month
    const [yearStr, monthStr] = month.split('-');
    const daysInMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${month}-${day.toString().padStart(2, '0')}`;
      flowMap[dateStr] = { income: 0, expense: 0 };
    }

    incomes.forEach(i => {
      if (flowMap[i.date]) flowMap[i.date].income += i.amount;
    });

    expenses.forEach(e => {
      if (flowMap[e.date]) flowMap[e.date].expense += e.amount;
    });

    const result = Object.keys(flowMap).sort().map(date => ({
      date,
      income: flowMap[date].income,
      expense: flowMap[date].expense
    }));

    res.json(result);
  }
};
