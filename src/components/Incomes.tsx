import React, { useState } from 'react';
import { Income, User } from '../types';
import { Wallet, Plus, Trash2, TrendingUp, Calendar, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IncomesProps {
  user: User;
  incomes: Income[];
  onAddIncome: (income: Omit<Income, 'id' | 'userId'>) => Promise<void>;
  onDeleteIncome: (id: string) => Promise<void>;
}

const SOURCES = [
  { id: 'scholarship', label: 'Học bổng', color: 'bg-blue-500' },
  { id: 'part_time', label: 'Làm thêm', color: 'bg-emerald-500' },
  { id: 'family', label: 'Gia đình', color: 'bg-amber-500' },
  { id: 'other', label: 'Khác', color: 'bg-purple-500' },
];

export default function Incomes({ user, incomes, onAddIncome, onDeleteIncome }: IncomesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('part_time');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !source || !date) return;

    await onAddIncome({
      amount: Number(amount),
      source: source as any,
      date,
      note
    });

    setAmount('');
    setNote('');
    setIsAdding(false);
  };

  const getSourceDetails = (sourceId: string) => {
    return SOURCES.find(s => s.id === sourceId) || SOURCES[3];
  };

  // Tính toán dữ liệu biểu đồ phân bổ
  const sourceTotals = incomes.reduce((acc, inc) => {
    acc[inc.source] = (acc[inc.source] || 0) + inc.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalIncome = Object.values(sourceTotals).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wallet className="w-7 h-7 text-emerald-500" />
            Quản lý thu nhập
          </h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi các nguồn tiền vào của bạn</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          {isAdding ? 'Hủy' : <><Plus className="w-5 h-5" /> Thêm thu nhập</>}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền (VNĐ)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    placeholder="VD: 5000000"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nguồn thu</label>
                  <select
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {SOURCES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ngày nhận</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú (Tùy chọn)</label>
                  <input 
                    type="text" 
                    value={note} 
                    onChange={e => setNote(e.target.value)}
                    placeholder="VD: Lương tháng 5..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-xl font-medium transition-colors">
                  Lưu thu nhập
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ phân bổ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-1 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Phân bổ thu nhập
          </h3>
          
          <div className="flex-1 flex flex-col justify-center space-y-4">
            {totalIncome === 0 ? (
              <p className="text-center text-slate-500 text-sm">Chưa có dữ liệu thu nhập</p>
            ) : (
              SOURCES.map(src => {
                const srcTotal = sourceTotals[src.id] || 0;
                const percent = (srcTotal / totalIncome) * 100;
                if (srcTotal === 0) return null;
                
                return (
                  <div key={src.id} className="space-y-1 text-sm">
                    <div className="flex justify-between items-end">
                      <span className="font-medium text-slate-700">{src.label}</span>
                      <span className="text-slate-500">{new Intl.NumberFormat('vi-VN').format(srcTotal)}đ ({percent.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`${src.color} h-2 rounded-full`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Danh sách Lịch sử thu nhập */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-slate-100">
             <h3 className="text-lg font-bold text-slate-800">Lịch sử giao dịch</h3>
          </div>
          {incomes.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Wallet className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              Chưa có khoản thu nhập nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Nguồn / Ghi chú</th>
                    <th className="px-6 py-4">Ngày nhận</th>
                    <th className="px-6 py-4 text-right">Số tiền</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(inc => {
                    const srcInfo = getSourceDetails(inc.source);
                    return (
                      <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${srcInfo.color}`} />
                            <div>
                              <p className="font-medium text-slate-800">{srcInfo.label}</p>
                              {inc.note && <p className="text-xs text-slate-500 mt-0.5">{inc.note}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Calendar className="w-4 h-4" />
                            {inc.date.split('-').reverse().join('/')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                          +{new Intl.NumberFormat('vi-VN').format(inc.amount)}đ
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => onDeleteIncome(inc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
    </div>
  );
}
