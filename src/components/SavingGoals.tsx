import React, { useState, useEffect } from 'react';
import { SavingGoal, User } from '../types';
import { ApiService } from '../lib/api';
import { Target, Plus, CheckCircle2, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SavingGoalsProps {
  user: User;
  savingGoals: SavingGoal[];
  onAddGoal: (goal: Omit<SavingGoal, 'id' | 'userId'>) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

export default function SavingGoals({ user, savingGoals, onAddGoal, onDeleteGoal }: SavingGoalsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) return;

    await onAddGoal({
      name,
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      deadline,
      status: 'on_track'
    });

    setName('');
    setTargetAmount('');
    setDeadline('');
    setIsAdding(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': return { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-100', text: 'Hoàn thành' };
      case 'at_risk': return { icon: <AlertCircle className="w-4 h-4" />, color: 'text-rose-600 bg-rose-100', text: 'Rủi ro' };
      default: return { icon: <Target className="w-4 h-4" />, color: 'text-blue-600 bg-blue-100', text: 'Đúng tiến độ' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-7 h-7 text-emerald-500" />
            Mục tiêu tiết kiệm
          </h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi tiến độ đạt được ước mơ của bạn</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          {isAdding ? 'Hủy' : <><Plus className="w-5 h-5" /> Thêm mục tiêu</>}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên mục tiêu</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="VD: Mua Laptop mới"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền mục tiêu (VNĐ)</label>
                  <input 
                    type="number" 
                    value={targetAmount} 
                    onChange={e => setTargetAmount(e.target.value)}
                    placeholder="VD: 20000000"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày hoàn thành</label>
                  <input 
                    type="date" 
                    value={deadline} 
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-xl font-medium transition-colors">
                  Lưu mục tiêu
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {savingGoals.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">Chưa có mục tiêu nào</h3>
            <p className="text-slate-500">Hãy thêm một mục tiêu để bắt đầu tiết kiệm.</p>
          </div>
        ) : (
          savingGoals.map(goal => {
            const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
            const statusCfg = getStatusConfig(goal.status);

            return (
              <motion.div 
                key={goal.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 hover:shadow-md transition-shadow group relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{goal.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.color}`}>
                        {statusCfg.icon}
                        {statusCfg.text}
                      </span>
                      {daysLeft >= 0 ? (
                        <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          Còn {daysLeft} ngày
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          Quá hạn {Math.abs(daysLeft)} ngày
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 mb-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{new Intl.NumberFormat('vi-VN').format(goal.currentAmount)}đ</span>
                    <span className="text-slate-500">{new Intl.NumberFormat('vi-VN').format(goal.targetAmount)}đ</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${percent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    />
                  </div>
                  <p className="text-xs text-right font-medium text-slate-500">{percent.toFixed(1)}%</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
