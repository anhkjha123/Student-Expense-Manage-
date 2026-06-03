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
  const [selectedMonth, setSelectedMonth] = useState('2026-05'); // Mặc định tháng 5 (đã hoàn thành chi tiêu đầy đủ)

  const monthOptions = [
    { value: '2026-05', label: 'Tháng 5, 2026 (Thành lịch sử)' },
    { value: '2026-06', label: 'Tháng 6, 2026 (Tháng hiện tại)' }
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

  // Tạo biểu đồ thanh ngang SVG tỉ lệ 50/30/20
  const maxBarLength = 100;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header Month Selected */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ChartIcon className="h-6 w-6 text-emerald-600" /> Báo cáo & Phân tích Tài chính
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Học hỏi thói quen chi dùng thực tế qua đồ thị phân bổ tỷ lệ và cảnh báo chuyên sâu
          </p>
        </div>

        {/* Month Picker dropdown */}
        <div className="relative border border-slate-200 focus-within:border-emerald-500 rounded-2xl bg-white min-w-[240px]">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full appearance-none px-4 py-2.5 text-sm font-semibold text-slate-700 bg-transparent pr-10 focus:outline-none"
            id="report-month-select"
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            ▼
          </span>
        </div>
      </div>

      {/* QUICK HIGHLIGHT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tổng Thu Nhập Tháng
          </span>
          <span className="text-xl font-extrabold font-mono text-slate-900">
            {new Intl.NumberFormat('vi-VN').format(totalIncome)}đ
          </span>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1.5">
            <CheckCircle2 className="h-3 w-3" /> Được cấp / Làm thêm đầu tháng
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Đã chi tiêu thực tế
          </span>
          <span className="text-xl font-extrabold font-mono text-slate-900">
            {new Intl.NumberFormat('vi-VN').format(totalSpent)}đ
          </span>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-1.5">
            Tỉ lệ chi dùng: {totalIncome > 0 ? Math.round((totalSpent / totalIncome) * 100) : 0}% nguồn tiền
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Mức dư tiết kiệm tích lũy
          </span>
          <span className={`text-xl font-extrabold font-mono ${savingPerformance < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
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
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Hố Đen Tiêu Tiền Lớn Nhất
          </span>
          <span className="text-xl font-extrabold text-slate-900">
            {biggestExpenseCategory && biggestExpenseCategory.amount > 0 ? biggestExpenseCategory.name : 'Chưa có'}
          </span>
          <p className="text-[10px] text-slate-400 mt-1.5">
            {biggestExpenseCategory && biggestExpenseCategory.amount > 0 
              ? `Chi mất ${new Intl.NumberFormat('vi-VN').format(biggestExpenseCategory.amount)}đ (~${Math.round(biggestExpenseCategory.percent)}%)`
              : 'Năng nổ kiểm soát các mục chi của bạn'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CATEGORY BAR BREAKDOWN LIST (Visualizing biggest spendings) */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600" /> Phân chia chi tiêu theo từng hạng mục
          </h3>

          <div className="space-y-4">
            {categorySpentMap.map(cat => {
              if (cat.amount === 0) return null; // Chỉ hiển thị danh mục có chi tiêu để đồ họa sạch sẽ
              return (
                <div key={cat.id} id={`report-category-group-${cat.id}`} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
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
                    <span className="font-mono text-slate-900">
                      {new Intl.NumberFormat('vi-VN').format(cat.amount)}đ ({Math.round(cat.percent)}%)
                    </span>
                  </div>
                  {/* Progress bar representing category percent among total spendings */}
                  <div className="w-full h-3 bg-slate-150 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {monthlyExpenses.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                Chưa có dữ liệu chi tiêu nào của tháng {selectedMonth} được ghi nhận để phân tách cơ cấu.
              </div>
            )}
          </div>
        </div>

        {/* 50/30/20 RETRO-BUDGET EXPERT (Needs, Wants, Savings Rules) */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" /> Tỷ lệ phân phối 50/30/20
          </h3>

          <div className="space-y-4.5">
            <p className="text-[11px] leading-relaxed text-slate-500">
              Nguyên tắc tài chính tối ưu: Thắt chặt <strong>Thiết yếu ≤ 50%</strong>, giới hạn <strong>Sở thích ≤ 30%</strong>, và tích lũy <strong>Tiết kiệm ≥ 20%</strong>.
            </p>

            {/* Combined Segment Bar representation */}
            <div className="flex h-5 w-full rounded-full overflow-hidden bg-slate-100 text-[9px] font-black text-white text-center">
              {percentNeeds > 0 && (
                <div 
                  className="bg-emerald-600 flex items-center justify-center transition-all"
                  style={{ width: `${Math.max(12, percentNeeds)}%` }}
                  title="Cần thiết"
                >
                  {Math.round(percentNeeds)}% Needs
                </div>
              )}
              {percentWants > 0 && (
                <div 
                  className="bg-amber-500 flex items-center justify-center transition-all"
                  style={{ width: `${Math.max(12, percentWants)}%` }}
                  title="Mong muốn"
                >
                  {Math.round(percentWants)}% Wants
                </div>
              )}
              {percentSavings > 0 && (
                <div 
                  className="bg-blue-500 flex items-center justify-center transition-all"
                  style={{ width: `${Math.max(12, percentSavings)}%` }}
                  title="Tiết kiệm"
                >
                  {Math.round(percentSavings)}% Save
                </div>
              )}
            </div>

            {/* Explanatory blocks */}
            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-emerald-600 shrink-0" />
                  <span>Khoản bắt buộc (Cần thiết)</span>
                </span>
                <span className="font-mono text-slate-930 text-right">{new Intl.NumberFormat('vi-VN').format(spentNeeds)}đ</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0" />
                  <span>Khoản sở thích (Không bắt buộc)</span>
                </span>
                <span className="font-mono text-slate-930 text-right">{new Intl.NumberFormat('vi-VN').format(spentWants)}đ</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-blue-500 shrink-0" />
                  <span>Dư quỹ tiết kiệm thực tế</span>
                </span>
                <span className="font-mono text-slate-930 text-right">{new Intl.NumberFormat('vi-VN').format(currentSavings)}đ</span>
              </div>
            </div>

            {/* Dynamic AI advice coach */}
            <div className={`rounded-2xl border p-4 text-xs font-semibold ${
              advice.vibe === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
                : advice.vibe === 'warning'
                ? 'bg-amber-50 border-amber-100 text-amber-900'
                : 'bg-rose-50 border-rose-100 text-rose-900'
            }`}>
              <h4 className="font-bold flex items-center gap-1">
                {advice.vibe === 'success' ? '🍏' : '⚠️'} {advice.title}
              </h4>
              <p className="font-normal text-[11px] text-slate-700 mt-1 leading-relaxed">
                {advice.desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
