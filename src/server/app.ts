import express, { Request, Response } from 'express';
import { authController, authMiddleware } from './auth';
import { expensesController } from './expenses';
import { budgetsController } from './budgets';
import { reportsController } from './reports';
import { incomesController } from './incomes';
import { walletController } from './wallet';
import { insightsController } from './insights';
import { recurringExpensesController } from './recurringExpenses';
import { ocrController } from './ocrController';
import { groupsController } from './groups';

const app = express();

// Cấu hình phân tích nhân body JSON hỗ trợ ảnh hóa đơn base64 tối đa 15MB
app.use(express.json({ limit: '15mb' }));

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

// --- SPRINT 5 APIs ---
// OCR Scan Receipt (MH-02)
app.post('/api/expenses/scan-receipt', authMiddleware as any, ocrController.scanReceipt);

// Group split (SH-01)
app.post('/api/groups', authMiddleware as any, groupsController.createGroup);
app.get('/api/groups', authMiddleware as any, groupsController.getGroups);
app.get('/api/groups/:id', authMiddleware as any, groupsController.getGroup);
app.post('/api/groups/:id/invite', authMiddleware as any, groupsController.generateInvite);
app.post('/api/groups/:id/invite/revoke', authMiddleware as any, groupsController.revokeInvite);
app.post('/api/groups/join/:code', authMiddleware as any, groupsController.joinGroup);
app.get('/api/groups/join/:code', (req: Request, res: Response) => {
  res.redirect(`/?invite=${req.params.code}`);
});
app.post('/api/groups/:id/expenses', authMiddleware as any, groupsController.addGroupExpense);
app.post('/api/groups/:id/settle', authMiddleware as any, groupsController.settleDebt);
app.get('/api/groups/:id/export', authMiddleware as any, groupsController.exportCSV);

export default app;
