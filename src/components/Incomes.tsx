import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Download, Filter } from 'lucide-react';
import { Income, User } from '../types';
import { ApiService } from '../lib/api';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';

interface IncomesProps {
  user: User;
}

const SOURCES = [
  { id: 'SCHOLARSHIP', label: 'Học bổng', color: 'bg-blue-500' },
  { id: 'PART_TIME', label: 'Làm thêm', color: 'bg-emerald-500' },
  { id: 'FAMILY', label: 'Gia đình chu cấp', color: 'bg-purple-500' },
  { id: 'OTHER', label: 'Khác', color: 'bg-slate-500' },
];

export default function Incomes({ user }: IncomesProps) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  
  const [formData, setFormData] = useState({
    amount: '',
    source: 'FAMILY',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    loadIncomes();
  }, [user, filterMonth]);

  const loadIncomes = async () => {
    setIsLoading(true);
    const localIncomesKey = `sem_${user.id}_incomes`;
    const isGuest = localStorage.getItem('sem_guest_mode') === 'true';

    if (!isGuest && auth.currentUser) {
      try {
        const data = await ApiService.getIncomes(filterMonth || undefined);
        setIncomes(data);
        localStorage.setItem(localIncomesKey, JSON.stringify(data));
        setIsLoading(false);
        return;
      } catch (e) {
        console.warn('Firestore getIncomes failed, falling back:', e);
      }
    }

    // Guest / offline fallback: Express API then localStorage
    try {
      let url = '/api/incomes';
      if (filterMonth) url += `?month=${filterMonth}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sem_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIncomes(data);
        localStorage.setItem(localIncomesKey, JSON.stringify(data));
      } else { throw new Error('API failed'); }
    } catch (e) {
      console.warn('Express API failed, using localStorage:', e);
      const stored = localStorage.getItem(localIncomesKey);
      if (stored) {
        let parsed: Income[] = JSON.parse(stored);
        if (filterMonth) parsed = parsed.filter(i => i.date.startsWith(filterMonth));
        setIncomes(parsed);
      }
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const localIncomesKey = `sem_${user.id}_incomes`;
    const isGuest = localStorage.getItem('sem_guest_mode') === 'true';

    if (!isGuest && auth.currentUser) {
      try {
        await ApiService.createIncome({
          amount: Number(formData.amount),
          source: formData.source as any,
          date: formData.date,
          note: formData.note || undefined
        });
        setShowForm(false);
        setFormData({ ...formData, amount: '', note: '' });
        loadIncomes();
        return;
      } catch (e) {
        console.warn('Firestore createIncome failed, falling back:', e);
      }
    }

    // Guest / offline fallback
    const newIncome: Income = {
      id: `inc_added_${Date.now()}`,
      userId: user.id,
      amount: Number(formData.amount),
      source: formData.source as any,
      date: formData.date,
      note: formData.note
    };
    try {
      const res = await fetch('/api/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('sem_token')}` },
        body: JSON.stringify({ amount: newIncome.amount, source: newIncome.source, date: newIncome.date, note: newIncome.note })
      });
      if (!res.ok) throw new Error('API failed');
    } catch {
      const stored = localStorage.getItem(localIncomesKey);
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem(localIncomesKey, JSON.stringify([newIncome, ...list]));
    }
    setShowForm(false);
    setFormData({ ...formData, amount: '', note: '' });
    loadIncomes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa khoản thu này?')) return;
    const localIncomesKey = `sem_${user.id}_incomes`;
    const isGuest = localStorage.getItem('sem_guest_mode') === 'true';

    if (!isGuest && auth.currentUser) {
      try {
        await ApiService.deleteIncome(id);
        loadIncomes();
        return;
      } catch (e) {
        console.warn('Firestore deleteIncome failed, falling back:', e);
      }
    }

    try {
      const res = await fetch(`/api/incomes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sem_token')}` }
      });
      if (res.ok) { loadIncomes(); return; }
    } catch {}
    const stored = localStorage.getItem(localIncomesKey);
    if (stored) {
      const list = JSON.parse(stored) as Income[];
      localStorage.setItem(localIncomesKey, JSON.stringify(list.filter(i => i.id !== id)));
      loadIncomes();
    }
  };

  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

  // Group by source for Pie chart simulation
  const sourceData = SOURCES.map(s => {
    const total = incomes.filter(i => i.source === s.id).reduce((sum, i) => sum + i.amount, 0);
    return { ...s, total };
  }).filter(s => s.total > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-slate-900 dark:text-slate-100"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-500" /> Quản lý thu nhập
          </h2>
          <p className="text-slate-500 text-sm mt-1">Theo dõi các nguồn tiền vào của bạn</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="month" 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm shadow-emerald-200"
          >
            <Plus className="h-4 w-4" /> Thêm khoản thu
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8 max-w-3xl">
          <h3 className="font-semibold text-slate-800 mb-4">Ghi nhận thu nhập mới</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Số tiền (đ)</label>
              <input required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} type="number" min="0" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="500000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nguồn</label>
              <select required value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                {SOURCES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ngày nhận</label>
              <input required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} type="date" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú (Tùy chọn)</label>
              <input value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} type="text" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Tháng 6" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-6 rounded-xl transition-all">Lưu khoản thu</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Tổng thu nhập {filterMonth ? 'tháng ' + filterMonth : ''}</h3>
          <div className="text-3xl font-extrabold text-emerald-600 mb-6">
            {new Intl.NumberFormat('vi-VN').format(totalIncome)}<span className="text-xl">đ</span>
          </div>
          
          <div className="space-y-3">
            {sourceData.map(s => (
              <div key={s.id}>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-slate-600">{s.label}</span>
                  <span className="text-slate-900">{new Intl.NumberFormat('vi-VN').format(s.total)}đ</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${s.color}`} style={{ width: `${(s.total / totalIncome) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/70 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Danh sách khoản thu</h3>
            <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{incomes.length} giao dịch</span>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Đang tải...</div>
          ) : incomes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 dark:text-slate-400">
              <Download className="h-12 w-12 mb-3 text-slate-300" />
              <p>Chưa có khoản thu nào trong thời gian này.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 dark:bg-slate-900/70 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3">Ngày</th>
                    <th className="px-6 py-3">Nguồn</th>
                    <th className="px-6 py-3">Ghi chú</th>
                    <th className="px-6 py-3 text-right">Số tiền</th>
                    <th className="px-6 py-3 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => {
                    const sourceObj = SOURCES.find(s => s.id === item.source);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">{item.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md text-white ${sourceObj?.color || 'bg-slate-500'}`}>
                            {sourceObj?.label || item.source}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{item.note || '-'}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                          +{new Intl.NumberFormat('vi-VN').format(item.amount)}đ
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                            &times;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
