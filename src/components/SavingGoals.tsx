import React, { useState, useEffect } from 'react';
import { Target, Plus, TrendingUp, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { SavingGoal, User } from '../types';
import { ApiService } from '../lib/api';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';

interface SavingGoalsProps {
  user: User;
}

export default function SavingGoals({ user }: SavingGoalsProps) {
  const [goals, setGoals] = useState<(SavingGoal & { percent?: number; daysLeft?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    categoryId: 'study'
  });

  useEffect(() => {
    loadGoals();
  }, [user]);

  const loadGoals = async () => {
    setIsLoading(true);
    const localGoalsKey = `sem_${user.id}_saving_goals`;
    const isGuest = localStorage.getItem('sem_guest_mode') === 'true';

    const computeProgress = (goals: SavingGoal[]) =>
      goals.map(g => {
        const now = new Date();
        const deadline = new Date(g.deadline);
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const percent = g.targetAmount > 0
          ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
          : 0;
        return { ...g, percent, daysLeft };
      });

    if (!isGuest && auth.currentUser) {
      try {
        const data = await ApiService.getSavingGoals();
        const withProgress = computeProgress(data);
        setGoals(withProgress);
        localStorage.setItem(localGoalsKey, JSON.stringify(withProgress));
        setIsLoading(false);
        return;
      } catch (e) {
        console.warn('Firestore getSavingGoals failed, falling back:', e);
      }
    }

    // Guest / offline fallback: Express API then localStorage
    try {
      const res = await fetch('/api/saving-goals', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sem_token')}` }
      });
      if (res.ok) {
        const data: SavingGoal[] = await res.json();
        const withProgress = await Promise.all(data.map(async (g) => {
          const pRes = await fetch(`/api/saving-goals/${g.id}/progress`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('sem_token')}` }
          });
          if (pRes.ok) { const pData = await pRes.json(); return { ...g, ...pData }; }
          return g;
        }));
        setGoals(withProgress);
        localStorage.setItem(localGoalsKey, JSON.stringify(withProgress));
      } else { throw new Error('API failed'); }
    } catch (e) {
      console.warn('Express API failed, using localStorage:', e);
      const stored = localStorage.getItem(localGoalsKey);
      if (stored) setGoals(JSON.parse(stored));
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const localGoalsKey = `sem_${user.id}_saving_goals`;
    const isGuest = localStorage.getItem('sem_guest_mode') === 'true';
    const daysLeft = Math.ceil((new Date(formData.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (!isGuest && auth.currentUser) {
      try {
        await ApiService.createSavingGoal({
          name: formData.name,
          targetAmount: Number(formData.targetAmount),
          currentAmount: 0,
          deadline: formData.deadline,
          status: 'On Track',
          categoryId: formData.categoryId
        });
        setShowForm(false);
        setFormData({ name: '', targetAmount: '', deadline: '', categoryId: 'study' });
        loadGoals();
        return;
      } catch (e) {
        console.warn('Firestore createSavingGoal failed, falling back:', e);
      }
    }

    // Guest / offline fallback
    const newGoal: SavingGoal & { percent?: number; daysLeft?: number } = {
      id: `goal_added_${Date.now()}`,
      userId: user.id,
      name: formData.name,
      targetAmount: Number(formData.targetAmount),
      currentAmount: 0,
      deadline: formData.deadline,
      status: 'On Track',
      categoryId: formData.categoryId,
      percent: 0,
      daysLeft
    };
    try {
      const res = await fetch('/api/saving-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('sem_token')}` },
        body: JSON.stringify({ name: formData.name, targetAmount: Number(formData.targetAmount), deadline: formData.deadline, categoryId: formData.categoryId })
      });
      if (!res.ok) throw new Error('API failed');
    } catch {
      const stored = localStorage.getItem(localGoalsKey);
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem(localGoalsKey, JSON.stringify([newGoal, ...list]));
    }
    setShowForm(false);
    setFormData({ name: '', targetAmount: '', deadline: '', categoryId: 'study' });
    loadGoals();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mục tiêu này?')) return;
    const localGoalsKey = `sem_${user.id}_saving_goals`;
    const isGuest = localStorage.getItem('sem_guest_mode') === 'true';

    if (!isGuest && auth.currentUser) {
      try {
        await ApiService.deleteSavingGoal(id);
        loadGoals();
        return;
      } catch (e) {
        console.warn('Firestore deleteSavingGoal failed, falling back:', e);
      }
    }

    try {
      const res = await fetch(`/api/saving-goals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sem_token')}` }
      });
      if (res.ok) { loadGoals(); return; }
    } catch {}
    const stored = localStorage.getItem(localGoalsKey);
    if (stored) {
      const list = JSON.parse(stored) as SavingGoal[];
      localStorage.setItem(localGoalsKey, JSON.stringify(list.filter(g => g.id !== id)));
      loadGoals();
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="h-6 w-6 text-emerald-500" /> Mục tiêu tiết kiệm
          </h2>
          <p className="text-slate-500 text-sm mt-1">Theo dõi tiến trình đạt mục tiêu dựa trên số dư ví của bạn</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm shadow-emerald-200"
        >
          <Plus className="h-4 w-4" /> {showForm ? 'Hủy' : 'Thêm mục tiêu'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-2xl">
          <h3 className="font-semibold text-slate-800 mb-4">Tạo mục tiêu mới</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tên mục tiêu</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="Ví dụ: Mua laptop mới" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Số tiền mục tiêu (đ)</label>
              <input required value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: e.target.value})} type="number" min="0" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" placeholder="20000000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hạn chót (Deadline)</label>
              <input required value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-4 rounded-xl transition-all">Lưu mục tiêu</button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-800 text-lg">{goal.name}</h3>
              <button onClick={() => handleDelete(goal.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                &times;
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold text-emerald-600">
                {new Intl.NumberFormat('vi-VN').format(goal.currentAmount || 0)}đ
              </span>
              <span className="text-xs font-medium text-slate-400">
                / {new Intl.NumberFormat('vi-VN').format(goal.targetAmount)}đ
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  goal.status === 'Completed' ? 'bg-emerald-500' :
                  goal.status === 'At Risk' ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${goal.percent || 0}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-xs font-medium">
              <span className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${
                goal.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                goal.status === 'At Risk' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {goal.status === 'Completed' ? <CheckCircle className="h-3 w-3" /> :
                 goal.status === 'At Risk' ? <AlertTriangle className="h-3 w-3" /> :
                 <TrendingUp className="h-3 w-3" />}
                {goal.status} ({goal.percent}%)
              </span>

              <span className="flex items-center gap-1 text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                <Calendar className="h-3 w-3" /> Còn {goal.daysLeft} ngày
              </span>
            </div>
          </div>
        ))}

        {goals.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-600 font-semibold">Chưa có mục tiêu tiết kiệm</h3>
            <p className="text-slate-400 text-sm mt-1">Tạo mục tiêu để có động lực phấn đấu nhé!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
