import React, { useState } from 'react';
import { 
  Bell, 
  LogOut, 
  User as UserIcon, 
  TrendingUp, 
  PieChart, 
  Settings, 
  AlertTriangle,
  BookOpen,
  Home,
  CheckCircle,
  HelpCircle,
  DollarSign,
  Target,
  Calendar,
  Repeat,
  Users,
  Mic
} from 'lucide-react';
import { User, Notification } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  onOpenAddExpense: () => void;
  onOpenAddExpenseVoice: () => void;
  isFirebaseOffline?: boolean;
}

export default function Navbar({
  user,
  onLogout,
  activeTab,
  setActiveTab,
  notifications,
  markNotificationAsRead,
  clearNotifications,
  onOpenAddExpense,
  onOpenAddExpenseVoice,
  isFirebaseOffline = false
}: NavbarProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'history', name: 'Sổ Chi Tiêu' },
    { id: 'budget', name: 'Ngân Sách' },
    { id: 'reports', name: 'Báo Cáo' },
    { id: 'incomes', name: 'Thu Nhập' },
    { id: 'groups', name: 'Quỹ Nhóm' },
    { id: 'calendar', name: 'Lịch' }
  ];

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'warning':
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/40 bg-white/60 backdrop-blur-xl shadow-xs transition-colors">
      {isFirebaseOffline && (
        <div id="firebase-offline-alert-strip" className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] sm:text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2 text-center shadow-inner relative z-50">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 animate-pulse" />
          <span>
            <strong>Chế độ Ngoại tuyến (Offline Mode):</strong> Tên miền <strong>{window.location.hostname}</strong> chưa được ủy quyền trên Firebase. Dữ liệu chi tiêu hiện tại chỉ lưu trữ tạm thời trên trình duyệt này!
          </span>
        </div>
      )}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-200 shrink-0">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-sm sm:text-lg font-bold tracking-tight text-slate-900 leading-tight drop-shadow-sm">
              SemTietKiem
            </h1>
            <p className="hidden sm:block text-[10px] font-bold uppercase tracking-wider text-emerald-600 font-mono leading-tight mt-0.5">
              Student Expense MVP
            </p>
          </div>
        </div>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 xl:gap-2">
          {tabs.map((tab) => {
            const isActive = tab.id === 'history'
              ? (activeTab === 'history' || activeTab === 'recurring')
              : activeTab === tab.id;

            if (tab.id === 'history') {
              return (
                <div key={tab.id} className="relative group py-2">
                  <button
                    id={`nav-tab-${tab.id}`}
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs xl:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    title={tab.name}
                  >
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="hidden xl:inline">{tab.name}</span>
                  </button>
                  {/* Dropdown Menu on Hover */}
                  <div className="absolute left-0 mt-1 hidden group-hover:block bg-white border border-slate-100 rounded-xl shadow-lg p-2 min-w-[150px] z-50 animate-fade-in">
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                        activeTab === 'history' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Lịch sử chi tiêu
                    </button>
                    <button
                      onClick={() => setActiveTab('recurring')}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                        activeTab === 'recurring' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Repeat className="h-3.5 w-3.5" />
                      Chi tiêu định kỳ
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs xl:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={tab.name}
              >
                {tab.id === 'dashboard' && <Home className="h-4 w-4 shrink-0" />}
                {tab.id === 'budget' && <Settings className="h-4 w-4 shrink-0" />}
                {tab.id === 'reports' && <PieChart className="h-4 w-4 shrink-0" />}
                {tab.id === 'incomes' && <DollarSign className="h-4 w-4 shrink-0" />}
                {tab.id === 'groups' && <Users className="h-4 w-4 shrink-0" />}
                {tab.id === 'calendar' && <Calendar className="h-4 w-4 shrink-0" />}
                <span className="hidden xl:inline">{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Voice Add Button */}
          <button
            id="quick-voice-expense-btn"
            onClick={onOpenAddExpenseVoice}
            className="flex items-center justify-center rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 p-2 sm:p-2.5 text-rose-600 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Nhập chi tiêu bằng giọng nói"
          >
            <Mic className="h-4.5 w-4.5 sm:h-5 sm:w-5 animate-pulse" />
          </button>

          {/* Quick Add Button */}
          <button
            id="quick-add-expense-btn"
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-500 px-3 sm:px-4 py-2 text-[11px] sm:text-sm font-semibold text-white shadow-sm transition-all inline-flex cursor-pointer whitespace-nowrap"
          >
            <span className="font-bold">+</span> <span className="hidden sm:inline">Nhập chi tiêu</span><span className="inline sm:hidden">Nhập</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              id="notification-bell-btn"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifDropdown(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl ring-1 ring-black/5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <span className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                        <Bell className="h-4 w-4 text-emerald-500" /> Thông báo ({unreadCount})
                      </span>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-xs text-slate-500 hover:text-red-500 transition-colors font-medium"
                        >
                          Xóa tất cả
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          Hiện không có thông báo nào mới.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            id={`notification-item-${notif.id}`}
                            onClick={() => markNotificationAsRead(notif.id)}
                            className={`flex gap-3 rounded-xl p-2.5 cursor-pointer text-left transition-colors border ${
                              notif.read
                                ? 'bg-white border-transparent hover:bg-slate-50'
                                : 'bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50/60'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                            <div className="space-y-0.5">
                              <h4 className={`text-xs font-bold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                                {notif.title}
                              </h4>
                              <p className="text-[11px] leading-relaxed text-slate-500">
                                {notif.message}
                              </p>
                              <span className="block text-[9px] text-slate-400 font-mono">
                                {notif.date}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile / Logout Desktop */}
          <div className="hidden border-l border-slate-200 pl-4 sm:flex items-center gap-3">
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-800">{user.name}</span>
              <span className="block text-[10px] text-slate-400">{user.school}</span>
            </div>
            <button
              onClick={onLogout}
              className="rounded-xl p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile Mobile */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={onLogout}
              className="rounded-xl p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* NAVIGATION MOBILE ROW */}
      <div className="flex md:hidden border-t border-slate-100 bg-slate-50/50 justify-around py-1">
        {tabs.map((tab) => {
          const isActive = tab.id === 'history'
            ? (activeTab === 'history' || activeTab === 'recurring')
            : activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'history') {
                  if (activeTab === 'history') {
                    setActiveTab('recurring');
                  } else {
                    setActiveTab('history');
                  }
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex flex-col items-center gap-1 py-1 text-[10px] font-semibold transition-all ${
                isActive ? 'text-emerald-600 font-bold scale-105' : 'text-slate-500'
              }`}
            >
              {tab.id === 'dashboard' && <Home className="h-4.5 w-4.5" />}
              {tab.id === 'history' && <BookOpen className="h-4.5 w-4.5" />}
              {tab.id === 'budget' && <Settings className="h-4.5 w-4.5" />}
              {tab.id === 'reports' && <PieChart className="h-4.5 w-4.5" />}
              {tab.id === 'incomes' && <DollarSign className="h-4.5 w-4.5" />}
              {tab.id === 'groups' && <Users className="h-4.5 w-4.5" />}
              {tab.id === 'calendar' && <Calendar className="h-4.5 w-4.5" />}
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
