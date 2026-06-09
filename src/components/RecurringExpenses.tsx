import React, { useState, useEffect } from 'react';
import { Repeat, Plus, Calendar } from 'lucide-react';
import { RecurringExpense, User, Category } from '../types';

interface RecurringExpensesProps {
  user: User;
  categories: Category[];
}

export default function RecurringExpenses({ user, categories }: RecurringExpensesProps) {
  const [recs, setRecs] = useState<RecurringExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    categoryId: 'rent',
    cycle: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    loadRecs();
  }, [user]);

  const loadRecs = async () => {
    setIsLoading(true);
    const localRecsKey = `sem_${user.id}_recurring_expenses`;
    try {
      const res = await fetch('/api/recurring-expenses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sem_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecs(data);
        localStorage.setItem(localRecsKey, JSON.stringify(data));
      } else {
        throw new Error('API load failed');
      }
    } catch (e) {
      console.warn("API load recurring expenses failed, using local fallback:", e);
      const stored = localStorage.getItem(localRecsKey);
      if (stored) {
        setRecs(JSON.parse(stored));
      }
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const localRecsKey = `sem_${user.id}_recurring_expenses`;
    
    // Calculate repeatOn locally
    const dateObj = new Date(formData.startDate);
    let repeatOn = '';
    if (formData.cycle === 'MONTHLY') {
      repeatOn = `Ngày ${dateObj.getDate()} hàng tháng`;
    } else {
      const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      repeatOn = `${weekdays[dateObj.getDay()]} hàng tuần`;
    }

    const newRec: RecurringExpense = {
      id: `rec_added_${Date.now()}`,
      userId: user.id,
      amount: Number(formData.amount),
      categoryId: formData.categoryId,
      title: formData.title,
      cycle: formData.cycle as any,
      startDate: formData.startDate,
      note: formData.note,
      repeatOn
    };

    try {
      const res = await fetch('/api/recurring-expenses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sem_token')}`
        },
        body: JSON.stringify({
          title: newRec.title,
          amount: newRec.amount,
          categoryId: newRec.categoryId,
          cycle: newRec.cycle,
          startDate: newRec.startDate,
          note: newRec.note,
          repeatOn: newRec.repeatOn
        })
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ ...formData, title: '', amount: '', note: '' });
        loadRecs();
      } else {
        throw new Error('API save failed');
      }
    } catch (e) {
      console.warn("Saving recurring expense offline locally:", e);
      const stored = localStorage.getItem(localRecsKey);
      const list = stored ? JSON.parse(stored) : [];
      const updated = [newRec, ...list];
      localStorage.setItem(localRecsKey, JSON.stringify(updated));
      setShowForm(false);
      setFormData({ ...formData, title: '', amount: '', note: '' });
      loadRecs();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy bỏ khoản chi định kỳ này?')) return;
    const localRecsKey = `sem_${user.id}_recurring_expenses`;
    try {
      const res = await fetch(`/api/recurring-expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sem_token')}` }
      });
      if (res.ok) {
        loadRecs();
      } else {
        throw new Error('API delete failed');
      }
    } catch (e) {
      console.warn("Deleting recurring expense offline locally:", e);
      const stored = localStorage.getItem(localRecsKey);
      if (stored) {
        const list = JSON.parse(stored) as RecurringExpense[];
        const updated = list.filter(r => r.id !== id);
        localStorage.setItem(localRecsKey, JSON.stringify(updated));
        loadRecs();
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Repeat className="h-6 w-6 text-emerald-500" /> Chi tiêu định kỳ
          </h2>
          <p className="text-slate-500 text-sm mt-1">Tự động hóa việc ghi nhận các khoản chi cố định hàng tháng/tuần</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm shadow-emerald-200"
        >
          <Plus className="h-4 w-4" /> {showForm ? 'Hủy' : 'Thêm mới'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-3xl">
          <h3 className="font-semibold text-slate-800 mb-4">Cấu hình chi tiêu định kỳ mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tên khoản chi</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Ví dụ: Tiền phòng trọ" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Số tiền (đ)</label>
              <input required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} type="number" min="0" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="1500000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Danh mục</label>
              <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Chu kỳ</label>
                <select required value={formData.cycle} onChange={e => setFormData({...formData, cycle: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                  <option value="MONTHLY">Hàng tháng</option>
                  <option value="WEEKLY">Hàng tuần</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Ngày bắt đầu</label>
                <input required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-6 rounded-xl transition-all">Lưu cấu hình</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Đang tải...</div>
      ) : recs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
          <Repeat className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-600 font-semibold">Chưa cấu hình chi tiêu định kỳ</h3>
          <p className="text-slate-400 text-sm mt-1">Giúp bạn không quên các khoản như tiền trọ, điện nước, internet hàng tháng.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recs.map(item => {
            const cat = categories.find(c => c.id === item.categoryId);
            return (
              <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-all group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat ? cat.color : 'bg-slate-500'}`}>
                  <Repeat className={`h-6 w-6 text-white`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-800">{item.title}</h3>
                    <button onClick={() => handleDelete(item.id)} className="text-xs font-medium text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Hủy</button>
                  </div>
                  <div className="text-emerald-600 font-extrabold text-lg mb-2">
                    {new Intl.NumberFormat('vi-VN').format(item.amount)}đ
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                      {item.repeatOn || (item.cycle === 'MONTHLY' ? 'Mỗi tháng' : 'Mỗi tuần')}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-md flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Từ {item.startDate.split('-').reverse().join('/')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
