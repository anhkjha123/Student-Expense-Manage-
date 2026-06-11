import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Camera, 
  Save, 
  Loader2, 
  GraduationCap, 
  Phone, 
  Calendar, 
  Mail, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { User as UserType } from '../types';
import { ApiService } from '../lib/api';

interface UserProfileProps {
  user: UserType;
  onUpdateProfile: (updated: UserType) => void;
  onBack?: () => void;
}

export default function UserProfile({ user, onUpdateProfile, onBack }: UserProfileProps) {
  const [name, setName] = useState(user.name || '');
  const [school, setSchool] = useState(user.school || '');
  const [age, setAge] = useState<string>(user.age ? String(user.age) : '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState<string | null>(user.avatar || null);
  const [theme, setTheme] = useState<'light' | 'dark'>(user.theme || 'light');
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Kích thước ảnh đại diện không vượt quá 2MB để đảm bảo hiệu suất lưu trữ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
      setErrorMsg(null);
    };
    reader.onerror = () => {
      setErrorMsg('Lỗi đọc tệp ảnh đại diện.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const parsedAge = age.trim() ? parseInt(age, 10) : undefined;
    if (parsedAge !== undefined && (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120)) {
      setErrorMsg('Vui lòng nhập số tuổi hợp lệ từ 1 đến 120.');
      setIsSaving(false);
      return;
    }

    const updatedUser: UserType = {
      ...user,
      name: name.trim(),
      school: school.trim(),
      age: parsedAge,
      phone: phone.trim(),
      avatar: avatar || undefined,
      theme: theme
    };

    try {
      const isGuest = localStorage.getItem('sem_guest_mode') === 'true';
      if (!isGuest) {
        await ApiService.updateUserProfile(user.id, updatedUser);
      }
      
      // Update locally
      onUpdateProfile(updatedUser);
      setSuccessMsg('Cập nhật hồ sơ tài khoản thành công!');
      
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi cập nhật thông tin lên hệ thống.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back navigation button if provided */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại Dashboard
        </button>
      )}

      {/* Main card */}
      <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl transition-colors duration-300">
        {/* Decorative banner */}
        <div className="h-28 sm:h-36 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 relative flex items-end justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-8 pt-0 relative">
          {/* Avatar Area */}
          <div className="flex flex-col items-center -translate-y-12 sm:-translate-y-16 mb-[-30px] sm:mb-[-40px]">
            <div className="relative group">
              <div className="h-24 w-24 sm:h-32 sm:w-32 overflow-hidden rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-lg relative flex items-center justify-center transition-all duration-300">
                {avatar ? (
                  <img src={avatar} alt="Profile Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-display text-3xl sm:text-4xl font-bold">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600 active:scale-95 transition-all">
                <Camera className="h-4.5 w-4.5" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <h3 className="mt-3 font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white transition-colors">{name || 'Người dùng'}</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-semibold transition-colors">
              <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> {user.email}
            </p>
          </div>

          <div className="space-y-4 pt-6">
            <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 uppercase tracking-wide transition-colors">
              Thông tin sinh viên
            </h4>

            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 animate-fade-in">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-3 text-xs font-semibold text-red-700 dark:text-red-400 animate-fade-in">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Họ và Tên
                </label>
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 shadow-xs focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all overflow-hidden bg-slate-50/20 dark:bg-slate-950/30">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full py-2.5 sm:py-3 pl-11 pr-4 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Age field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tuổi
                </label>
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 shadow-xs focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all overflow-hidden bg-slate-50/20 dark:bg-slate-950/30">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Ví dụ: 20"
                    className="w-full py-2.5 sm:py-3 pl-11 pr-4 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Số Điện Thoại
                </label>
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 shadow-xs focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all overflow-hidden bg-slate-50/20 dark:bg-slate-950/30">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    className="w-full py-2.5 sm:py-3 pl-11 pr-4 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* School field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Trường Học
                </label>
                <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 shadow-xs focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all overflow-hidden bg-slate-50/20 dark:bg-slate-950/30">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <GraduationCap className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Đại học Bách Khoa..."
                    className="w-full py-2.5 sm:py-3 pl-11 pr-4 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Theme Settings Selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Giao diện ứng dụng (Theme)
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all cursor-pointer text-xs sm:text-sm font-bold ${
                    theme === 'light'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm dark:bg-emerald-950/30 dark:border-emerald-500 dark:text-emerald-400'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Sun className="h-4.5 w-4.5 text-amber-500" />
                  Giao diện Sáng (Light)
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all cursor-pointer text-xs sm:text-sm font-bold ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-sm dark:bg-slate-950 dark:border-slate-600 dark:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Moon className="h-4.5 w-4.5 text-indigo-400" />
                  Giao diện Tối (Dark)
                </button>
              </div>
            </div>

            {/* Financial indicators (read-only context on profile page) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800 transition-colors">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Thu nhập cố định hàng tháng</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {new Intl.NumberFormat('vi-VN').format(user.monthlyIncome)}đ
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Mục tiêu tiết kiệm hàng tháng</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {new Intl.NumberFormat('vi-VN').format(user.savingGoal)}đ
                </span>
              </div>
            </div>

            {/* Submit button block */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-100 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
