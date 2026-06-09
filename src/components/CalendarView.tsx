import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Expense, Category } from '../types';

interface CalendarViewProps {
  expenses: Expense[];
  categories: Category[];
}

export default function CalendarView({ expenses, categories }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const calendarExpenses = expenses.filter(e => !e.isRecurring);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  
  // Adjust so Monday is first day of week
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startOffset }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getExpensesForDay = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return calendarExpenses.filter(e => e.date === dateStr);
  };

  const getDayColor = (totalAmount: number) => {
    if (totalAmount === 0) return 'bg-white border-slate-100 hover:border-slate-300';
    if (totalAmount < 100000) return 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100';
    if (totalAmount <= 500000) return 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100';
    return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100';
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
  };

  const selectedExpenses = selectedDateStr ? calendarExpenses.filter(e => e.date === selectedDateStr) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Calendar Section */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-500" /> 
              {currentDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase">
            <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {blanks.map(b => <div key={`blank-${b}`} className="aspect-square rounded-xl bg-transparent"></div>)}
            
            {days.map(day => {
              const dayExpenses = getExpensesForDay(day);
              const totalAmount = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
              const isSelected = selectedDateStr === `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              
              return (
                <div 
                  key={day} 
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-xl border p-1 cursor-pointer transition-all flex flex-col justify-between ${getDayColor(totalAmount)} ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                >
                  <span className="text-xs font-bold pl-1">{day}</span>
                  {totalAmount > 0 && (
                    <span className="text-[9px] font-semibold text-center leading-tight truncate px-0.5 pb-0.5">
                      {totalAmount >= 1000000 ? `${(totalAmount/1000000).toFixed(1)}M` : `${totalAmount/1000}k`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200"></div> &lt; 100k</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-200"></div> 100k - 500k</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-100 border border-red-200"></div> &gt; 500k</div>
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
            <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              {selectedDateStr ? `Chi tiết ngày ${selectedDateStr.split('-').reverse().join('/')}` : 'Chọn một ngày để xem'}
            </h3>
            
            {selectedDateStr ? (
              selectedExpenses.length > 0 ? (
                <div className="space-y-4">
                  {selectedExpenses.map(exp => {
                    const cat = categories.find(c => c.id === exp.categoryId);
                    return (
                      <div key={exp.id} className="flex justify-between items-start border-l-2 border-emerald-500 pl-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{exp.title}</p>
                          <p className="text-[10px] text-slate-500">{cat?.name || 'Khác'} {exp.note ? `- ${exp.note}` : ''}</p>
                        </div>
                        <span className="text-sm font-bold text-red-500 whitespace-nowrap pl-2">
                          -{new Intl.NumberFormat('vi-VN').format(exp.amount)}đ
                        </span>
                      </div>
                    );
                  })}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center font-bold">
                    <span className="text-slate-600">Tổng chi:</span>
                    <span className="text-lg text-slate-900">{new Intl.NumberFormat('vi-VN').format(selectedExpenses.reduce((s,e)=>s+e.amount,0))}đ</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">Không có khoản chi nào trong ngày này.</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-slate-400">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Click vào ngày trên lịch để xem chi tiết.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
