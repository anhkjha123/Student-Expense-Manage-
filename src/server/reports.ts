import { Response } from 'express';
import { AuthenticatedRequest } from './auth';
import { dbInstance } from './db';
import { Expense } from '../types';

export const reportsController = {
  // S3-03: API Monthly Report & S3-08 SQL Aggregation Queries
  getMonthlyReport: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const { month } = req.query; // Định dạng YYYY-MM (Ví dụ: 2026-06)
      const targetMonth = (month as string) || new Date().toISOString().substring(0, 7);

      const allExpenses = dbInstance.getExpenses();
      const userExpenses = allExpenses.filter(e => e.userId === userId && e.date.startsWith(targetMonth) && !e.isRecurring);

      // Thực thi bộ lọc tương đương câu truy vấn "SELECT categoryId, SUM(amount) FROM expenses GROUP BY categoryId"
      const aggregation: { [key: string]: number } = {};
      let totalSpent = 0;
      let spentNecessary = 0;
      let spentWants = 0;

      userExpenses.forEach(exp => {
        aggregation[exp.categoryId] = (aggregation[exp.categoryId] || 0) + exp.amount;
        totalSpent += exp.amount;
        if (exp.isNecessary) {
          spentNecessary += exp.amount;
        } else {
          spentWants += exp.amount;
        }
      });

      res.json({
        month: targetMonth,
        totalExpenses: userExpenses.length,
        totalSpent,
        spentNecessary,
        spentWants,
        categoryAggregation: aggregation
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  // S3-04: API Weekly Report
  getWeeklyReport: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const allExpenses = dbInstance.getExpenses();
      const userExpenses = allExpenses.filter(e => e.userId === userId && !e.isRecurring);

      // Phân bổ dòng tiền theo tuần (tính từ ngày 1 đến ngày 28 của tháng)
      // Tuần 1: Ngày 1-7, Tuần 2: Ngày 8-14, Tuần 3: Ngày 15-21, Tuần 4: Ngày 22+
      const weeks: { [key: string]: number } = {
        'Tuần 1': 0,
        'Tuần 2': 0,
        'Tuần 3': 0,
        'Tuần 4': 0
      };

      const currentMonth = new Date().toISOString().substring(0, 7);

      userExpenses.forEach(exp => {
        if (exp.date.startsWith(currentMonth)) {
          const day = parseInt(exp.date.split('-')[2]);
          if (day <= 7) weeks['Tuần 1'] += exp.amount;
          else if (day <= 14) weeks['Tuần 2'] += exp.amount;
          else if (day <= 21) weeks['Tuần 3'] += exp.amount;
          else weeks['Tuần 4'] += exp.amount;
        }
      });

      res.json({
        currentMonth,
        weeklyDistribution: weeks
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  // S3-05: API Category Statistics
  getCategoryStats: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const allExpenses = dbInstance.getExpenses();
      const userExpenses = allExpenses.filter(e => e.userId === userId && !e.isRecurring);

      const stats: { [key: string]: { amount: number; count: number } } = {};

      userExpenses.forEach(exp => {
        if (!stats[exp.categoryId]) {
          stats[exp.categoryId] = { amount: 0, count: 0 };
        }
        stats[exp.categoryId].amount += exp.amount;
        stats[exp.categoryId].count += 1;
      });

      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  // S3-06: API Top Spending Category
  getTopCategory: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Ngoại lệ phiên đăng nhập' });

      const allExpenses = dbInstance.getExpenses();
      const userExpenses = allExpenses.filter(e => e.userId === userId && !e.isRecurring);

      const totals: { [key: string]: number } = {};
      userExpenses.forEach(exp => {
        totals[exp.categoryId] = (totals[exp.categoryId] || 0) + exp.amount;
      });

      let topCategory = '';
      let topAmount = 0;

      Object.entries(totals).forEach(([catId, amount]) => {
        if (amount > topAmount) {
          topCategory = catId;
          topAmount = amount;
        }
      });

      res.json({
        topCategory,
        amount: topAmount
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  // S3-15: Export PDF (HTML Render Layout)
  exportPDF: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).send('Vui lòng đăng nhập');

      const user = dbInstance.getUsers().find(u => u.id === userId);
      if (!user) return res.status(404).send('Không tìm thấy user');

      const { month } = req.query;
      const targetMonth = (month as string) || new Date().toISOString().substring(0, 7);

      const expenses = dbInstance.getExpenses().filter(e => e.userId === userId && e.date.startsWith(targetMonth) && !e.isRecurring);
      const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

      // Trả về HTML biểu mẫu in báo cáo chuyên nghiệp
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Báo cáo tài chính cá nhân - ${user.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { margin: 0; color: #111827; }
            .header p { margin: 5px 0 0; color: #6b7280; font-size: 14px; }
            .user-info { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 15px; background: #f9fafb; border-radius: 8px; }
            .user-info div { font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #f3f4f6; color: #374151; font-weight: bold; text-align: left; padding: 12px; border-bottom: 1px solid #e5e7eb; }
            td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
            .total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 25px; color: #10b981; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
              🖨️ Xuất File PDF / In báo cáo
            </button>
          </div>
          <div class="header">
            <h1>BÁO CÁO CHI TIẾT CHI TIÊU CÁ NHÂN</h1>
            <p>Trình dữ liệu tổng phát sinh từ hệ thống Student Expense Manager - Tháng ${targetMonth}</p>
          </div>
          <div class="user-info">
            <div>
              <strong>Sinh viên:</strong> ${user.name}<br>
              <strong>Trường học:</strong> ${user.school}
            </div>
            <div>
              <strong>Thu nhập hằng tháng:</strong> ${new Intl.NumberFormat('vi-VN').format(user.monthlyIncome)}đ<br>
              <strong>Ngày lập báo cáo:</strong> ${new Date().toLocaleDateString('vi-VN')}
            </div>
          </div>

          <h2>DANH SÁCH LỊCH SỬ GIAO DỊCH CHINH PHỤC</h2>
          <table>
            <thead>
              <tr>
                <th>Ngày phát sinh</th>
                <th>Tên khoản chi</th>
                <th>Phân mục</th>
                <th>Số tiền</th>
                <th>Bắt buộc (Needs)</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map(e => `
                <tr>
                  <td>${e.date}</td>
                  <td>${e.title}</td>
                  <td>${e.categoryId}</td>
                  <td><strong>${new Intl.NumberFormat('vi-VN').format(e.amount)}đ</strong></td>
                  <td>${e.isNecessary ? 'Đúng' : 'Không'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            TỔNG THỰC CHI TIÊU ĐẠT: ${new Intl.NumberFormat('vi-VN').format(totalSpent)}đ
          </div>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },

  // S3-16: Export Excel (Unicode Tab-Separated/CSV for safe loading with UTF-8 BOM)
  exportExcel: (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).send('Vui lòng đăng nhập');

      const user = dbInstance.getUsers().find(u => u.id === userId);
      if (!user) return res.status(404).send('Không tìm thấy user');

      const { month } = req.query;
      const targetMonth = (month as string) || new Date().toISOString().substring(0, 7);

      const expenses = dbInstance.getExpenses().filter(e => e.userId === userId && e.date.startsWith(targetMonth) && !e.isRecurring);

      // Tạo cấu trúc chuỗi CSV chất lượng cao kèm UTF-8 BOM
      let csvContent = '\uFEFF'; // BOM chống lỗi font tiếng Việt trong Excel
      csvContent += 'Mã khoản chi,Lịch ngày,Chi tiết tiêu dùng,Mục đích danh mục,Nhóm phân loại,Số tiền chi (VND),Ghi chú thêm\n';

      expenses.forEach(e => {
        const titleEscaped = e.title.replace(/"/g, '""');
        const noteEscaped = (e.note || '').replace(/"/g, '""');
        const flowCategory = e.isNecessary ? 'Cần thiết (Needs)' : 'Mong muốn (Wants)';
        csvContent += `"${e.id}","${e.date}","${titleEscaped}","${e.categoryId}","${flowCategory}",${e.amount},"${noteEscaped}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=bao-cao-chi-tieu-${targetMonth}.csv`);
      res.status(200).send(csvContent);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  }
};
