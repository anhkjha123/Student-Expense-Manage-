import React, { useState } from 'react';
import { Expense, Category } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarViewProps {
  expenses: Expense[];
  categories: Category[];
}

export default function CalendarView({ expenses, categories }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Make Monday the first day

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Map expenses to dates
  const dailyTotals: Record<string, number> = {};
  const dailyExpenses: Record<string, Expense[]> = {};

  expenses.forEach(exp => {
    const dStr = exp.date;
    dailyTotals[dStr] = (dailyTotals[dStr] || 0) + exp.amount;
    if (!dailyExpenses[dStr]) dailyExpenses[dStr] = [];
    dailyExpenses[dStr].push(exp);
  });

  const getDayColorClass = (total: number) => {
    if (total === 0) return 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100';
    if (total <= 100000) return 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100';
    if (total <= 500000) return 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100';
    return 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100';
  };

  const selectedExpenses = selectedDateStr ? (dailyExpenses[selectedDateStr] || []) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-emerald-500" />
          Lịch chi tiêu
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-semibold text-slate-700 w-32 text-center">Tháng {month + 1}, {year}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-7 gap-2 mb-4 text-center font-medium text-slate-500 text-sm">
          <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square bg-slate-50/50 rounded-xl border border-dashed border-slate-200" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
            const total = dailyTotals[dateStr] || 0;
            const isSelected = selectedDateStr === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`aspect-square p-2 rounded-xl flex flex-col justify-between transition-all relative overflow-hidden ${getDayColorClass(total)} ${isSelected ? 'ring-2 ring-slate-800 ring-offset-2' : ''}`}
              >
                <span className="font-semibold text-sm self-start">{dayNum}</span>
                {total > 0 && (
                  <span className="text-[10px] font-bold self-end sm:text-xs">
                    {(total / 1000).toFixed(0)}k
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400"></span> &lt; 100k</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400"></span> 100k - 500k</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-400"></span> &gt; 500k</div>
        </div>
      </div>

      {/* Selected Date Details Panel */}
      <AnimatePresence>
        {selectedDateStr && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-slate-800 rounded-2xl shadow-lg p-6 text-white"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Chi tiết ngày {selectedDateStr.split('-').reverse().join('/')}</h3>
              <button onClick={() => setSelectedDateStr(null)} className="p-1 hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            {selectedExpenses.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Không có khoản chi nào trong ngày này.</p>
            ) : (
              <div className="space-y-3">
                {selectedExpenses.map(exp => {
                  const cat = categories.find(c => c.id === exp.categoryId);
                  return (
                    <div key={exp.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg bg-white/10`}>
                           {/* Icon placeholder since dynamic icon load requires parsing */}
                           <CalendarIcon className="w-4 h-4 text-emerald-400" />
                         </div>
                         <div>
                           <p className="font-medium text-slate-100">{exp.title}</p>
                           <p className="text-xs text-slate-400">{cat?.name}</p>
                         </div>
                      </div>
                      <span className="font-bold text-emerald-400">-{new Intl.NumberFormat('vi-VN').format(exp.amount)}đ</span>
                    </div>
                  );
                })}
                <div className="pt-4 border-t border-slate-600 flex justify-between items-center font-bold">
                  <span className="text-slate-300">Tổng cộng</span>
                  <span className="text-xl text-rose-400">-{new Intl.NumberFormat('vi-VN').format(dailyTotals[selectedDateStr])}đ</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
