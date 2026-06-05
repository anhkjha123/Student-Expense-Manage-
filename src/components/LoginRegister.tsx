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
  CheckCircle2,
  Lock
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
  const [regPassword, setRegPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { user } = await ApiService.login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Sai email hoặc mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regName || !regPassword) {
      setErrorMsg('Vui lòng điền đủ trường bắt buộc.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    const parsedIncome = parseFloat(regIncome.replace(/,/g, '')) || 0;
    const parsedSaving = parseFloat(regSaving.replace(/,/g, '')) || 0;

    try {
      const { user } = await ApiService.register({
        email: regEmail,
        password: regPassword,
        name: regName,
        school: regSchool,
        monthlyIncome: parsedIncome,
        savingGoal: parsedSaving
      });
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi đăng ký.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo account flow bypasses full reg but creates real DB user using the mock email if not exist
  const handleDemoLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      try {
        const { user } = await ApiService.login(mockStudent.email, 'demo123456');
        onLoginSuccess(user);
      } catch (loginErr) {
        const { user } = await ApiService.register({
          email: mockStudent.email,
          password: 'demo123456',
          name: mockStudent.name,
          school: mockStudent.school,
          monthlyIncome: mockStudent.monthlyIncome,
          savingGoal: mockStudent.savingGoal
        });
        onLoginSuccess(user);
      }
    } catch (err: any) {
       setErrorMsg('Demo Login Failed: ' + (err.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 py-12 relative overflow-hidden">
      
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-20%] w-[70vw] h-[60vh] rounded-full bg-emerald-200/30 blur-[120px] pointer-events-none z-0 object-cover" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[60vw] h-[60vh] rounded-full bg-blue-200/30 blur-[130px] pointer-events-none z-0 object-cover" />

      <div className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-2xl relative z-10 transition-all">
        
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-200/50 animate-pulse-subtle">
            <TrendingUp className="h-8 w-8" />
          </div>
          <div className="pt-2">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
              SemTietKiem
            </h2>
            <p className="text-xs text-slate-500 max-w-[260px] mx-auto font-medium leading-relaxed mt-1">
              Giải pháp tích lũy thông minh, thắt chặt tiền tiêu cho Sinh viên!
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-700 leading-normal text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {!isRegistering ? (
          <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                  Email
                </label>
                <div className="relative rounded-2xl border border-slate-200 focus-within:border-emerald-500 shadow-sm transition-all overflow-hidden bg-white">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full py-3.5 pl-10 pr-4 text-sm font-semibold text-slate-800 focus:outline-none"
                    placeholder="sv@hunre.edu.vn"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                  Mật khẩu
                </label>
                <div className="relative rounded-2xl border border-slate-200 focus-within:border-emerald-500 shadow-sm transition-all overflow-hidden bg-white">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full py-3.5 pl-10 pr-4 text-sm font-semibold text-slate-800 focus:outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="group relative flex w-full justify-center rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all cursor-pointer">
              Đăng nhập <ArrowRight className="ml-2 h-4.5 w-4.5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>

            <button type="button" onClick={handleDemoLogin} disabled={isLoading} className="w-full text-xs font-bold text-emerald-600 bg-emerald-50 py-3 rounded-2xl hover:bg-emerald-100 transition-colors cursor-pointer">
              Chạy Demo (Không cần tạo tài khoản)
            </button>

            <p className="text-center text-xs font-medium text-slate-500 mt-6">
              Bạn mới đến đây? <button type="button" onClick={() => setIsRegistering(true)} className="font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer">Tạo tài khoản</button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 animate-fade-in max-h-[60vh] overflow-y-auto px-1 pb-2">
            <h3 className="font-display font-bold text-lg text-slate-800 px-1">Tạo Hồ Sơ Tài Chính</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Tên của bạn</label>
              <div className="relative rounded-2xl border border-slate-200 bg-white">
                 <input type="text" value={regName} onChange={e => setRegName(e.target.value)} className="w-full py-3 pl-4 pr-4 text-sm font-semibold text-slate-800 bg-transparent focus:outline-none" placeholder="Nguyễn Văn A" required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Email</label>
              <div className="relative rounded-2xl border border-slate-200 bg-white">
                 <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full py-3 pl-4 pr-4 text-sm font-semibold text-slate-800 bg-transparent focus:outline-none" placeholder="test@uni.edu.vn" required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Mật khẩu</label>
              <div className="relative rounded-2xl border border-slate-200 bg-white">
                 <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full py-3 pl-4 pr-4 text-sm font-semibold text-slate-800 bg-transparent focus:outline-none" required />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="group flex w-full justify-center rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all mt-4 cursor-pointer">
              Đăng ký ngay
            </button>

            <button type="button" onClick={() => setIsRegistering(false)} className="w-full text-center text-xs font-bold text-slate-500 mt-4 hover:text-slate-800 cursor-pointer">
              ← Trở lại đăng nhập
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
