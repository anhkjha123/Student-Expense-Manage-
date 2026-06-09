import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Coins, 
  PiggyBank, 
  Plus, 
  DollarSign,
  Activity,
  User,
  ShoppingBag,
  Bell,
  Utensils,
  Car,
  Home,
  Coffee,
  Pencil,
  Info
} from 'lucide-react';
import { User as UserType, Expense, Category, Budget, Notification, Income, RecurringExpense } from '../types';
import { motion } from 'motion/react';

interface DashboardProps {
  user: UserType;
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  notifications: Notification[];
  onOpenAddExpense: () => void;
  setActiveTab: (tab: string) => void;
  onEditExpense?: (expense: Expense) => void;
  recurringExpenses?: RecurringExpense[];
}

export default function Dashboard({
  user,
  expenses,
  categories,
  budgets,
  notifications,
  onOpenAddExpense,
  setActiveTab,
  onEditExpense,
  recurringExpenses = []
}: DashboardProps) {
  
  const [cashflow, setCashflow] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [variableIncomes, setVariableIncomes] = useState<Income[]>([]);
  const [tooltipVisible, setTooltipVisible] = useState<'income' | 'expense' | null>(null);

  // Load variable incomes (non-fixed) for current month from localStorage / API
  useEffect(() => {
    const currentMonthStr = new Date().toISOString().substring(0, 7);
    const token = localStorage.getItem('sem_token');

    const loadIncomesLocal = () => {
      const stored = localStorage.getItem(`sem_${user.id}_incomes`);
      if (stored) {
        try {
          const all: Income[] = JSON.parse(stored);
          setVariableIncomes(all.filter(i => i.date.startsWith(currentMonthStr)));
        } catch (_) {}
      }
    };

    if (token) {
      fetch(`/api/incomes?month=${currentMonthStr}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then((data: Income[]) => {
          setVariableIncomes(data);
          localStorage.setItem(`sem_${user.id}_incomes`, JSON.stringify(data));
        })
        .catch(loadIncomesLocal);

      // Fetch Cashflow (for the current month)
      fetch(`/api/wallet/cashflow?month=${currentMonthStr}`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setCashflow(data))
        .catch(console.error);

      // Fetch Insights
      fetch('/api/insights/spending', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setInsights(data))
        .catch(console.error);
    } else {
      loadIncomesLocal();
    }
  }, [user.id]);

  const currentDate = new Date();
  const currentMonthStr = currentDate.toISOString().substring(0, 7);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed
  const currentMonthExpenses = expenses.filter(exp => exp.date.startsWith(currentMonthStr));

  // --- Tính số tiền chi tiêu định kỳ phát sinh trong tháng hiện tại ---
  const recurringThisMonth = useMemo(() => {
    let total = 0;
    const items: Array<{ title: string; amount: number; cycle: string }> = [];
    for (const rec of recurringExpenses) {
      const start = new Date(rec.startDate + 'T00:00:00');
      // Must have started on or before this month
      if (start.getFullYear() > currentYear || (start.getFullYear() === currentYear && start.getMonth() > currentMonth)) {
        continue;
      }
      let occurrences = 0;
      if (rec.cycle === 'MONTHLY') {
        occurrences = 1;
      } else if (rec.cycle === 'WEEKLY') {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const startDow = start.getDay();
        for (let d = 1; d <= daysInMonth; d++) {
          const candidate = new Date(currentYear, currentMonth, d);
          if (candidate.getDay() === startDow && candidate >= start) occurrences++;
        }
      }
      if (occurrences > 0) {
        items.push({ title: rec.title, amount: rec.amount * occurrences, cycle: rec.cycle });
        total += rec.amount * occurrences;
      }
    }
    return { total, items };
  }, [recurringExpenses, currentYear, currentMonth]);

  // --- Thu = thu nhập cố định + thu nhập không cố định tháng này ---
  const variableIncomeTotal = variableIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalIncome = user.monthlyIncome + variableIncomeTotal; // Tổng thu
  
  // --- Chi = chi thường + chi định kỳ tháng này ---
  const loggedExpenseTotal = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalSpentThisMonth = loggedExpenseTotal + recurringThisMonth.total;

  const savingGoal = user.savingGoal;
  const availableToSpend = user.monthlyIncome - savingGoal; // Số tiền khả dụng cho chi tiêu (dựa trên income cố định)
  const walletBalance = totalIncome - totalSpentThisMonth; // Số dư ví thực tế
  const remainingBudget = availableToSpend - totalSpentThisMonth;

  // Tính thống kê chi tiêu Cần thiết vs Mong muốn của tháng hiện tại
  const spentNecessary = currentMonthExpenses.filter(e => e.isNecessary).reduce((sum, item) => sum + item.amount, 0);
  const spentWants = currentMonthExpenses.filter(e => !e.isNecessary).reduce((sum, item) => sum + item.amount, 0);

  // --- TÍNH TOÁN CHỈ SỐ AN TOÀN VÍ (Wallet Safety Gauge) ---
  const currentDay = currentDate.getDate();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  // Tốc độ chi tiêu lý thuyết tối đa hằng ngày sau khi trừ tiền thuê nhà cố định
  // Lấy tổng ngân sách khả dụng trừ đi tiền thuê nhà thực tế trong tháng
  const rentSpent = currentMonthExpenses.filter(e => e.categoryId === 'rent').reduce((sum, item) => sum + item.amount, 0);
  
  const variableBudget = availableToSpend - rentSpent; // Quỹ chi tiêu linh hoạt
  const variableSpent = totalSpentThisMonth - rentSpent; // Số tiền linh hoạt đã chi
  
  const dailySafeAllowance = variableBudget / daysInMonth; 
  const safeSpentUpToNow = dailySafeAllowance * currentDay;

  let walletStatus: 'safe' | 'warning' | 'danger' = 'safe';
  let walletStatusText = '';
  let walletStatusDescription = '';

  // Chấm điểm
  if (totalIncome <= 0) {
    walletStatus = 'warning';
    walletStatusText = '⚙️ Chưa cấu hình đầy đủ tài chính tháng này';
    walletStatusDescription = 'Hệ thống chưa nhận diện được mức thu nhập hằng tháng của bạn. Hãy sang tab "Cấu hình" thiết lập thu nhập và ngân sách chi tiêu khả dụng để kích hoạt tính năng đo lường chiếc ví nhé!';
  } else if (remainingBudget < 0) {
    walletStatus = 'danger';
    walletStatusText = '🚨 BÁO ĐỘNG ĐỎ: Vỡ ngân sách tháng!';
    walletStatusDescription = 'Bạn đã chi tiêu vượt quá mức thu nhập khả dụng cho phép của tháng này. Hãy lập tức dừng việc mua sắm không thiết yếu.';
  } else if (variableSpent > safeSpentUpToNow * 1.5) {
    walletStatus = 'danger';
    walletStatusText = '🚨 BÁO ĐỘNG VÍ: Tốc độ chi dùng quá nhanh!';
    walletStatusDescription = `Mới đầu tháng mà bạn đã chi tiêu linh hoạt hết ${new Intl.NumberFormat('vi-VN').format(variableSpent)}đ. Hãy phanh gấp các khoản chi trà sữa, giải trí để tránh rơi vào cảnh ăn mì tôm cuối tháng.`;
  } else if (variableSpent > safeSpentUpToNow) {
    walletStatus = 'warning';
    walletStatusText = '⚠️ CẢNH BÁO: Chi tiêu hơi nhanh';
    walletStatusDescription = 'Bạn đang tiêu vượt hạn mức an toàn theo ngày một chút. Nên kiềm chế ăn vặt hoặc mua sắm nhỏ nhặt trong vài ngày tới.';
  } else {
    walletStatus = 'safe';
    walletStatusText = '🌿 VÍ AN TOÀN: Đang kiểm soát siêu chuẩn!';
    walletStatusDescription = 'Tốc độ tiêu tiền của bạn rất lành mạnh và an toàn. Hãy duy trì thói quen ghi chép này để cuối tháng cầm chắc cục tiết kiệm mục tiêu nhé!';
  }

  // --- LẤY DANH SÁCH HẠN MỨC CHI TIÊU THEO DANH MỤC ---
  const categoryStats = categories.map(cat => {
    // Tiền hạn mức danh mục
    const limitObj = budgets.find(b => b.categoryId === cat.id);
    const limitAmount = limitObj ? limitObj.amount : 0;

    // Thực tế đã chi tiêu ở danh mục này trong tháng 6/2026
    const spentAmount = currentMonthExpenses
      .filter(exp => exp.categoryId === cat.id)
      .reduce((sum, item) => sum + item.amount, 0);

    const percent = limitAmount > 0 ? (spentAmount / limitAmount) * 100 : 0;

    return {
      ...cat,
      limitAmount,
      spentAmount,
      percent
    };
  });

  // Tìm các danh mục đã bị vượt ngân sách (hoặc sắp vượt > 90%)
  const overBudgetWarningList = categoryStats.filter(c => c.percent >= 90);

  // Giao dịch gần đây nhất (4 giao dịch mới nhất)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* Welcome Banner */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-emerald-400 to-emerald-400 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200 backdrop-blur-md"
      >
        <div className="space-y-1">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider font-mono shadow-inner border border-white/30">
            Hôm nay: {currentDate.toLocaleDateString('vi-VN')}
          </span>
          <h2 className="font-display text-2xl font-extrabold tracking-tight drop-shadow-md">
            Chào {user.name}! 📚
          </h2>
          <p className="text-xs text-emerald-50 max-w-prose leading-relaxed drop-shadow-sm">
            Hôm nay là ngày {currentDay} của tháng. Hãy lưu ý chi tiêu trong khoảng cho phép và ghi chép đầy đủ nhé!
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenAddExpense}
          className="rounded-2xl bg-white hover:bg-emerald-50 px-6 py-3.5 text-center text-sm font-bold text-emerald-600 transition-all shadow-lg shrink-0 cursor-pointer border border-white/20"
        >
          ✍️ Thêm một khoản chi ngay
        </motion.button>
      </motion.div>

      {/* CORE FINANCIAL OVERVIEW CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Wallet Balance Box */}
        <motion.div 
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
          className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-sm relative overflow-hidden transition-all duration-300 text-white"
        >
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 font-mono">
                Số Dư Ví Tháng Này
              </span>
              <div className={`text-3xl font-black font-mono drop-shadow-md ${walletBalance < 0 ? 'text-red-200' : ''}`}>
                {walletBalance < 0 ? '-' : ''}{new Intl.NumberFormat('vi-VN').format(Math.abs(walletBalance))}đ
              </div>
            </div>
            <span className="p-3 bg-white/20 text-white rounded-2xl shadow-inner border border-white/30 backdrop-blur-sm">
              <DollarSign className="h-5 w-5" />
            </span>
          </div>
          <div className="absolute -bottom-4 -right-4 text-white/10 pointer-events-none transform -rotate-12">
            <DollarSign className="h-32 w-32" />
          </div>

          {/* Thu / Chi row with hover tooltips */}
          <div className="flex justify-between text-[10px] text-emerald-50 font-semibold mt-4 pt-3 border-t border-emerald-400/50 relative z-10 gap-2">
            {/* THU tooltip */}
            <div
              className="relative cursor-help flex items-center gap-0.5"
              onMouseEnter={() => setTooltipVisible('income')}
              onMouseLeave={() => setTooltipVisible(null)}
            >
              <span>Thu: +{new Intl.NumberFormat('vi-VN').format(totalIncome)}đ</span>
              <Info className="h-2.5 w-2.5 text-emerald-200" />
              {tooltipVisible === 'income' && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900/95 backdrop-blur-sm text-white rounded-xl p-3 shadow-2xl border border-white/10 text-[10px] leading-relaxed z-50 pointer-events-none">
                  <div className="font-bold text-emerald-300 mb-2 text-xs">📥 Phân tích Thu nhập tháng</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Thu nhập cố định (ngân sách):</span>
                      <span className="font-mono text-emerald-400">+{new Intl.NumberFormat('vi-VN').format(user.monthlyIncome)}đ</span>
                    </div>
                    {variableIncomes.length > 0 ? variableIncomes.map(inc => (
                      <div key={inc.id} className="flex justify-between">
                        <span className="text-slate-300 truncate max-w-[140px]">{inc.note || (inc.source === 'SCHOLARSHIP' ? 'Học bổng' : inc.source === 'PART_TIME' ? 'Làm thêm' : inc.source === 'FAMILY' ? 'Gia đình' : 'Khác')}:</span>
                        <span className="font-mono text-emerald-400">+{new Intl.NumberFormat('vi-VN').format(inc.amount)}đ</span>
                      </div>
                    )) : (
                      <div className="text-slate-400 italic">Không có thu nhập biến động tháng này</div>
                    )}
                    <div className="border-t border-white/10 pt-1.5 flex justify-between font-bold">
                      <span className="text-white">= Tổng thu:</span>
                      <span className="font-mono text-emerald-300">+{new Intl.NumberFormat('vi-VN').format(totalIncome)}đ</span>
                    </div>
                  </div>
                  <div className="absolute bottom-[-4px] left-4 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10" />
                </div>
              )}
            </div>

            {/* CHI tooltip */}
            <div
              className="relative cursor-help flex items-center gap-0.5"
              onMouseEnter={() => setTooltipVisible('expense')}
              onMouseLeave={() => setTooltipVisible(null)}
            >
              <Info className="h-2.5 w-2.5 text-emerald-200" />
              <span>Chi: -{new Intl.NumberFormat('vi-VN').format(totalSpentThisMonth)}đ</span>
              {tooltipVisible === 'expense' && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-900/95 backdrop-blur-sm text-white rounded-xl p-3 shadow-2xl border border-white/10 text-[10px] leading-relaxed z-50 pointer-events-none">
                  <div className="font-bold text-red-300 mb-2 text-xs">📤 Phân tích Chi tiêu tháng</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Chi tiêu thông thường:</span>
                      <span className="font-mono text-red-400">-{new Intl.NumberFormat('vi-VN').format(loggedExpenseTotal)}đ</span>
                    </div>
                    {recurringThisMonth.items.length > 0 ? (
                      <>
                        <div className="text-slate-400 text-[9px] pt-0.5">Chi tiêu định kỳ:</div>
                        {recurringThisMonth.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between pl-2">
                            <span className="text-slate-300 truncate max-w-[140px]">🔄 {item.title}:</span>
                            <span className="font-mono text-red-400">-{new Intl.NumberFormat('vi-VN').format(item.amount)}đ</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-slate-400 italic">Không có chi tiêu định kỳ tháng này</div>
                    )}
                    <div className="border-t border-white/10 pt-1.5 flex justify-between font-bold">
                      <span className="text-white">= Tổng chi:</span>
                      <span className="font-mono text-red-300">-{new Intl.NumberFormat('vi-VN').format(totalSpentThisMonth)}đ</span>
                    </div>
                  </div>
                  <div className="absolute bottom-[-4px] right-4 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10" />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Total Spent Box */}
        <motion.div 
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
          className="rounded-3xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/30 p-5 shadow-sm relative overflow-hidden transition-all duration-300"
        >
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Đã tiêu tháng này
              </span>
              <div className="text-2xl font-black font-mono text-slate-900 drop-shadow-sm">
                {new Intl.NumberFormat('vi-VN').format(totalSpentThisMonth)}đ
              </div>
            </div>
            <span className="p-3 bg-rose-100 text-rose-600 rounded-2xl shadow-inner border border-rose-200">
              <TrendingDown className="h-5 w-5" />
            </span>
          </div>
          <div className="absolute -bottom-4 -right-4 text-rose-100/40 pointer-events-none transform -rotate-12">
            <TrendingDown className="h-24 w-24" />
          </div>
          <div className="text-[10px] text-slate-600 font-semibold mt-3 pt-3 border-t border-amber-100/50 relative z-10">
            Còn lại chi tiêu khả dụng: <strong className="text-amber-700 font-mono">{new Intl.NumberFormat('vi-VN').format(Math.max(0, remainingBudget))}đ</strong>
          </div>
        </motion.div>

        {/* Projected Savings Box */}
        <motion.div 
          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
          className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-5 shadow-sm relative overflow-hidden transition-all duration-300"
        >
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Dự kiến tích lũy cuối tháng
              </span>
              <div className={`text-2xl font-black font-mono drop-shadow-sm ${remainingBudget + savingGoal < savingGoal ? 'text-amber-600' : 'text-blue-700'}`}>
                {new Intl.NumberFormat('vi-VN').format(Math.max(0, remainingBudget + savingGoal))}đ
              </div>
            </div>
            <span className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-inner border border-blue-200">
              <PiggyBank className="h-5 w-5" />
            </span>
          </div>
          <div className="absolute -bottom-4 -right-4 text-blue-100/50 pointer-events-none transform -rotate-12">
            <PiggyBank className="h-24 w-24" />
          </div>
          <div className="text-[10px] text-slate-600 font-semibold mt-3 pt-3 border-t border-blue-100/50 relative z-10">
            Mục tiêu tích lũy ban đầu: <strong className="text-blue-700 font-mono">{new Intl.NumberFormat('vi-VN').format(savingGoal)}đ</strong>
          </div>
        </motion.div>
      </motion.div>

      {/* SPENDING INSIGHTS PANEL */}
      {insights.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map(insight => (
            <div key={insight.id} className={`rounded-2xl p-4 border flex items-start gap-3 shadow-sm ${
              insight.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
              insight.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
              'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              {insight.type === 'warning' ? <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" /> :
               insight.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" /> :
               <Activity className="h-5 w-5 shrink-0 text-blue-600" />}
              <div className="text-xs font-medium leading-relaxed">{insight.message}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* WALLET SAFETY GAUGE & NEEDS/WANTS PROGRESS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Wallet Speed Safety Gauge */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md md:col-span-7 lg:col-span-8 flex flex-col justify-between space-y-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600 animate-pulse-subtle" /> Chỉ số an toàn cháy ví sinh viên
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Thiết lập theo tốc độ trôi ngày</span>
          </div>

          <div className={`rounded-2xl p-4.5 border shadow-sm ${
            walletStatus === 'safe' 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : walletStatus === 'warning'
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-rose-50/80 border-rose-200 text-rose-900'
          }`}>
            <h4 className={`font-bold text-sm flex items-center gap-1.5 drop-shadow-sm`}>
              {walletStatus === 'safe' ? '🍏' : walletStatus === 'warning' ? '⚠️' : '🚨'} {walletStatusText}
            </h4>
            <p className="font-normal text-xs text-slate-700 mt-1 leading-relaxed">
              {walletStatusDescription}
            </p>
          </div>

          {/* Quick graphical calendar meter to explain why safety is styled this way */}
          <div className="space-y-1.5 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-600 shadow-inner">
            <div className="flex justify-between font-mono text-[10px] text-slate-400">
              <span>Đầu tháng (Ngày 1)</span>
              <span>Giữa tháng (Ngày 15)</span>
              <span>Cuối tháng (Ngày 30)</span>
            </div>
            {/* Horizontal timeline bar */}
            <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentDay / Math.max(daysInMonth, 1)) * 100}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute top-0 bottom-0 left-0 bg-emerald-500 rounded-full"
              />
            </div>
              <motion.span 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="absolute -top-1 h-4 w-4 rounded-full bg-slate-900 border-2 border-white shadow-md flex items-center justify-center text-[8px] text-white font-mono"
                style={{ left: `calc(${Math.min(100, (currentDay / Math.max(daysInMonth, 1)) * 100)}% - 8px)` }}
                title="Hôm nay"
              >
                {currentDay}
              </motion.span>
            <p className="text-[10px] text-slate-400 text-center font-normal pt-2">
              Bạn đang ở ngày <strong>{currentDay} / {daysInMonth}</strong> của tháng {currentMonthStr}. Ngân sách an toàn đến hôm nay: <strong>{new Intl.NumberFormat('vi-VN').format(safeSpentUpToNow)}đ</strong> (Đã tiêu: {new Intl.NumberFormat('vi-VN').format(variableSpent)}đ / {new Intl.NumberFormat('vi-VN').format(variableBudget)}đ).
            </p>
          </div>
        </div>

        {/* Needs vs Wants 50/30/20 Mini Circle */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md md:col-span-5 lg:col-span-4 space-y-4 hover:shadow-lg transition-shadow duration-300">
          <h3 className="font-display text-sm font-bold text-slate-800 drop-shadow-sm">
            Phân loại chi tiêu tháng này
          </h3>
          
          <div className="space-y-4 font-semibold text-slate-600">
            {/* Needs */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-700 font-bold flex items-center gap-1 drop-shadow-sm">🟢 Cần thiết (Needs)</span>
                <span className="font-mono text-slate-900">{new Intl.NumberFormat('vi-VN').format(spentNecessary)}đ</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${totalSpentThisMonth > 0 ? (spentNecessary / totalSpentThisMonth) * 100 : 0}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-emerald-500 rounded-full drop-shadow-sm" 
                />
              </div>
            </div>

            {/* Wants */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-amber-700 font-bold flex items-center gap-1 drop-shadow-sm">🟡 Mong muốn (Wants)</span>
                <span className="font-mono text-slate-900">{new Intl.NumberFormat('vi-VN').format(spentWants)}đ</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${totalSpentThisMonth > 0 ? (spentWants / totalSpentThisMonth) * 100 : 0}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full bg-amber-500 rounded-full drop-shadow-sm" 
                />
              </div>
            </div>

            <p className="text-[10.5px] leading-relaxed text-slate-400 font-normal">
              Lời khuyên: Để không cháy ví, hãy duy trì mức <strong className="text-emerald-700">Cần thiết</strong> đóng khung dưới 50% tổng ngân sách chu cấp hằng tháng.
            </p>
          </div>
        </div>
      </motion.div>

      {/* OVER BUDGET WARNINGS */}
      {overBudgetWarningList.length > 0 && (
        <motion.div 
          variants={itemVariants}
          className="rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-5 space-y-3 shadow-md"
        >
          <h4 className="font-display font-semibold text-red-800 text-sm flex items-center gap-2 drop-shadow-sm">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" /> Cảnh báo quan trọng: Vượt hạn mức danh mục!
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {overBudgetWarningList.map(cat => (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                key={cat.id} 
                className="bg-white rounded-2xl p-4 border border-red-100 text-xs font-semibold text-slate-700 shadow-sm"
                id={`over-budget-warning-${cat.id}`}
              >
                <div className="flex justify-between font-bold text-red-700">
                  <span> Hạn mục: {cat.name}</span>
                  <span>Tiêu {Math.round(cat.percent)}%</span>
                </div>
                <p className="font-normal text-[11px] text-slate-500 mt-1">
                  Đã tiêu {new Intl.NumberFormat('vi-VN').format(cat.spentAmount)}đ trên hạn mức cài đặt là {new Intl.NumberFormat('vi-VN').format(cat.limitAmount)}đ. 
                  Hãy hoãn lại mọi đơn chi tiêu danh mục này hằng ngày.
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CASH FLOW CHART & RECENT EXPENSES */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Cash Flow Area Chart (Mockup with CSS) */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md md:col-span-7 lg:col-span-7 space-y-4 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h3 className="font-display text-base font-bold text-slate-800 drop-shadow-sm">
              Dòng Tiền (Cash Flow)
            </h3>
          </div>
          <div className="h-48 w-full flex items-end gap-1 px-1 overflow-x-auto relative mt-4">
            {cashflow.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">Đang tải dữ liệu dòng tiền...</div>
            ) : (
              cashflow.map(day => {
                const isDeficit = day.expense > day.income;
                const total = Math.max(day.expense, day.income, 100000);
                const expHeight = (day.expense / total) * 100;
                const incHeight = (day.income / total) * 100;
                return (
                  <div key={day.date} className="flex-1 flex flex-col justify-end items-center group relative min-w-[12px]">
                    {/* Tooltip */}
                    <div className="absolute -top-12 bg-slate-800 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                      <div>{day.date.split('-').reverse().join('/')}</div>
                      <div className="text-emerald-400">Thu: +{new Intl.NumberFormat('vi-VN').format(day.income)}</div>
                      <div className="text-red-400">Chi: -{new Intl.NumberFormat('vi-VN').format(day.expense)}</div>
                    </div>
                    {/* Bars */}
                    <div className="w-full relative flex items-end h-full">
                      <div className={`absolute bottom-0 w-full bg-emerald-400/50 rounded-t-sm`} style={{ height: `${incHeight}%` }}></div>
                      <div className={`absolute bottom-0 w-full ${isDeficit ? 'bg-red-500' : 'bg-red-300/50'} rounded-t-sm`} style={{ height: `${expHeight}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex justify-center gap-4 text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400/50"></div> Thu nhập</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-300/50"></div> Chi tiêu</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Chi &gt; Thu (Thâm hụt)</span>
          </div>
        </div>
        
        {/* Categories Budget Limit Meters */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md md:col-span-7 lg:col-span-7 space-y-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
            <h3 className="font-display text-base font-bold text-slate-800 drop-shadow-sm">
              Theo dõi Ngân sách Danh mục hằng tháng
            </h3>
            <button
              onClick={() => setActiveTab('budget')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-2 py-1 rounded-lg"
            >
              Cài đặt hạn mức →
            </button>
          </div>

          <div className="space-y-4">
            {categoryStats.map(cat => {
              const isOver = cat.percent >= 100;
              const isHigh = cat.percent >= 90 && !isOver;

              return (
                <div key={cat.id} id={`dashboard-cat-meter-${cat.id}`} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5 drop-shadow-sm">
                      <span>
                        {cat.id === 'rent' && '🏠'}
                        {cat.id === 'food' && '🍲'}
                        {cat.id === 'study' && '📚'}
                        {cat.id === 'transport' && '🏍️'}
                        {cat.id === 'entertainment' && '🥤'}
                        {cat.id === 'shopping' && '🛍️'}
                        {cat.id === 'other' && '🔄'}
                      </span>
                      {cat.name}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      <strong className="text-slate-800 font-bold">{new Intl.NumberFormat('vi-VN').format(cat.spentAmount)}đ</strong> / {new Intl.NumberFormat('vi-VN').format(cat.limitAmount)}đ
                    </span>
                  </div>

                  {/* Meter scrollbar bar representing category spending */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(0, cat.percent))}%` }}
                      transition={{ duration: 1, type: "spring", stiffness: 50 }}
                      className={`h-full rounded-full transition-colors duration-300 drop-shadow-sm ${
                        isOver 
                          ? 'bg-red-500' 
                          : isHigh 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                      }`}
                    />
                    {isOver && (
                      <span className="absolute right-2 top-1 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Spendings List */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md md:col-span-5 lg:col-span-5 space-y-4 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h3 className="font-display text-base font-bold text-slate-800 drop-shadow-sm">
                Giao dịch chép gần đây
              </h3>
              <button
                onClick={() => setActiveTab('history')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-2 py-1 rounded-lg"
              >
                Xem chi tất cả →
              </button>
            </div>

            <div className="space-y-2.5">
              {recentExpenses.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Hiện bạn chưa ghi lại khoản chi dùng nào. Hãy thêm khoản chi đầu tiên nhé!
                </div>
              ) : (
                recentExpenses.map((exp, idx) => {
                  const catTheme = categories.find(c => c.id === exp.categoryId)?.color || 'bg-slate-50 text-slate-600';
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      key={exp.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 hover:bg-slate-50/80 transition-colors shadow-sm"
                      id={`recent-expense-${exp.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg font-bold shadow-inner ${catTheme}`}>
                          {exp.categoryId === 'rent' && '🏠'}
                          {exp.categoryId === 'food' && '🍲'}
                          {exp.categoryId === 'study' && '📚'}
                          {exp.categoryId === 'transport' && '🏍️'}
                          {exp.categoryId === 'entertainment' && '🥤'}
                          {exp.categoryId === 'shopping' && '🛍️'}
                          {exp.categoryId === 'other' && '🔄'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 drop-shadow-sm">{exp.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono block">{exp.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="text-right">
                          <span className="block text-xs font-black text-slate-900 font-mono drop-shadow-sm">
                            {new Intl.NumberFormat('vi-VN').format(exp.amount)}đ
                          </span>
                          {exp.isNecessary ? (
                            <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded shadow-sm">Cần thiết</span>
                          ) : (
                            <span className="text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded shadow-sm">Sở thích</span>
                          )}
                        </div>
                        {onEditExpense && (
                          <button
                            onClick={() => onEditExpense(exp)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer inline-flex shrink-0"
                            title="Sửa giao dịch"
                            id={`recent-edit-btn-${exp.id}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50">
            <p className="text-[10.5px] leading-relaxed text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-inner">
              💡 <strong>Thói quen tài chính:</strong> Việc viết ngay lập tức tốn chưa đầy 10 giây nhưng cứu bạn khỏi sự mơ hồ khoản tiền đã đi đâu!
            </p>
          </div>

        </div>

      </motion.div>

    </motion.div>
  );
}
