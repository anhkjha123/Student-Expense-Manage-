import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowRight
} from 'lucide-react';
import { User } from '../types';
import { ApiService } from '../lib/api';

interface LoginRegisterProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginRegister({
  onLoginSuccess,
}: LoginRegisterProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { user } = await ApiService.loginWithGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập bằng Google thất bại.');
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
          <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs text-rose-800 leading-relaxed space-y-3 shadow-sm select-none">
            <div className="font-bold text-center text-rose-700 text-[13px] flex items-center justify-center gap-1.5">
              ⚠️ Lỗi Tên Miền Firebase Chưa Được Cấp Quyền
            </div>
            {errorMsg.toLowerCase().includes('unauthorized-domain') ? (
              <div className="space-y-2.5">
                <p className="text-slate-600">
                  Tên miền trang này chưa được khai báo cho phép truy cập Firebase Authentication của dự án <strong>thuctap-3c0d8</strong>.
                </p>
                <div className="bg-white/95 p-3 rounded-xl border border-rose-200/50 text-[11px] space-y-1.5 text-slate-700">
                  <p className="font-bold text-slate-800 text-[11.5px]">👉 Cách sửa đổi cực dễ trong 1 phút:</p>
                  <ol className="list-decimal pl-4.5 space-y-1 text-slate-600">
                    <li>Mở <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">Firebase Console</a>.</li>
                    <li>Tìm và chọn dự án <strong>thuctap-3c0d8</strong>.</li>
                    <li>Ở thanh bên trái, chọn <strong>Authentication</strong>, qua tab <strong>Settings</strong> ở trên cùng.</li>
                    <li>Chọn mục <strong>Authorized domains</strong> (Miền được ủy quyền).</li>
                    <li>Nhấp <strong>Add domain</strong> và nhập tên miền này vào:
                      <div className="mt-1 flex items-center gap-1">
                        <code className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-emerald-600 font-bold break-all select-all text-[11.5px]">
                          {window.location.hostname}
                        </code>
                      </div>
                    </li>
                  </ol>
                </div>
                <p className="text-slate-500 text-[10.5px] text-center pt-0.5 italic">Sau khi thêm xong ngoài console, quý khách hãy F5 (tải lại) trang này rồi nhấn Đăng nhập lại nhé!</p>
              </div>
            ) : (
              <p className="text-center font-medium">{errorMsg}</p>
            )}
          </div>
        )}

        <div className="space-y-5 animate-fade-in pt-4">
          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            disabled={isLoading} 
            className="group relative flex w-full justify-center items-center rounded-2xl bg-white border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Tiếp tục với Google 
            <ArrowRight className="ml-2 h-4.5 w-4.5 opacity-70 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
