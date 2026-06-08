import { Response } from 'express';
import { AuthenticatedRequest } from './auth';
import { dbInstance } from './db';
import { SpendingInsight, Expense } from '../types';

export const insightsController = {
  getInsights: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const month = req.query.month as string;
      if (!month) {
        return res.status(400).json({ error: 'Month parameter is required (YYYY-MM)' });
      }

      // Calculate previous month
      const [y, m] = month.split('-');
      let prevM = parseInt(m, 10) - 1;
      let prevY = parseInt(y, 10);
      if (prevM === 0) {
        prevM = 12;
        prevY -= 1;
      }
      const prevMonth = `${prevY}-${prevM.toString().padStart(2, '0')}`;

      const allExpenses = dbInstance.getExpenses().filter(e => e.userId === userId);
      const currentExpenses = allExpenses.filter(e => e.date.startsWith(month));
      const prevExpenses = allExpenses.filter(e => e.date.startsWith(prevMonth));

      const insights: SpendingInsight[] = [];

      // Insight 1: Category spike > 20%
      const currentCatMap: Record<string, number> = {};
      currentExpenses.forEach(e => {
        currentCatMap[e.categoryId] = (currentCatMap[e.categoryId] || 0) + e.amount;
      });

      const prevCatMap: Record<string, number> = {};
      prevExpenses.forEach(e => {
        prevCatMap[e.categoryId] = (prevCatMap[e.categoryId] || 0) + e.amount;
      });

      for (const [catId, currentAmt] of Object.entries(currentCatMap)) {
        const prevAmt = prevCatMap[catId] || 0;
        if (prevAmt > 0) {
          const increase = (currentAmt - prevAmt) / prevAmt;
          if (increase > 0.2) {
            insights.push({
              id: `ins_${catId}_spike`,
              title: `Tăng đột biến chi tiêu`,
              description: `Danh mục này tăng ${(increase * 100).toFixed(1)}% so với tháng trước. Hãy xem xét cắt giảm để tránh thâm hụt.`,
              type: 'warning',
              categoryId: catId
            });
          }
        }
      }

      // Insight 2: Highest spending day
      const dayMap: Record<string, number> = {};
      currentExpenses.forEach(e => {
        dayMap[e.date] = (dayMap[e.date] || 0) + e.amount;
      });
      let maxDay = '';
      let maxAmt = 0;
      for (const [date, amt] of Object.entries(dayMap)) {
        if (amt > maxAmt) {
          maxAmt = amt;
          maxDay = date;
        }
      }
      if (maxAmt > 500000) {
        insights.push({
          id: `ins_max_day`,
          title: `Ngày chi nhiều nhất`,
          description: `Bạn đã chi ${new Intl.NumberFormat('vi-VN').format(maxAmt)}đ vào ngày ${maxDay}. Có phải là khoản chi bắt buộc không?`,
          type: 'info'
        });
      }

      // Insight 3: Good saving habit (if expenses are low)
      const totalCurrent = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalPrev = prevExpenses.reduce((sum, e) => sum + e.amount, 0);
      if (totalCurrent > 0 && totalCurrent < totalPrev * 0.9) {
         insights.push({
          id: `ins_good_habit`,
          title: `Chi tiêu đang tốt hơn!`,
          description: `Bạn đang tiêu ít hơn ${(100 - (totalCurrent / totalPrev) * 100).toFixed(1)}% so với tháng trước. Chúc mừng bạn đã tiết kiệm được nhiều hơn!`,
          type: 'success'
        });
      }

      // Return a max of 4 insights to keep UI clean
      res.json(insights.slice(0, 4));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
