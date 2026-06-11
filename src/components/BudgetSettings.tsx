import React, { useState, useEffect } from 'react';
import { 
  PiggyBank, 
  TrendingUp, 
  CheckCircle, 
  HelpCircle, 
  AlertTriangle,
  Coins,
  DollarSign,
  Settings
} from 'lucide-react';
import { User, Category, Budget } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface BudgetSettingsProps {
  user: User;
  categories: Category[];
  budgets: Budget[];
  onUpdateBudget: (userUpdates: Partial<User>, budgetUpdates: Budget[]) => void;
}

export default function BudgetSettings({
  user,
  categories,
  budgets,
  onUpdateBudget
}: BudgetSettingsProps) {
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [savingGoal, setSavingGoal] = useState<string>('');
  const [localBudgets, setLocalBudgets] = useState<{ [catId: string]: string }>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // Định dạng số hiển thị cho Thu nhập & Sổ tiết kiệm
    setMonthlyIncome(new Intl.NumberFormat('en-US').format(user.monthlyIncome));
    setSavingGoal(new Intl.NumberFormat('en-US').format(user.savingGoal));

    // Khởi tạo các mức hán mức danh mục trong state cục bộ
    const initialBudgets: { [catId: string]: string } = {};
    categories.forEach(cat => {
      const b = budgets.find(x => x.categoryId === cat.id);
      initialBudgets[cat.id] = b ? new Intl.NumberFormat('en-US').format(b.amount) : '0';
    });
    setLocalBudgets(initialBudgets);
  }, [user, categories, budgets]);

  const numIncome = parseFloat(monthlyIncome.replace(/,/g, '')) || 0;
  const numSaving = parseFloat(savingGoal.replace(/,/g, '')) || 0;
  const availableBudget = numIncome - numSaving;

  // Tính tổng số tiền đã phân bổ cho các danh mục
  const totalAllocated = Object.entries(localBudgets).reduce((sum, [catId, val]) => {
    const num = parseFloat((val as string).replace(/,/g, '')) || 0;
    return sum + num;
  }, 0);

  const isOverAllocated = totalAllocated > availableBudget;

  const handleBudgetChange = (catId: string, val: string) => {
    const clean_val = val.replace(/\D/g, '');
    if (clean_val) {
      const formatted = new Intl.NumberFormat('en-US').format(parseFloat(clean_val));
      setLocalBudgets(prev => ({ ...prev, [catId]: formatted }));
    } else {
      setLocalBudgets(prev => ({ ...prev, [catId]: '0' }));
    }
  };

  const handleIncomeChange = (val: string) => {
    const clean_val = val.replace(/\D/g, '');
    if (clean_val) {
      setMonthlyIncome(new Intl.NumberFormat('en-US').format(parseFloat(clean_val)));
    } else {
      setMonthlyIncome('0');
    }
  };

  const handleSavingChange = (val: string) => {
    const clean_val = val.replace(/\D/g, '');
    if (clean_val) {
      setSavingGoal(new Intl.NumberFormat('en-US').format(parseFloat(clean_val)));
    } else {
      setSavingGoal('0');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Chuẩn bị dữ liệu cập nhật
    const updatedUser: Partial<User> = {
      monthlyIncome: numIncome,
      savingGoal: numSaving,
    };

    const updatedBudgets: Budget[] = categories.map(cat => {
      const numAmount = parseFloat((localBudgets[cat.id] || '0').replace(/,/g, '')) || 0;
      return {
        categoryId: cat.id,
        amount: numAmount
      };
    });

    onUpdateBudget(updatedUser, updatedBudgets);

    setSuccessMsg('Hạn mức ngân sách và mục tiêu tài chính đã được cập nhật thành công!');
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100"
    >
      {/* Title */}
      <div className="mb-6 bg-white/60 dark:bg-slate-950/80 backdrop-blur-md p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 drop-shadow-sm flex items-center gap-2">
          <Settings className="h-6 w-6 text-emerald-400" /> Thiết lập ngân sách tháng
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Phân bổ tiền chu cấp/làm thêm vào các phong bao chi tiêu hằng tháng để nắm chắc ví tiền
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Success alert popup */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Tổng mức Tài chính tháng (Thu nhập & Mục tiêu tiết kiệm) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-500" /> 1. Tổng thu nhập hằng tháng
            </h3>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Tiền chu cấp + Làm thêm (VND)
              </label>
              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus-within:border-emerald-500 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/15 overflow-hidden">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-400 font-mono">
                  đ
                </span>
                <input
                  type="text"
                  value={monthlyIncome}
                  onChange={(e) => handleIncomeChange(e.target.value)}
                  className="w-full py-3 pl-9 pr-4 text-lg font-bold font-mono text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none"
                  required
                />
              </div>
              <p className="text-[10.5px] text-slate-400 leading-relaxed leading-normal">
                Tổng tất cả các nguồn tiền cố định bạn nhận được mỗi đầu tháng
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-emerald-500" /> 2. Tiết kiệm phòng thân
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Mục tiêu tiết kiệm muốn cất đi (VND)
              </label>
              <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus-within:border-emerald-500 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/15 overflow-hidden">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-400 font-mono">
                  đ
                </span>
                <input
                  type="text"
                  value={savingGoal}
                  onChange={(e) => handleSavingChange(e.target.value)}
                  className="w-full py-3 pl-9 pr-4 text-lg font-bold font-mono text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none"
                  required
                />
              </div>
              <p className="text-[10.5px] text-slate-400 leading-relaxed leading-normal">
                Số tiền cất đi ngay đầu tháng cho trường hợp khẩn cấp (vd: đau ốm, hỏng xe)
              </p>
            </div>
          </div>
        </div>

        {/* Live Budget Allocation Health widget */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 shadow-xs space-y-4.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 font-mono">
                Số tiền chi tiêu khả dụng tối đa
              </span>
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                {new Intl.NumberFormat('vi-VN').format(availableBudget)}đ
              </span>
            </div>
            
            <div className="hidden sm:block text-slate-300 dark:text-slate-600 self-stretch border-l border-slate-200 dark:border-slate-700" />

            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 font-mono">
                Tổng hạn mức mục chi đã phân chia
              </span>
              <span className={`text-2xl font-black font-mono ${isOverAllocated ? 'text-red-500' : 'text-emerald-500'}`}>
                {new Intl.NumberFormat('vi-VN').format(totalAllocated)}đ
              </span>
            </div>

            <div className="hidden sm:block text-slate-300 dark:text-slate-600 self-stretch border-l border-slate-200 dark:border-slate-700" />

            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 font-mono">
                Số dư quỹ chưa phân bổ
              </span>
              <span className={`text-2xl font-black font-mono ${availableBudget - totalAllocated < 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-100'}`}>
                {new Intl.NumberFormat('vi-VN').format(availableBudget - totalAllocated)}đ
              </span>
            </div>
          </div>

          {/* Warning box if over-allocating past available limits */}
          {isOverAllocated && (
            <div className="flex gap-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-200/50 dark:border-amber-700 p-4 text-xs font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200">Cảnh báo: Lạm chi hạn mức phân chia!</p>
                <p className="font-normal text-[11px] text-slate-600 dark:text-slate-300">
                  Tổng ngân sách chia cho các mục đang lớn hơn mức chi khả dụng hằng tháng ({new Intl.NumberFormat('vi-VN').format(availableBudget)}đ). 
                  Điều này đồng nghĩa với việc bạn sẽ dễ vi phạm mục tiêu tiết kiệm tích lũy {new Intl.NumberFormat('vi-VN').format(numSaving)}đ đã đặt ra! 
                  Hãy rà soát cắt giảm bớt ngân sách ở một số mục không bắt buộc.
                </p>
              </div>
            </div>
          )}

          {!isOverAllocated && totalAllocated > 0 && (
            <div className="flex gap-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200/50 dark:border-emerald-700 p-4 text-xs font-semibold text-emerald-900 dark:text-emerald-200 leading-relaxed">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-emerald-900 dark:text-emerald-200">Thiết lập hợp lý!</p>
                <p className="font-normal text-[11px] text-slate-600 dark:text-slate-300">
                  Tổng hạn mức các mục chi của bạn rất lành mạnh. Nếu tuân thủ theo các hạn mức này, 
                  bạn chắc chắn sẽ cất được <strong>{new Intl.NumberFormat('vi-VN').format(numSaving)}đ</strong> tiết kiệm vào cuối tháng!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. Chi tiết ngân sách theo từng danh mục */}
        <div className="space-y-4">
          <h3 className="font-display text-base font-bold text-slate-800 dark:text-slate-100">
            3. Hạn mức chi tiêu cho từng danh mục
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-4.5 shadow-xs gap-3.5"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${cat.color}`}>
                    {cat.id === 'rent' && '🏠'}
                    {cat.id === 'food' && '🍲'}
                    {cat.id === 'study' && '📚'}
                    {cat.id === 'transport' && '🏍️'}
                    {cat.id === 'entertainment' && '🥤'}
                    {cat.id === 'shopping' && '🛍️'}
                    {cat.id === 'group_fund' && '👥'}
                    {cat.id === 'other' && '🔄'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{cat.name}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate leading-normal">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm focus-within:border-emerald-500 overflow-hidden w-full sm:w-40 shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-400 font-mono">
                    đ
                  </span>
                  <input
                    type="text"
                    value={localBudgets[cat.id] || '0'}
                    onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                    className="w-full text-right pr-3.5 py-2 text-sm font-bold font-mono text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            className="rounded-2xl bg-emerald-500 hover:bg-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 dark:shadow-none transition-all cursor-pointer"
          >
            Lưu hạn mức chi tiêu mới
          </button>
        </div>
      </form>
    </motion.div>
  );
}
