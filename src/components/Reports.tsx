import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  Award,
  Calendar,
  Layers,
  PieChart as ChartIcon,
  CheckCircle2
} from 'lucide-react';
import { Expense, Category, User } from '../types';
import { motion } from 'motion/react';

interface ReportsProps {
  expenses: Expense[];
  categories: Category[];
  user: User;
}

export default function Reports({
  expenses,
  categories,
  user
}: ReportsProps) {
  const currentDate = new Date();
  const currentMonthStr = currentDate.toISOString().substring(0, 7);
  
  const m1 = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const previousMonthStr = m1.toISOString().substring(0, 7);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr); // Mặc định tháng hiện tại

  const monthOptions = [
    { value: previousMonthStr, label: `Tháng ${m1.getMonth() + 1}, ${m1.getFullYear()} (Lịch sử)` },
    { value: currentMonthStr, label: `Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()} (Tháng hiện tại)` }
  ];

  // Lọc chi phí thuộc tháng đang chọn
  const monthlyExpenses = expenses.filter(exp => exp.date.startsWith(selectedMonth));

  const totalSpent = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = user.monthlyIncome;
  const savingPerformance = totalIncome - totalSpent;

  // Lấy chi tiết chi tiêu theo danh mục
  const categorySpentMap = categories.map(cat => {
    const amount = monthlyExpenses
      .filter(exp => exp.categoryId === cat.id)
      .reduce((sum, item) => sum + item.amount, 0);
    const percent = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
    return {
      ...cat,
      amount,
      percent
    };
  }).sort((a, b) => b.amount - a.amount); // Sắp xếp giảm dần để tìm khoản chi lớn nhất

  // Tìm khoản chi lớn nhất
  const biggestExpenseCategory = categorySpentMap[0];

  // Chia theo tỷ lệ Needs vs Wants của tháng đang lọc
  const spentNeeds = monthlyExpenses.filter(e => e.isNecessary).reduce((sum, item) => sum + item.amount, 0);
  const spentWants = monthlyExpenses.filter(e => !e.isNecessary).reduce((sum, item) => sum + item.amount, 0);
  const currentSavings = totalIncome - totalSpent;

  const percentNeeds = totalIncome > 0 ? (spentNeeds / totalIncome) * 100 : 0;
  const percentWants = totalIncome > 0 ? (spentWants / totalIncome) * 100 : 0;
  const percentSavings = totalIncome > 0 ? (currentSavings / totalIncome) * 100 : 0;

  // Thuật toán đề xuất tài chính thông minh dựa trên tỷ lệ thực tế
  const getAdvisorMessage = () => {
    if (percentNeeds > 60) {
      return {
        vibe: 'warning',
        title: 'Cần cắt giảm chi phí cố định kì!',
        desc: `Khoản chi Cần thiết đang chiếm tới ${Math.round(percentNeeds)}% thu nhập (khuyến nghị dười 50%). Bạn nên xem xét tìm bạn ở ghép để chia sẻ tiền phòng, tự nấu ăn mang cơm đi học thay vì ăn tiệm liên tục.`
      };
    }
    if (percentWants > 35) {
      return {
        vibe: 'alert',
        title: 'Hãm bớt trào lưu trà sữa, giải trí cốc!',
        desc: `Bạn dành tới ${Math.round(percentWants)}% thu nhập cho mục tiêu Mong muốn/Sở thích (khuyến nghị dưới 30%). Hãy thử thử thách "7 ngày không trà sữa/ăn vặt" và giới hạn tụ tập rạp chiếu phim xuống 1 lần/tuần.`
      };
    }
    if (percentSavings < 10) {
      return {
        vibe: 'warning',
        title: 'Báo lỗi tích lũy dự phòng!',
        desc: `Tỷ lệ tiết kiệm tháng này chỉ dưới ${Math.round(percentSavings)}% (khuynh hướng an toàn là trên 15-20%). Khi xe máy thủng săm hoặc điện thoại hỏng hóc, bạn sẽ dễ phải đi vay mượn. Hãy đặt lệnh tự động chuyển heo đất đầu tháng nhé.`
      };
    }
    return {
      vibe: 'success',
      title: 'Quản lý siêu chuẩn - Chuẩn học sinh tài chính!',
      desc: 'Bạn đang phân phối dòng tiền cực kỳ sát sao với công thức tài chính vàng 50/30/20. Duy trì biểu đồ tích lũy này giúp bạn vững tâm thế tự chủ tài chính cá nhân.'
    };
  };

  const advice = getAdvisorMessage();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Month Selected */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm drop-shadow-sm">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2 drop-shadow-sm">
            <ChartIcon className="h-6 w-6 text-emerald-600 drop-shadow-sm" /> Báo cáo & Phân tích Tài chính
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Học hỏi thói quen chi dùng thực tế qua đồ thị phân bổ tỷ lệ và cảnh báo chuyên sâu
          </p>
        </div>

        {/* Month Picker dropdown and Export buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative border border-slate-200 focus-within:border-emerald-500 rounded-2xl bg-slate-50 min-w-[200px] shadow-inner transition-colors">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 text-xs font-bold text-slate-700 bg-transparent pr-10 focus:outline-none cursor-pointer"
              id="report-month-select"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
              ▼
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const token = localStorage.getItem('sem_token');
              if (!token) {
                alert('Vui lòng đăng ký/đăng nhập hệ thống để sử dụng tính năng xuất PDF chính thức.');
                return;
              }
              window.open(`/api/reports/export/pdf?token=${token}&month=${selectedMonth}`, '_blank');
            }}
            id="btn-export-pdf"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-100 cursor-pointer shadow-sm hover:shadow-md"
          >
            📄 Xuất PDF
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const token = localStorage.getItem('sem_token');
              if (!token) {
                alert('Vui lòng đăng ký/đăng nhập hệ thống để sử dụng tính năng tải file Excel chính thức.');
                return;
              }
              window.open(`/api/reports/export/excel?token=${token}&month=${selectedMonth}`, '_blank');
            }}
            id="btn-export-excel"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all border border-blue-100 cursor-pointer shadow-sm hover:shadow-md"
          >
            📈 Tải file Excel
          </motion.button>
        </div>
      </motion.div>

      {/* QUICK HIGHLIGHT CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -5 }} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-300">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tổng Thu Nhập Tháng
          </span>
          <span className="text-xl font-extrabold font-mono text-slate-900 drop-shadow-sm">
            {new Intl.NumberFormat('vi-VN').format(totalIncome)}đ
          </span>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1.5">
            <CheckCircle2 className="h-3 w-3" /> Được cấp / Làm thêm đầu tháng
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-300">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Đã chi tiêu thực tế
          </span>
          <span className="text-xl font-extrabold font-mono text-slate-900 drop-shadow-sm">
            {new Intl.NumberFormat('vi-VN').format(totalSpent)}đ
          </span>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-1.5">
            Tỉ lệ chi dùng: {totalIncome > 0 ? Math.round((totalSpent / totalIncome) * 100) : 0}% nguồn tiền
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-300">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Mức dư tiết kiệm tích lũy
          </span>
          <span className={`text-xl font-extrabold font-mono drop-shadow-sm ${savingPerformance < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {new Intl.NumberFormat('vi-VN').format(savingPerformance)}đ
          </span>
          <div className="flex items-center gap-1 text-[10px] mt-1.5">
            {savingPerformance < 0 ? (
              <span className="text-red-600 font-bold flex items-center gap-0.5">
                <ArrowDownRight className="h-3.5 w-3.5" /> Chạm vào tiền dự phòng!
              </span>
            ) : (
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" /> Giữ mục tiêu an toàn
              </span>
            )}
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-300">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Hố Đen Tiêu Tiền Lớn Nhất
          </span>
          <span className="text-xl font-extrabold text-slate-900 drop-shadow-sm">
            {biggestExpenseCategory && biggestExpenseCategory.amount > 0 ? biggestExpenseCategory.name : 'Chưa có'}
          </span>
          <p className="text-[10px] text-slate-400 mt-1.5">
            {biggestExpenseCategory && biggestExpenseCategory.amount > 0 
              ? `Chi mất ${new Intl.NumberFormat('vi-VN').format(biggestExpenseCategory.amount)}đ (~${Math.round(biggestExpenseCategory.percent)}%)`
              : 'Năng nổ kiểm soát các mục chi của bạn'
            }
          </p>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CATEGORY BAR BREAKDOWN LIST (Visualizing biggest spendings) */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md space-y-4 lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
          <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2 drop-shadow-sm">
            <Layers className="h-5 w-5 text-emerald-600" /> Phân chia chi tiêu theo từng hạng mục
          </h3>

          <div className="space-y-4">
            {categorySpentMap.map((cat, idx) => {
              if (cat.amount === 0) return null; // Chỉ hiển thị danh mục có chi tiêu để đồ họa sạch sẽ
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={cat.id} 
                  id={`report-category-group-${cat.id}`} 
                  className="space-y-1.5"
                >
                  <div className="flex justify-between text-xs font-bold text-slate-700">
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
                    <span className="font-mono text-slate-900 drop-shadow-sm">
                      {new Intl.NumberFormat('vi-VN').format(cat.amount)}đ ({Math.round(cat.percent)}%)
                    </span>
                  </div>
                  {/* Progress bar representing category percent among total spendings */}
                  <div className="w-full h-3 bg-slate-100 shadow-inner rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percent}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-emerald-500 rounded-full drop-shadow-sm"
                    />
                  </div>
                </motion.div>
              );
            })}

            {monthlyExpenses.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                Chưa có dữ liệu chi tiêu nào của tháng {selectedMonth} được ghi nhận để phân tách cơ cấu.
              </div>
            )}
          </div>
        </div>

        {/* 50/30/20 RETRO-BUDGET EXPERT (Needs, Wants, Savings Rules) */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md space-y-4 hover:shadow-lg transition-shadow duration-300">
          <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2 drop-shadow-sm">
            <Award className="h-5 w-5 text-emerald-600" /> Tỷ lệ phân phối 50/30/20
          </h3>

          <div className="space-y-4.5">
            <p className="text-[11px] leading-relaxed text-slate-500">
              Nguyên tắc tài chính tối ưu: Thắt chặt <strong className="text-emerald-700">Thiết yếu ≤ 50%</strong>, giới hạn <strong className="text-amber-600">Sở thích ≤ 30%</strong>, và tích lũy <strong className="text-blue-600">Tiết kiệm ≥ 20%</strong>.
            </p>

            {/* Combined Segment Bar representation */}
            <div className="flex h-5 w-full rounded-full overflow-hidden bg-slate-100 text-[9px] font-black text-white text-center shadow-inner">
              {percentNeeds > 0 && (
                <motion.div 
                  initial={{ flexGrow: 0, width: 0 }}
                  animate={{ flexGrow: 0, width: `${Math.max(12, percentNeeds)}%` }}
                  transition={{ duration: 1 }}
                  className="bg-emerald-500 flex items-center justify-center drop-shadow-sm"
                  title="Cần thiết"
                >
                  {Math.round(percentNeeds)}% Needs
                </motion.div>
              )}
              {percentWants > 0 && (
                <motion.div 
                  initial={{ flexGrow: 0, width: 0 }}
                  animate={{ flexGrow: 0, width: `${Math.max(12, percentWants)}%` }}
                  transition={{ duration: 1 }}
                  className="bg-amber-500 flex items-center justify-center drop-shadow-sm border-l border-white/20"
                  title="Mong muốn"
                >
                  {Math.round(percentWants)}% Wants
                </motion.div>
              )}
              {percentSavings > 0 && (
                <motion.div 
                  initial={{ flexGrow: 0, width: 0 }}
                  animate={{ flexGrow: 0, width: `${Math.max(12, percentSavings)}%` }}
                  transition={{ duration: 1 }}
                  className="bg-blue-500 flex items-center justify-center drop-shadow-sm border-l border-white/20"
                  title="Tiết kiệm"
                >
                  {Math.round(percentSavings)}% Save
                </motion.div>
              )}
            </div>

            {/* Explanatory blocks */}
            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 drop-shadow-sm">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm shrink-0" />
                  <span>Khoản bắt buộc (Cần thiết)</span>
                </span>
                <span className="font-mono text-slate-900 text-right drop-shadow-sm">{new Intl.NumberFormat('vi-VN').format(spentNeeds)}đ</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 drop-shadow-sm">
                  <span className="h-3 w-3 rounded-full bg-amber-500 shadow-sm shrink-0" />
                  <span>Khoản sở thích (Không bắt buộc)</span>
                </span>
                <span className="font-mono text-slate-900 text-right drop-shadow-sm">{new Intl.NumberFormat('vi-VN').format(spentWants)}đ</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 drop-shadow-sm">
                  <span className="h-3 w-3 rounded-full bg-blue-500 shadow-sm shrink-0" />
                  <span>Dư quỹ tiết kiệm thực tế</span>
                </span>
                <span className="font-mono text-slate-900 text-right drop-shadow-sm">{new Intl.NumberFormat('vi-VN').format(currentSavings)}đ</span>
              </div>
            </div>

            {/* Dynamic AI advice coach */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className={`rounded-2xl border p-4 text-xs font-semibold shadow-sm transition-transform ${
              advice.vibe === 'success' 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                : advice.vibe === 'warning'
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}>
              <h4 className="font-bold flex items-center gap-1 drop-shadow-sm">
                {advice.vibe === 'success' ? '🍏' : '⚠️'} {advice.title}
              </h4>
              <p className="font-normal text-[11px] text-slate-700 mt-1.5 leading-relaxed">
                {advice.desc}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
