import React, { useState, useEffect } from 'react';
import { Repeat, Calendar, AlertTriangle } from 'lucide-react';
import { RecurringExpense, User, Category } from '../types';
import { ApiService } from '../lib/api';
import { auth } from '../lib/firebase';

interface RecurringExpensesProps {
  user: User;
  categories: Category[];
}

export default function RecurringExpenses({ user, categories }: RecurringExpensesProps) {
  const [recs, setRecs] = useState<RecurringExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<RecurringExpense | null>(null);
  
  useEffect(() => {
    loadRecs();
  }, [user]);

  const loadRecs = async () => {
    setIsLoading(true);
    const localRecsKey = `sem_${user.id}_recurring_expenses`;
    const isGuest = localStorage.getItem('sem_guest_mode') === 'true';

    if (!isGuest && auth.currentUser) {
      try {
        const data = await ApiService.getRecurringExpenses();
        setRecs(data);
        localStorage.setItem(localRecsKey, JSON.stringify(data));
        setIsLoading(false);
        return;
      } catch (e) {
        console.warn('Firestore getRecurringExpenses failed, falling back:', e);
      }
    }

    // Guest / offline fallback
    try {
      const res = await fetch('/api/recurring-expenses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sem_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecs(data);
        localStorage.setItem(localRecsKey, JSON.stringify(data));
      } else { throw new Error('API failed'); }
    } catch (e) {
      console.warn('Express API failed, using localStorage:', e);
      const stored = localStorage.getItem(localRecsKey);
      if (stored) setRecs(JSON.parse(stored));
    }
    setIsLoading(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    const localRecsKey = `sem_${user.id}_recurring_expenses`;
    const isGuest = localStorage.getItem('sem_guest_mode') === 'true';

    if (!isGuest && auth.currentUser) {
      try {
        await ApiService.deleteRecurringExpense(id);
        setDeleteTarget(null);
        loadRecs();
        return;
      } catch (e) {
        console.warn('Firestore deleteRecurringExpense failed, falling back:', e);
      }
    }

    try {
      const res = await fetch(`/api/recurring-expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sem_token')}` }
      });
      if (res.ok) { loadRecs(); }
      else { throw new Error('API failed'); }
    } catch (e) {
      console.warn('Express API failed, using localStorage:', e);
      const stored = localStorage.getItem(localRecsKey);
      if (stored) {
        const list = JSON.parse(stored) as RecurringExpense[];
        localStorage.setItem(localRecsKey, JSON.stringify(list.filter(r => r.id !== id)));
        loadRecs();
      }
    } finally {
      setDeleteTarget(null);
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
      </div>

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
                    <button onClick={() => setDeleteTarget(item)} className="text-xs font-medium text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">Hủy</button>
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

      {/* Custom Alert Modal for Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 transform scale-100 transition-all duration-300 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <div className="p-3 bg-amber-50 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Xác nhận xóa chi tiêu định kỳ</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa chi tiêu định kỳ <strong className="text-slate-800">"{deleteTarget.title}"</strong>? 
              Hành động này không thể hoàn tác và hệ thống sẽ dừng tự động ghi nhận các khoản chi này trong tương lai.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm shadow-sm shadow-red-200 transition-all"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
