import React, { useState } from 'react';
import { 
  TrendingUp, 
  Mail, 
  User as UserIcon, 
  GraduationCap, 
  Coins, 
  PiggyBank, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types';
import { ApiService } from '../lib/api';

interface LoginRegisterProps {
  onLoginSuccess: (user: User) => void;
  mockStudent: User;
}

export default function LoginRegister({
  onLoginSuccess,
  mockStudent
}: LoginRegisterProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // States đăng ký mới
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regIncome, setRegIncome] = useState('4,000,000');
  const [regSaving, setRegSaving] = useState('500,000');
  const [regPassword, setRegPassword] = useState('123456');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const { user, token } = await ApiService.login(mockStudent.email, '123456');
      onLoginSuccess(user);
    } catch (err: any) {
      console.warn('Backend offline, dropping to localStorage demo mode', err);
      onLoginSuccess(mockStudent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (!email || !password) {
      setErrorMsg('Vui lòng nhập Email sinh viên và mật khẩu.');
      setIsLoading(false);
      return;
    }

    try {
      const { user } = await ApiService.login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      console.warn('Backend login error or offline, falling back directly:', err);
      // Fallback cho chế độ offline/client-only nếu backend chưa sẵn sàng hoàn toàn
      if (email.toLowerCase() === mockStudent.email.toLowerCase()) {
        onLoginSuccess(mockStudent);
      } else {
        const standardUser: User = {
          id: 'new_user_random',
          email: email,
          name: email.split('@')[0],
          school: 'Đại học Quốc gia Việt Nam',
          monthlyIncome: 4000000,
          savingGoal: 400000,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        onLoginSuccess(standardUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (!regEmail || !regName || !regSchool || !regPassword) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      setIsLoading(false);
      return;
    }

    const numIncome = parseFloat(regIncome.replace(/,/g, ''));
    const numSaving = parseFloat(regSaving.replace(/,/g, ''));

    if (isNaN(numIncome) || numIncome <= 0) {
      setErrorMsg('Tổng thu nhập chu cấp phải lớn hơn 0đ.');
      setIsLoading(false);
      return;
    }

    try {
      const { user } = await ApiService.register({
        email: regEmail,
        passwordString: regPassword,
        name: regName,
        school: regSchool,
        monthlyIncome: numIncome,
        savingGoal: isNaN(numSaving) ? 0 : numSaving
      });
      onLoginSuccess(user);
    } catch (err: any) {
      console.warn('Backend register error or offline, falling back directly:', err);
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: regEmail,
        name: regName,
        school: regSchool,
        monthlyIncome: numIncome,
        savingGoal: isNaN(numSaving) ? 0 : numSaving,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      onLoginSuccess(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncomeFormat = (val: string) => {
    const value = val.replace(/\D/g, '');
    if (value) {
      setRegIncome(new Intl.NumberFormat('en-US').format(parseFloat(value)));
    } else {
      setRegIncome('0');
    }
  };

  const handleSavingFormat = (val: string) => {
    const value = val.replace(/\D/g, '');
    if (value) {
      setRegSaving(new Intl.NumberFormat('en-US').format(parseFloat(value)));
    } else {
      setRegSaving('0');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 px-4 sm:px-6 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-slate-150 shadow-xl transition-all">
        
        {/* APP LOGO SECTION */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200 animate-pulse-subtle">
            <TrendingUp className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
              Student Expense Manager
            </h2>
            <p className="text-xs text-slate-500 max-w-[260px] mx-auto font-medium leading-relaxed">
              Giải pháp tích lũy thông minh, thắt chặt tiền tiêu dưới 10 giây cho Sinh viên Việt Nam!
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-700 leading-normal">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* MOCK LOGIN ACCELERATOR CARD */}
        {!isRegistering && (
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Trải nghiệm thử tài khoản sinh viên mẫu:
            </h4>
            <div className="text-xs text-slate-600 leading-relaxed font-semibold">
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">sinhvien@hust.edu.vn</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Mật khẩu:</span>
                <span className="text-slate-400">Gõ mẫu bất kỳ</span>
              </div>
            </div>
            
            <button
              type="button"
              id="try-demo-user-btn"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full mt-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 px-4 text-xs font-bold text-white transition-colors cursor-pointer text-center disabled:opacity-50"
            >
              🚀 Vào thẳng bằng Tài khoản Mẫu (Bách Khoa)
            </button>
          </div>
        )}

        {/* FORM RENDER */}
        {!isRegistering ? (
          /* LOGIN FORM */
          <form className="mt-4 space-y-4" onSubmit={handleLogin}>
            <div className="space-y-4 rounded-2xl">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email sinh viên (edu) hoặc cá nhân
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-emerald-500 overflow-hidden shadow-xs">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@username.com..."
                    className="w-full py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mật khẩu truy cập
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-emerald-500 overflow-hidden shadow-xs">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-2.5 px-4 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              id="student-login-submit"
              type="submit"
              className="group relative flex w-full justify-center rounded-xl bg-slate-900 hover:bg-slate-850 py-3 text-sm font-bold text-white shadow-md transition-all cursor-pointer"
            >
              Đăng nhập tài khoản <ArrowRight className="ml-2 h-4 w-4 self-center" />
            </button>

            <div className="text-center text-xs text-slate-500">
              Chưa có tài khoản quản lý?{' '}
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                Đăng ký thành viên mới
              </button>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM (Onboarding Setup Form) */
          <form className="mt-4 space-y-4" onSubmit={handleRegister}>
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email liên hệ
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-emerald-500 overflow-hidden">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="sv@daihoc.edu.vn"
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Họ và tên
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-emerald-500 overflow-hidden">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ví dụ: Hoàng Đức Anh"
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Trường đại học / Cao đẳng
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-emerald-500 overflow-hidden">
                  <input
                    type="text"
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    placeholder="Đại Học Kinh Tế Quốc Dân"
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Mật khẩu tài khoản
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-emerald-500 overflow-hidden">
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-800 focus:outline-none"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Thu nhập tháng (VND)
                  </label>
                  <div className="relative rounded-xl border border-slate-200 overflow-hidden">
                    <input
                      type="text"
                      value={regIncome}
                      onChange={(e) => handleIncomeFormat(e.target.value)}
                      className="w-full py-2 px-3 text-xs font-bold font-mono text-slate-800 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mục tiêu cất trữ (VND)
                  </label>
                  <div className="relative rounded-xl border border-slate-200 overflow-hidden">
                    <input
                      type="text"
                      value={regSaving}
                      onChange={(e) => handleSavingFormat(e.target.value)}
                      className="w-full py-2 px-3 text-xs font-bold font-mono text-slate-800 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              id="student-register-submit"
              type="submit"
              className="group relative flex w-full justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-bold text-white shadow-md transition-all cursor-pointer"
            >
              Hoàn tất Onboarding & Vào hệ thống
            </button>

            <div className="text-center text-xs text-slate-500">
              Đã có tài khoản trước đó?{' '}
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="font-bold text-slate-800 hover:underline cursor-pointer"
              >
                Quay lại Đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
