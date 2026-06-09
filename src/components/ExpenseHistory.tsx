import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Calendar, 
  Tag, 
  Filter, 
  TrendingDown, 
  ThumbsUp, 
  ThumbsDown,
  ChevronDown,
  ArrowUpDown,
  BookOpen,
  Pencil
} from 'lucide-react';
import { Expense, Category } from '../types';
import { motion } from 'motion/react';

interface ExpenseHistoryProps {
  expenses: Expense[];
  categories: Category[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
}

type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

export default function ExpenseHistory({
  expenses,
  categories,
  onDeleteExpense,
  onEditExpense
}: ExpenseHistoryProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [necessityFilter, setNecessityFilter] = useState<'all' | 'needs' | 'wants' | 'recurring'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Lọc dữ liệu chi tiêu
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(search.toLowerCase()) || 
                          (exp.note && exp.note.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || exp.categoryId === selectedCategory;
    
    const matchesNecessity = necessityFilter === 'all' || 
                             (necessityFilter === 'needs' && exp.isNecessary) || 
                             (necessityFilter === 'wants' && !exp.isNecessary) ||
                             (necessityFilter === 'recurring' && exp.isRecurring);

    return matchesSearch && matchesCategory && matchesNecessity;
  });

  // Sắp xếp dữ liệu
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    } else {
      return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    }
  });

  const totalFilteredAmount = filteredExpenses.filter(e => !e.isRecurring).reduce((sum, item) => sum + item.amount, 0);
  const totalNeeds = filteredExpenses.filter(e => e.isNecessary && !e.isRecurring).reduce((sum, item) => sum + item.amount, 0);
  const totalWants = filteredExpenses.filter(e => !e.isNecessary && !e.isRecurring).reduce((sum, item) => sum + item.amount, 0);

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || 'Khác';
  };

  const getCategoryTheme = (id: string) => {
    return categories.find(c => c.id === id)?.color || 'bg-slate-100 text-slate-700';
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-slate-200/50 shadow-sm">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2 drop-shadow-sm">
            <BookOpen className="h-6 w-6 text-emerald-400 drop-shadow-sm" /> Sổ chép chi tiêu sinh viên
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Tổng quan và tra cứu chi tiết mọi giao dịch bạn đã lưu trữ vào hệ thống
          </p>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -5 }} className="rounded-3xl bg-white p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tổng chi tiêu lọc ra
          </span>
          <span className="text-xl font-extrabold font-mono text-slate-800 drop-shadow-sm">
            {new Intl.NumberFormat('vi-VN').format(totalFilteredAmount)}đ
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Trong các bộ lọc tìm kiếm hiện tại</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="rounded-3xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 p-5 border border-emerald-100/50 shadow-sm hover:shadow-md transition-shadow">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-500">
            Cần thiết (Needs)
          </span>
          <span className="text-xl font-extrabold font-mono text-emerald-600 drop-shadow-sm">
            {new Intl.NumberFormat('vi-VN').format(totalNeeds)}đ
          </span>
          <p className="text-[10px] text-emerald-500/70 mt-1 font-medium">
            Chiếm {totalFilteredAmount > 0 ? Math.round((totalNeeds / totalFilteredAmount) * 100) : 0}% tổng lọc
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="rounded-3xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 p-5 border border-amber-100/50 shadow-sm hover:shadow-md transition-shadow">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600">
            Sở thích / Mong muốn (Wants)
          </span>
          <span className="text-xl font-extrabold font-mono text-amber-700 drop-shadow-sm">
            {new Intl.NumberFormat('vi-VN').format(totalWants)}đ
          </span>
          <p className="text-[10px] text-amber-600/70 mt-1 font-medium">
            Chiếm {totalFilteredAmount > 0 ? Math.round((totalWants / totalFilteredAmount) * 100) : 0}% tổng lọc
          </p>
        </motion.div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          {/* Search text input */}
          <div className="relative rounded-2xl border border-slate-200 focus-within:border-emerald-500 overflow-hidden sm:col-span-5">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo khoản chi hoặc ghi chú..."
              className="w-full py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none"
              id="expense-search-input"
            />
          </div>

          {/* Category drop selection */}
          <div className="relative border border-slate-200 focus-within:border-emerald-500 rounded-2xl bg-white sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 text-sm font-semibold text-slate-700 bg-transparent focus:outline-none focus:ring-0"
              id="expense-category-filter"
            >
              <option value="all">📁 Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>

          {/* Necessity Filter dropdown */}
          <div className="relative border border-slate-200 focus-within:border-emerald-500 rounded-2xl bg-white sm:col-span-4">
            <select
              value={necessityFilter}
              onChange={(e) => setNecessityFilter(e.target.value as any)}
              className="w-full appearance-none px-4 py-2.5 text-sm font-semibold text-slate-700 bg-transparent focus:outline-none focus:ring-0"
              id="expense-necessity-filter"
            >
              <option value="all">⚖️ Tất cả phân loại tài chính</option>
              <option value="needs">✔️ Cần thiết (Bắt buộc - Needs)</option>
              <option value="wants">☕ Ưa thích (Cắt giảm được - Wants)</option>
              <option value="recurring">🔄 Định kỳ (Recurring)</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Sorting Action buttons row */}
        <div className="flex flex-wrap gap-2.5 pt-1 text-xs font-semibold text-slate-500 items-center">
          <span className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-slate-400" /> Sắp xếp theo:
          </span>
          <button
            onClick={() => toggleSort('date')}
            className={`rounded-xl px-3 py-1.5 transition-colors cursor-pointer border flex items-center gap-1 ${
              sortField === 'date'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600 font-bold'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            Thời gian {sortField === 'date' && (sortOrder === 'desc' ? '⬇️' : '⬆️')}
          </button>
          <button
            onClick={() => toggleSort('amount')}
            className={`rounded-xl px-3 py-1.5 transition-colors cursor-pointer border flex items-center gap-1 ${
              sortField === 'amount'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600 font-bold'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            Số tiền {sortField === 'amount' && (sortOrder === 'desc' ? '⬇️' : '⬆️')}
          </button>
          <span className="text-[10px] text-slate-400 ml-auto font-mono">
            Hiển thị {sortedExpenses.length} / {expenses.length} giao dịch
          </span>
        </div>
      </div>

      {/* TABLE/LIST COMPONENT */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        {sortedExpenses.length === 0 ? (
          <div className="py-20 text-center">
            <span className="block text-4xl mb-2">🔍</span>
            <h3 className="text-sm font-bold text-slate-800">Không tìm thấy giao dịch nào</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Không tìm thấy giao dịch nào tương khớp với bộ lọc hoặc tìm kiếm hiện hành của bạn.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Khoản chi tiêu</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Phân loại</th>
                  <th className="px-6 py-4 text-right">Số tiền</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sortedExpenses.map((exp) => (
                  <tr 
                    key={exp.id} 
                    id={`expense-row-${exp.id}`}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{exp.title}</div>
                      {exp.note && (
                        <div className="text-[11px] text-slate-400 leading-relaxed max-w-[280px] break-words">
                          💡 {exp.note}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-xl px-2.5 py-0.5 text-[11px] font-semibold border ${getCategoryTheme(exp.categoryId)}`}>
                        {getCategoryName(exp.categoryId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500 font-mono">
                      {exp.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {exp.isNecessary ? (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-150 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                            🟢 Bắt buộc
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 border border-amber-150 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            🟡 Sở thích
                          </span>
                        )}
                        {exp.isRecurring && (
                          <span className="inline-flex items-center gap-1 rounded-xl bg-blue-50 border border-blue-150 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                            🔵 Định kỳ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 font-mono">
                      {new Intl.NumberFormat('vi-VN').format(exp.amount)}đ
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEditExpense(exp)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer inline-flex"
                          title="Sửa giao dịch"
                          id={`edit-btn-${exp.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {deleteConfirmId === exp.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                onDeleteExpense(exp.id);
                                setDeleteConfirmId(null);
                              }}
                              className="rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                              title="Xác nhận xóa"
                              id={`confirm-delete-btn-${exp.id}`}
                            >
                              Xóa?
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                              title="Hủy bỏ"
                              id={`cancel-delete-btn-${exp.id}`}
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(exp.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer inline-flex"
                            title="Xóa giao dịch"
                            id={`delete-btn-${exp.id}`}
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
