import React, { useState } from 'react';
import { RecurringExpense, Category, User } from '../types';
import { Repeat, Plus, Trash2, CalendarClock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecurringExpensesProps {
  user: User;
  categories: Category[];
  recurringExpenses: RecurringExpense[];
  onAddRecurring: (rec: Omit<RecurringExpense, 'id' | 'userId'>) => Promise<void>;
  onDeleteRecurring: (id: string) => Promise<void>;
  onToggleActive: (id: string, currentStatus: boolean) => Promise<void>;
}

export default function RecurringExpenses({ 
  user, categories, recurringExpenses, onAddRecurring, onDeleteRecurring, onToggleActive 
}: RecurringExpensesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [cycle, setCycle] = useState<'monthly' | 'weekly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !categoryId || !startDate) return;

    await onAddRecurring({
      title,
      amount: Number(amount),
      categoryId,
      cycle,
      startDate,
      nextDate: startDate,
      isActive: true
    });

    setTitle('');
    setAmount('');
    setIsAdding(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Repeat className="w-7 h-7 text-emerald-500" />
            Chi tiêu định kỳ
          </h1>
          <p className="text-slate-500 text-sm mt-1">Tự động ghi nhận các khoản chi cố định (trọ, mạng...)</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          {isAdding ? 'Hủy' : <><Plus className="w-5 h-5" /> Thêm định kỳ</>}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên khoản chi</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    placeholder="VD: Tiền phòng trọ"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    placeholder="2000000"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chu kỳ</label>
                  <select
                    value={cycle}
                    onChange={e => setCycle(e.target.value as any)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="monthly">Hàng tháng</option>
                    <option value="weekly">Hàng tuần</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày bắt đầu áp dụng</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex items-end justify-end">
                  <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-xl font-medium transition-colors w-full sm:w-auto">
                    Tạo lịch chi tiêu
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {recurringExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CalendarClock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-lg font-medium text-slate-700 mb-1">Không có khoản chi lặp lại</p>
            <p className="text-sm">Thêm các khoản như tiền trọ, điện nước để tự động ghi chép.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recurringExpenses.map(rec => {
              const cat = categories.find(c => c.id === rec.categoryId);
              return (
                <div key={rec.id} className={`p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${!rec.isActive ? 'bg-slate-50 opacity-75' : 'hover:bg-slate-50/50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${rec.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                      <Repeat className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${rec.isActive ? 'text-slate-800' : 'text-slate-500'}`}>{rec.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-emerald-600">
                          {new Intl.NumberFormat('vi-VN').format(rec.amount)}đ
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {rec.cycle === 'monthly' ? 'Mỗi tháng' : 'Mỗi tuần'}
                        </span>
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                          Tiếp theo: {rec.nextDate.split('-').reverse().join('/')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => onToggleActive(rec.id, rec.isActive)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${rec.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                    >
                      {rec.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                    </button>
                    <button
                      onClick={() => onDeleteRecurring(rec.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
