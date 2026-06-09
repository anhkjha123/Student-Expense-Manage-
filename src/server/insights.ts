import { Request, Response } from 'express';
import { dbInstance } from './db';

export const insightsController = {
  getSpendingInsights: (req: Request, res: Response) => {
    const userId = (req as any).user?.id || 'user_01';
    
    // For simplicity, we just use the current server date.
    // In a real app, it might be passed as a parameter.
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Get last month string
    let lastMonth = now.getMonth();
    let lastYear = now.getFullYear();
    if (lastMonth === 0) {
      lastMonth = 12;
      lastYear -= 1;
    }
    const lastMonthStr = `${lastYear}-${lastMonth.toString().padStart(2, '0')}`;

    const expenses = dbInstance.getExpenses().filter(e => e.userId === userId && !e.isRecurring);
    
    const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthStr));
    const lastMonthExpenses = expenses.filter(e => e.date.startsWith(lastMonthStr));

    const insights: Array<{ id: string, type: 'warning' | 'info' | 'success', message: string, categoryId?: string }> = [];

    // 1. Analyze Category Increase > 20%
    const currentCatMap: Record<string, number> = {};
    const lastCatMap: Record<string, number> = {};

    currentMonthExpenses.forEach(e => {
      currentCatMap[e.categoryId] = (currentCatMap[e.categoryId] || 0) + e.amount;
    });
    lastMonthExpenses.forEach(e => {
      lastCatMap[e.categoryId] = (lastCatMap[e.categoryId] || 0) + e.amount;
    });

    Object.keys(currentCatMap).forEach(catId => {
      const currentAmt = currentCatMap[catId];
      const lastAmt = lastCatMap[catId] || 0;
      if (lastAmt > 0) {
        const increase = (currentAmt - lastAmt) / lastAmt;
        if (increase > 0.2) {
          insights.push({
            id: `insight_cat_${catId}`,
            type: 'warning',
            message: `Chi tiêu danh mục này đã tăng ${Math.round(increase * 100)}% so với tháng trước. Bạn nên cân nhắc cắt giảm!`,
            categoryId: catId
          });
        }
      }
    });

    // 2. Find highest spending day
    const dayMap: Record<string, number> = {};
    currentMonthExpenses.forEach(e => {
      dayMap[e.date] = (dayMap[e.date] || 0) + e.amount;
    });
    
    let maxDay = '';
    let maxAmount = 0;
    Object.keys(dayMap).forEach(date => {
      if (dayMap[date] > maxAmount) {
        maxAmount = dayMap[date];
        maxDay = date;
      }
    });

    if (maxDay && maxAmount > 0) {
      insights.push({
        id: 'insight_max_day',
        type: 'info',
        message: `Ngày ${maxDay} bạn đã chi nhiều nhất với số tiền ${maxAmount.toLocaleString()}đ. Hãy cẩn thận các ngày mua sắm lớn nhé!`
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: 'insight_good',
        type: 'success',
        message: 'Tuyệt vời! Thói quen chi tiêu của bạn trong tháng này rất ổn định và không có dấu hiệu bất thường.'
      });
    }

    res.json(insights);
  }
};
