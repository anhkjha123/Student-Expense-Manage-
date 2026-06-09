import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  Calendar, 
  FileText, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Category, Expense } from '../types';
import { motion } from 'motion/react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'userId'> & { recurringCycle?: 'NONE' | 'WEEKLY' | 'MONTHLY' }) => void;
  editingExpense?: Expense | null;
  onEditExpense?: (id: string, expense: Omit<Expense, 'id' | 'userId'>) => void;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  categories,
  onAddExpense,
  editingExpense,
  onEditExpense
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(
    new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]
  );
  const [note, setNote] = useState<string>('');
  const [isNecessary, setIsNecessary] = useState<boolean>(true);
  const [recurringCycle, setRecurringCycle] = useState<'NONE' | 'WEEKLY' | 'MONTHLY'>('NONE');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setAmount(new Intl.NumberFormat('en-US').format(editingExpense.amount));
        setCategoryId(editingExpense.categoryId);
        setTitle(editingExpense.title);
        setDate(editingExpense.date);
        setNote(editingExpense.note || '');
        setIsNecessary(editingExpense.isNecessary);
      } else {
        setAmount('');
        if (categories.length > 0) {
          setCategoryId(categories[0].id);
        }
        setTitle('');
        setDate(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]);
        setNote('');
        setIsNecessary(true);
        setRecurringCycle('NONE');
      }
      setError(null);
    }
  }, [editingExpense, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const valAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(valAmount) || valAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lý lớn hơn 0đ.');
      return;
    }

    if (!title.trim()) {
      setError('Vui lòng điền nội dung chi tiêu (ví dụ: Ăn cơm trưa).');
      return;
    }

    if (!categoryId) {
      setError('Vui lòng lựa chọn một danh mục chi tiêu.');
      return;
    }

    if (!date) {
      setError('Vui lòng chọn ngày chi tiêu.');
      return;
    }

    const payload = {
      amount: valAmount,
      categoryId,
      title: title.trim(),
      date,
      note: note.trim() || undefined,
      isNecessary,
      recurringCycle: editingExpense ? undefined : recurringCycle
    };

    if (editingExpense && onEditExpense) {
      onEditExpense(editingExpense.id, payload);
    } else {
      onAddExpense(payload);
    }

    // Reset Form
    if (!editingExpense) {
      setAmount('');
      setTitle('');
      setNote('');
      setIsNecessary(true);
      setRecurringCycle('NONE');
    }
    setError(null);
    onClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ cho phép nhập số
    const value = e.target.value.replace(/\D/g, '');
    if (value) {
      // Định dạng hiển thị dấu phẩy hàng nghìn
      const formatted = new Intl.NumberFormat('en-US').format(parseFloat(value));
      setAmount(formatted);
    } else {
      setAmount('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative z-50 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50/50 px-5 sm:px-6 py-3.5 sm:py-4.5 shrink-0 animate-fade-in">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
              {editingExpense ? 'Chỉnh sửa khoản chi tiêu' : 'Nhập chi tiêu mới'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              {editingExpense ? 'Cập nhật lại thông tin dòng tiền chính xác hơn' : 'Nhập nhanh chi tiêu trong dưới 10 giây để kiểm soát dòng tiền'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-1">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Số tiền chi tiêu (VND) <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-2xl border border-slate-200 focus-within:border-emerald-400 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/15 overflow-hidden">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">
                đ
              </span>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full py-2.5 sm:py-3.5 pl-9 pr-4 text-base sm:text-xl font-bold font-mono text-slate-900 focus:outline-none"
                id="expense-amount-input"
                required
              />
            </div>
          </div>

          {/* Title Text Input */}
          <div className="space-y-1">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Nội dung chi tiêu <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-2xl border border-slate-200 focus-within:border-emerald-500 shadow-sm transition-all overflow-hidden">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ăn trưa cơm bụi, trà sữa, xăng xe..."
                className="w-full py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none"
                id="expense-title-input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Category Select */}
            <div className="space-y-1">
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Lựa chọn danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 shadow-sm"
                id="expense-category-input"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div className="space-y-1">
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Ngày thực hiện <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-2xl border border-slate-200 focus-within:border-emerald-500 shadow-sm transition-all">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-0 bg-transparent"
                  id="expense-date-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Classification Option (Needs vs Wants) */}
          <div className="space-y-1">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Phân loại chi tiêu tài chính <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
              <button
                type="button"
                onClick={() => setIsNecessary(true)}
                className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 sm:p-3 text-center transition-all cursor-pointer gap-0.5 ${
                  isNecessary
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-2 ring-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 text-slate-500'
                }`}
              >
                <span className="text-xs font-bold block">Mức Cần thiết (Needs)</span>
                <span className="text-[9px] sm:text-[10px] opacity-75 leading-relaxed block">
                  Ăn uống, thuê nhà, đi lại, học tập
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsNecessary(false)}
                className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 sm:p-3 text-center transition-all cursor-pointer gap-0.5 ${
                  !isNecessary
                    ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/10'
                    : 'border-slate-200 hover:border-slate-300 text-slate-500'
                }`}
              >
                <span className="text-xs font-bold block">Mức Mong muốn (Wants)</span>
                <span className="text-[9px] sm:text-[10px] opacity-75 leading-relaxed block">
                  Trà sữa, mua sắm, giải trí, du lịch
                </span>
              </button>
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-1">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Ghi chú phát sinh (Tùy chọn)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú chi tiết thêm..."
              rows={2}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 shadow-sm"
              id="expense-note-input"
            />
          </div>

          {/* Recurring Expense Option */}
          {!editingExpense && (
            <div className="space-y-1">
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Chi tiêu định kỳ (Lặp lại)
              </label>
              <select
                value={recurringCycle}
                onChange={(e) => setRecurringCycle(e.target.value as 'NONE' | 'WEEKLY' | 'MONTHLY')}
                className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 shadow-sm bg-no-repeat bg-[right_16px_center]"
                id="expense-recurring-input"
              >
                <option value="NONE">Không lặp lại (Một lần)</option>
                <option value="WEEKLY">Lặp lại hàng tuần</option>
                <option value="MONTHLY">Lặp lại hàng tháng</option>
              </select>
            </div>
          )}

          {/* Submit Action Block */}
          <div className="flex gap-3 pt-2 text-right justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 hover:bg-emerald-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-200 transition-all cursor-pointer"
            >
              {editingExpense ? 'Lưu thay đổi' : 'Lưu chi tiêu'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
