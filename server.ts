import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { authController, authMiddleware } from './src/server/auth';
import { expensesController } from './src/server/expenses';
import { budgetsController } from './src/server/budgets';
import { reportsController } from './src/server/reports';
import { savingGoalsController } from './src/server/savingGoals';
import { incomesController } from './src/server/incomes';
import { walletController } from './src/server/wallet';
import { insightsController } from './src/server/insights';
import { recurringExpensesController, checkAndGenerateRecurringExpenses } from './src/server/recurringExpenses';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cấu hình phân tích nhân body JSON
  app.use(express.json());

  // --- API ROUTING SYSTEMS (S1, S2, S3 APIs) ---

  // 1. Authentication (Sprint 1)
  app.post('/api/auth/register', authController.register); // S1-03
  app.post('/api/auth/login', authController.login);       // S1-04

  // 2. Expenses (Sprint 1) - Protected by authMiddleware
  app.get('/api/expenses', authMiddleware as any, expensesController.getExpenses);       // S1-14
  app.post('/api/expenses', authMiddleware as any, expensesController.createExpense);     // S1-15
  app.put('/api/expenses/:id', authMiddleware as any, expensesController.updateExpense);  // S1-16
  app.delete('/api/expenses/:id', authMiddleware as any, expensesController.deleteExpense); // S1-17

  // 3. Budgets (Sprint 2) - Protected by authMiddleware
  app.get('/api/budgets', authMiddleware as any, budgetsController.getBudgets);           // S2-04
  app.post('/api/budgets', authMiddleware as any, budgetsController.saveBudgets);         // S2-03, S2-05

  // 4. Reports & Statistics (Sprint 3) - Protected by authMiddleware
  app.get('/api/reports/monthly', authMiddleware as any, reportsController.getMonthlyReport); // S3-03
  app.get('/api/reports/weekly', authMiddleware as any, reportsController.getWeeklyReport);   // S3-04
  app.get('/api/reports/category-stats', authMiddleware as any, reportsController.getCategoryStats); // S3-05
  app.get('/api/reports/top-spending', authMiddleware as any, reportsController.getTopCategory);    // S3-06
  
  // 5. PDF & Excel Exports (Sprint 3)
  app.get('/api/reports/export/pdf', authMiddleware as any, reportsController.exportPDF);     // S3-15
  app.get('/api/reports/export/excel', authMiddleware as any, reportsController.exportExcel); // S3-16

  // Bộ định tuyến kiểm tra tình trạng máy chủ
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // --- SPRINT 4 APIs ---
  // 6. Saving Goals
  app.get('/api/saving-goals', authMiddleware as any, savingGoalsController.getSavingGoals);
  app.post('/api/saving-goals', authMiddleware as any, savingGoalsController.createSavingGoal);
  app.put('/api/saving-goals/:id', authMiddleware as any, savingGoalsController.updateSavingGoal);
  app.delete('/api/saving-goals/:id', authMiddleware as any, savingGoalsController.deleteSavingGoal);
  app.get('/api/saving-goals/:id/progress', authMiddleware as any, savingGoalsController.getProgress);

  // 7. Incomes
  app.get('/api/incomes', authMiddleware as any, incomesController.getIncomes);
  app.post('/api/incomes', authMiddleware as any, incomesController.createIncome);
  app.put('/api/incomes/:id', authMiddleware as any, incomesController.updateIncome);
  app.delete('/api/incomes/:id', authMiddleware as any, incomesController.deleteIncome);

  // 8. Wallet Balance & Cashflow
  app.get('/api/wallet/balance', authMiddleware as any, walletController.getBalance);
  app.get('/api/wallet/cashflow', authMiddleware as any, walletController.getCashFlow);

  // 9. Spending Insights
  app.get('/api/insights/spending', authMiddleware as any, insightsController.getSpendingInsights);

  // 10. Recurring Expenses
  app.get('/api/recurring-expenses', authMiddleware as any, recurringExpensesController.getRecurringExpenses);
  app.post('/api/recurring-expenses', authMiddleware as any, recurringExpensesController.createRecurringExpense);
  app.put('/api/recurring-expenses/:id', authMiddleware as any, recurringExpensesController.updateRecurringExpense);
  app.delete('/api/recurring-expenses/:id', authMiddleware as any, recurringExpensesController.deleteRecurringExpense);

  // Bật bộ kiểm tra recurring expenses mỗi phút
  setInterval(() => {
    checkAndGenerateRecurringExpenses();
  }, 60 * 1000);
  // Run once immediately
  checkAndGenerateRecurringExpenses();

  // --- VITE INTERCEPTOR DEV MIDDLEWARE vs STANDALONE STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OK] Student Expense Manager Server is booted on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CRITICAL] Error booting Express fullstack server:', err);
});
