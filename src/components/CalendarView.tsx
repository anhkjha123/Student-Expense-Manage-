import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { Expense, Category, RecurringExpense } from '../types';

interface CalendarViewProps {
  expenses: Expense[];
  categories: Category[];
  recurringExpenses?: RecurringExpense[];
}

/**
 * Generate all dates in YYYY-MM-DD format that a recurring expense fires
 * within the given year/month.
 */
function getRecurringDatesForMonth(rec: RecurringExpense, year: number, month: number): string[] {
  const start = new Date(rec.startDate + 'T00:00:00');
  const results: string[] = [];

  if (rec.cycle === 'MONTHLY') {
    // Same day of month as startDate, every month
    const day = start.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    if (
      (year > start.getFullYear() || (year === start.getFullYear() && month >= start.getMonth())) &&
      day <= daysInMonth
    ) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      results.push(dateStr);
    }
  } else if (rec.cycle === 'WEEKLY') {
    // Same day of week as startDate, every week within the month
    const startDow = start.getDay(); // 0=Sun, 1=Mon ...
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const candidate = new Date(year, month, d);
      if (candidate.getDay() !== startDow) continue;
      if (candidate < start) continue;
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      results.push(dateStr);
    }
  }

  return results;
}

export default function CalendarView({ expenses, categories, recurringExpenses = [] }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startOffset }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Build a map: dateStr -> list of virtual recurring occurrences
  const recurringByDate = useMemo(() => {
    const map: Record<string, RecurringExpense[]> = {};
    for (const rec of recurringExpenses) {
      const dates = getRecurringDatesForMonth(rec, year, month);
      for (const dateStr of dates) {
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(rec);
      }
    }
    return map;
  }, [recurringExpenses, year, month]);

  const getExpensesForDay = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return expenses.filter(e => e.date === dateStr);
  };

  const getRecurringForDay = (day: number): RecurringExpense[] => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return recurringByDate[dateStr] || [];
  };

  const getDayColor = (totalAmount: number, hasRecurring: boolean) => {
    if (hasRecurring && totalAmount === 0) return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-200';
    if (totalAmount === 0) return 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-slate-200';
    if (totalAmount < 100000) return 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900';
    if (totalAmount <= 500000) return 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900';
    return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900';
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setSelectedDateStr(prev => prev === dateStr ? null : dateStr);
  };

  const selectedExpenses = selectedDateStr ? expenses.filter(e => e.date === selectedDateStr) : [];
  const selectedRecurring = selectedDateStr ? (recurringByDate[selectedDateStr] || []) : [];

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    return `${(amount / 1000).toFixed(0)}k`;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Calendar Section */}
        <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-500" />
              {currentDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-200" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-200" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase">
            <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {blanks.map(b => <div key={`blank-${b}`} className="aspect-square rounded-xl bg-transparent" />)}

            {days.map(day => {
              const dayExpenses = getExpensesForDay(day);
              const dayRecurring = getRecurringForDay(day);
              const loggedTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
              const recurringTotal = dayRecurring.reduce((sum, r) => sum + r.amount, 0);
              const totalAmount = loggedTotal + recurringTotal;
              const hasRecurring = dayRecurring.length > 0;
              const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
              const isSelected = selectedDateStr === dateStr;

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-xl border p-1 cursor-pointer transition-all flex flex-col justify-between relative ${getDayColor(totalAmount, hasRecurring)} ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                >
                  <span className="text-xs font-bold pl-1">{day}</span>

                  {/* Blue dot indicator for recurring expenses */}
                  {hasRecurring && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}

                  {totalAmount > 0 && (
                    <span className="text-[9px] font-semibold text-center leading-tight truncate px-0.5 pb-0.5">
                      {formatAmount(totalAmount)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-450">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800" /> &lt; 100k</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-amber-100 dark:bg-amber-950 border border-amber-200 dark:border-amber-800" /> 100k - 500k</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800" /> &gt; 500k</div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 relative flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-blue-500 absolute top-0 right-0" />
              </div>
              Định kỳ
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              {selectedDateStr
                ? `Chi tiết ngày ${selectedDateStr.split('-').reverse().join('/')}`
                : 'Chọn một ngày để xem'}
            </h3>

            {selectedDateStr ? (
              (selectedExpenses.length > 0 || selectedRecurring.length > 0) ? (
                <div className="space-y-4">

                  {/* Logged expenses */}
                  {selectedExpenses.map(exp => {
                    const cat = categories.find(c => c.id === exp.categoryId);
                    return (
                      <div key={exp.id} className="flex justify-between items-start border-l-2 border-emerald-500 pl-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{exp.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{cat?.name || 'Khác'}{exp.note ? ` - ${exp.note}` : ''}</p>
                        </div>
                        <span className="text-sm font-bold text-red-500 whitespace-nowrap pl-2">
                          -{new Intl.NumberFormat('vi-VN').format(exp.amount)}đ
                        </span>
                      </div>
                    );
                  })}

                  {/* Virtual recurring occurrences */}
                  {selectedRecurring.map(rec => {
                    const cat = categories.find(c => c.id === rec.categoryId);
                    return (
                      <div key={`rec-${rec.id}`} className="flex justify-between items-start border-l-2 border-blue-400 pl-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rec.title}</p>
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full">
                              <Repeat className="h-2.5 w-2.5" />
                              Định kỳ
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{cat?.name || 'Khác'}{rec.note ? ` - ${rec.note}` : ''}</p>
                        </div>
                        <span className="text-sm font-bold text-blue-600 whitespace-nowrap pl-2">
                          -{new Intl.NumberFormat('vi-VN').format(rec.amount)}đ
                        </span>
                      </div>
                    );
                  })}

                  {/* Total */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center font-bold">
                    <span className="text-slate-600 dark:text-slate-400 font-bold">Tổng chi:</span>
                    <span className="text-lg text-slate-900 dark:text-slate-100">
                      {new Intl.NumberFormat('vi-VN').format(
                        selectedExpenses.reduce((s, e) => s + e.amount, 0) +
                        selectedRecurring.reduce((s, r) => s + r.amount, 0)
                      )}đ
                    </span>
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
