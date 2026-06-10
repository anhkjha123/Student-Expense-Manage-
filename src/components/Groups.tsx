import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  FileSpreadsheet, 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  FileText,
  UserCheck,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Send,
  X,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Group, GroupMember, GroupExpense, GroupSettlement, User } from '../types';
import { ApiService } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_CATEGORIES } from '../mockData';

interface GroupsProps {
  user: User;
}

export default function Groups({ user }: GroupsProps) {
  // Navigation / views
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupData, setActiveGroupData] = useState<{
    group: Group;
    members: GroupMember[];
    expenses: GroupExpense[];
    debts: GroupSettlement[];
  } | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [groupError, setGroupError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Expense split modal state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().substring(0, 10));
  const [expSplitType, setExpSplitType] = useState<'EQUAL' | 'CUSTOM'>('EQUAL');
  const [customShares, setCustomShares] = useState<Record<string, string>>({}); // userId -> amount string
  const [expCategory, setExpCategory] = useState('group_fund');
  const [expError, setExpError] = useState<string | null>(null);

  // Load user groups
  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getGroups();
      setGroups(data);
    } catch (err: any) {
      console.error(err);
      setGroupError('Lỗi tải danh sách nhóm chi tiêu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  // Load detailed active group data
  const loadActiveGroup = async (id: string) => {
    try {
      const data = await ApiService.getGroup(id);
      setActiveGroupData(data);
      // Pre-populate custom shares with equal split amounts
      const initialCustom: Record<string, string> = {};
      const share = Math.round((0) / data.members.length);
      data.members.forEach(m => {
        if (m.userId) initialCustom[m.userId] = '';
      });
      setCustomShares(initialCustom);
    } catch (err: any) {
      console.error(err);
      setGroupError(err.message || 'Lỗi tải chi tiết nhóm.');
      setActiveGroupId(null);
      setActiveGroupData(null);
    }
  };

  useEffect(() => {
    if (activeGroupId) {
      loadActiveGroup(activeGroupId);
    } else {
      setActiveGroupData(null);
    }
  }, [activeGroupId]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGroupError(null);

    if (newGroupName.trim().length < 3 || newGroupName.trim().length > 50) {
      setGroupError('Tên nhóm phải từ 3 đến 50 ký tự (AC1)');
      return;
    }

    try {
      const res = await ApiService.createGroup(newGroupName);
      setSuccessMessage(`Đã tạo nhóm "${res.group.name}" thành công!`);
      setNewGroupName('');
      setIsCreating(false);
      loadGroups();
    } catch (err: any) {
      setGroupError(err.message || 'Tạo nhóm thất bại.');
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGroupError(null);
    setSuccessMessage(null);

    if (!joinCode.trim()) {
      setGroupError('Vui lòng nhập mã mời nhóm');
      return;
    }

    try {
      const res = await ApiService.joinGroup(joinCode.trim());
      setSuccessMessage(res.message || 'Đã tham gia nhóm thành công!');
      setJoinCode('');
      loadGroups();
    } catch (err: any) {
      setGroupError(err.message || 'Tham gia nhóm thất bại.');
    }
  };

  const handleGenerateInvite = async () => {
    if (!activeGroupId) return;
    try {
      const updated = await ApiService.generateInvite(activeGroupId);
      if (activeGroupData) {
        setActiveGroupData({
          ...activeGroupData,
          group: updated
        });
      }
      setSuccessMessage('Đã tạo liên kết mời mới hiệu lực 7 ngày (AC2)');
    } catch (err: any) {
      setGroupError('Lỗi khi làm mới mã mời.');
    }
  };

  const handleRevokeInvite = async () => {
    if (!activeGroupId) return;
    try {
      const updated = await ApiService.revokeInvite(activeGroupId);
      if (activeGroupData) {
        setActiveGroupData({
          ...activeGroupData,
          group: updated
        });
      }
      setSuccessMessage('Đã vô hiệu hóa thành công liên kết mời này (AC2)');
    } catch (err: any) {
      setGroupError('Lỗi khi thu hồi liên kết mời.');
    }
  };

  const handleCopyInviteLink = () => {
    if (!activeGroupData) return;
    const link = `${window.location.origin}/api/groups/join/${activeGroupData.group.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpError(null);

    const amountNum = parseFloat(expAmount.replace(/,/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) {
      setExpError('Vui lòng nhập số tiền hợp lệ lớn hơn 0đ');
      return;
    }

    if (!expDescription.trim()) {
      setExpError('Vui lòng nhập nội dung chi tiêu nhóm');
      return;
    }

    const payload: any = {
      description: expDescription.trim(),
      amount: amountNum,
      date: expDate,
      splitType: expSplitType,
      categoryId: expCategory
    };

    if (expSplitType === 'CUSTOM') {
      const customSplits: any[] = [];
      let sum = 0;
      
      for (const m of activeGroupData!.members) {
        if (!m.userId) continue;
        const val = parseFloat(customShares[m.userId] || '0');
        if (isNaN(val) || val < 0) {
          setExpError(`Số tiền đóng góp của ${m.name} không hợp lệ`);
          return;
        }
        customSplits.push({
          userId: m.userId,
          email: m.email,
          amount: val
        });
        sum += val;
      }

      if (Math.abs(sum - amountNum) > 10) {
        setExpError(`Tổng chia cho thành viên (${new Intl.NumberFormat('vi-VN').format(sum)}đ) phải bằng tổng hóa đơn (${new Intl.NumberFormat('vi-VN').format(amountNum)}đ)`);
        return;
      }
      payload.customSplits = customSplits;
    }

    try {
      await ApiService.addGroupExpense(activeGroupId!, payload);
      setSuccessMessage('Đã thêm khoản chi nhóm và tự động phân nợ thành công');
      setIsAddExpenseOpen(false);
      setExpDescription('');
      setExpAmount('');
      setExpCategory('group_fund');
      loadActiveGroup(activeGroupId!);
    } catch (err: any) {
      setExpError(err.message || 'Lỗi thêm khoản chi tiêu nhóm');
    }
  };

  const handleSettleDebt = async (debt: GroupSettlement) => {
    if (!window.confirm(`Xác nhận đánh dấu đã thanh toán khoản nợ ${new Intl.NumberFormat('vi-VN').format(debt.amount)}đ từ ${debt.fromUserName} đến ${debt.toUserName}?`)) {
      return;
    }

    try {
      await ApiService.settleDebt(activeGroupId!, {
        fromUserId: debt.fromUserId,
        fromUserName: debt.fromUserName,
        toUserId: debt.toUserId,
        toUserName: debt.toUserName,
        amount: debt.amount
      });
      
      // Save an individual personal expense for the debtor in client DB (Firestore or localStorage)
      if (debt.fromUserId === user.id) {
        try {
          const isGuest = localStorage.getItem('sem_guest_mode') === 'true';
          const newExpenseData = {
            amount: debt.amount,
            categoryId: 'group_fund',
            title: `Tất toán nợ nhóm: Trả cho ${debt.toUserName}`,
            date: new Date().toISOString().substring(0, 10),
            note: `Tất toán nợ trong nhóm ${activeGroupData?.group.name || ''}`,
            isNecessary: true
          };
          if (isGuest) {
            const localExpensesKey = `sem_${user.id}_expenses`;
            const stored = localStorage.getItem(localExpensesKey);
            const list = stored ? JSON.parse(stored) : [];
            const newExp = { ...newExpenseData, id: `exp_added_${Date.now()}`, userId: user.id };
            localStorage.setItem(localExpensesKey, JSON.stringify([newExp, ...list]));
          } else {
            await ApiService.createExpense(newExpenseData);
          }
        } catch (e) {
          console.error("Failed to save personal settlement expense on client:", e);
        }
      }

      setSuccessMessage(`Đã đánh dấu đã thanh toán thành công giữa ${debt.fromUserName} và ${debt.toUserName} (AC4)`);
      loadActiveGroup(activeGroupId!);
      
      if (debt.fromUserId === user.id) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err: any) {
      setGroupError('Lỗi cập nhật tất toán nợ.');
    }
  };

  const handleExportCSV = async () => {
    if (!activeGroupId) return;
    try {
      const blob = await ApiService.exportGroupCSV(activeGroupId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GiaoDichNhom_${activeGroupData?.group.name || activeGroupId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      setGroupError('Xuất file CSV thất bại.');
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value) {
      setExpAmount(new Intl.NumberFormat('en-US').format(parseFloat(value)));
    } else {
      setExpAmount('');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  const getInviteStatusInfo = () => {
    if (!activeGroupData) return { isExpired: true, text: 'Chưa có liên kết' };
    const { inviteExpiresAt, inviteRevoked } = activeGroupData.group;
    if (inviteRevoked) return { isExpired: true, text: 'Đã bị thu hồi' };
    const expDate = new Date(inviteExpiresAt);
    const isExpired = expDate.getTime() < Date.now();
    return {
      isExpired,
      text: isExpired 
        ? 'Đã hết hạn' 
        : `Còn hiệu lực đến ${expDate.toLocaleDateString('vi-VN')} ${expDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    };
  };

  return (
    <motion.div
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 shadow-sm"
          >
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-800">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {groupError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-1.5 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-800 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span>Gặp lỗi khi xử lý nhóm:</span>
              <button onClick={() => setGroupError(null)} className="text-emerald-500 hover:text-emerald-800 font-bold">
                <X className="h-4 w-4" />
              </button>
            </div>
            <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-red-100/50 p-2 text-[10px] font-mono whitespace-pre-wrap break-all select-text leading-relaxed font-semibold">
              {groupError}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Groups View Selector */}
      {!activeGroupId ? (
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Groups List */}
            <div className="md:col-span-8 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Danh sách nhóm của bạn</h3>
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
                  <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
                  <span className="text-xs font-bold text-slate-400">Đang tải danh sách nhóm...</span>
                </div>
              ) : groups.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <span className="block text-4xl mb-2">👥</span>
                  <h4 className="text-sm font-bold text-slate-800">Chưa tham gia nhóm nào</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Hãy tạo nhóm mới hoặc nhập mã mời của bạn cùng phòng gửi để bắt đầu chia tiền hóa đơn nhé!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groups.map(g => (
                    <motion.div 
                      whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                      onClick={() => setActiveGroupId(g.id)}
                      key={g.id}
                      className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm cursor-pointer transition-all duration-200 flex flex-col justify-between"
                      id={`group-card-${g.id}`}
                    >
                      <div className="space-y-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-slate-800 truncate text-base">{g.name}</h4>
                        <span className="text-[10px] text-slate-400 block font-mono">Ngày tạo: {g.createdAt}</span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50 text-xs text-slate-600 font-bold">
                        <span>Bấm để quản lý nhóm</span>
                        <ChevronRight className="h-4 w-4 text-emerald-500" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Side tools (Create group / Join Group) */}
            <div className="md:col-span-4 space-y-6">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Nhóm chi tiêu</h3>
                    <p className="text-xs text-slate-500 mt-1">Tạo và quản lý nhóm chi tiêu chung.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-xs font-bold transition-colors"
                  >
                    Tạo nhóm mới
                  </button>
                </div>
              </div>

              {/* Join group box */}
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Send className="h-4.5 w-4.5 text-emerald-500" /> Tham gia nhóm bằng mã mời
                </h3>
                <form onSubmit={handleJoinGroup} className="space-y-3">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Mã mời (Ví dụ: ZYXW1234)"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    id="group-join-code-input"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 text-xs transition-colors cursor-pointer"
                    id="group-join-submit-btn"
                  >
                    Tham gia ngay
                  </button>
                </form>
              </div>

              {/* Create Group Box (Direct Entry) */}
              {isCreating && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl border border-emerald-100 bg-emerald-50/20 p-5 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-800">Tạo nhóm chi tiêu mới</h3>
                    <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateGroup} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Tên nhóm (3-50 ký tự)"
                        className="w-full rounded-xl border border-slate-250 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                        id="group-name-input"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-emerald-600 text-white font-bold py-2 text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                      id="group-create-submit-btn"
                    >
                      Xác nhận tạo
                    </button>
                  </form>
                </motion.div>
              )}

            </div>
          </motion.div>
        </div>
      ) : (
        /* Detailed Selected Group Dashboard */
        <div className="space-y-6">
          
          {/* Detailed View Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-slate-200/50 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveGroupId(null)}
                className="rounded-xl p-2 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">Quản lý nhóm chi tiêu</span>
                <h2 className="font-display text-2xl font-black text-slate-900 leading-tight">
                  {activeGroupData?.group.name || 'Đang tải...'}
                </h2>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-100 flex items-center gap-1.5 cursor-pointer"
                id="add-group-expense-trigger"
              >
                <Plus className="h-4 w-4" /> Thêm khoản chi nhóm
              </button>
              <button
                onClick={handleExportCSV}
                className="rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer"
                id="export-group-csv-btn"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Xuất CSV (AC5)
              </button>
            </div>
          </motion.div>

          {!activeGroupData ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2 animate-pulse">
              <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
              <span className="text-xs font-bold text-slate-400">Đang đồng bộ dữ liệu nhóm...</span>
            </div>
          ) : (
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Invite codes, debts board, members lists */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Invite link panel (AC2) */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Mời bạn cùng phòng tham gia</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Liên kết mời tự động vô hiệu hóa sau 7 ngày hoặc có thể thu hồi bất cứ lúc nào.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 relative rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-semibold text-slate-700 select-all overflow-hidden flex items-center truncate min-h-[36px]">
                      {activeGroupData.group.inviteRevoked ? (
                        <span className="text-red-500 flex items-center gap-1 font-bold"><Lock className="h-3 w-3" /> Liên kết đã bị thu hồi</span>
                      ) : (
                        `${window.location.origin}/api/groups/join/${activeGroupData.group.inviteCode}`
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {!activeGroupData.group.inviteRevoked && (
                        <button
                          onClick={handleCopyInviteLink}
                          className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          {copiedInvite ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedInvite ? 'Đã sao chép' : 'Sao chép link'}
                        </button>
                      )}
                      
                      {!activeGroupData.group.inviteRevoked ? (
                        <button
                          onClick={handleRevokeInvite}
                          className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          Thu hồi (Revoke)
                        </button>
                      ) : (
                        <button
                          onClick={handleGenerateInvite}
                          className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          Tạo mã mời mới
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-slate-500 font-bold font-mono">
                    Trạng thái: <span className={getInviteStatusInfo().isExpired ? 'text-red-500' : 'text-emerald-600'}>{getInviteStatusInfo().text}</span>
                  </div>
                </motion.div>

                {/* AI Settlement board ("Ai nợ ai bao nhiêu" - AC4) */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="h-4.5 w-4.5 text-emerald-500 animate-pulse" /> Bảng tính công nợ hiện tại
                  </h3>

                  {activeGroupData.debts.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <span className="text-2xl block mb-1">🕊️</span>
                      <p className="text-xs font-bold text-emerald-700">Tất cả thành viên đã hòa tiền!</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Không ai nợ ai khoản tiền nào trong nhóm này.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeGroupData.debts.map((debt, idx) => {
                        const isMeDebtor = debt.fromUserId === user.id;
                        const isMeCreditor = debt.toUserId === user.id;

                        return (
                          <div 
                            key={idx}
                            className={`rounded-2xl p-4 border flex flex-col justify-between space-y-3 ${
                              isMeDebtor 
                                ? 'bg-amber-50/50 border-amber-200' 
                                : isMeCreditor 
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="text-xs leading-relaxed">
                              <span className="font-bold text-slate-800">{debt.fromUserName}</span>
                              <span className="text-slate-500"> cần trả cho </span>
                              <span className="font-bold text-slate-800">{debt.toUserName}</span>
                              <div className="text-lg font-extrabold font-mono text-slate-900 mt-1">
                                {new Intl.NumberFormat('vi-VN').format(debt.amount)}đ
                              </div>
                            </div>
                            
                            {isMeCreditor ? (
                              <span
                                className="w-full rounded-xl bg-emerald-100/80 border border-emerald-200 font-bold py-1.5 text-[11px] text-emerald-700 flex items-center justify-center gap-1 cursor-default select-none"
                                id={`settle-status-${debt.fromUserId}-${debt.toUserId}`}
                              >
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} /> đang trả
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSettleDebt(debt)}
                                className="w-full rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 font-bold py-1.5 text-[11px] text-slate-700 hover:text-emerald-700 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1"
                                id={`settle-btn-${debt.fromUserId}-${debt.toUserId}`}
                              >
                                <Check className="h-3.5 w-3.5" /> Đánh dấu đã thanh toán (AC4)
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>

                {/* History transactions log */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">Lịch sử chi tiêu nhóm</h3>
                  
                  {activeGroupData.expenses.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Chưa ghi nhận khoản chi dùng nhóm nào. Hãy thêm khoản chi tiêu đầu tiên nhé!
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="px-4 py-3">Nội dung</th>
                            <th className="px-4 py-3">Danh mục</th>
                            <th className="px-4 py-3">Người trả</th>
                            <th className="px-4 py-3 text-right">Số tiền</th>
                            <th className="px-4 py-3">Ngày chi</th>
                            <th className="px-4 py-3">Chia cho</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {activeGroupData.expenses.map((exp, idx) => {
                            const isSettleTrans = exp.description.startsWith('Tất toán nợ:');
                            const cat = DEFAULT_CATEGORIES.find(c => c.id === (exp as any).categoryId);
                            return (
                              <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-4 py-3 font-semibold text-slate-800">
                                  {isSettleTrans ? (
                                    <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold text-teal-700 border border-teal-150">
                                      🤝 Tất toán nợ
                                    </span>
                                  ) : null}
                                  <div className="mt-0.5">{exp.description}</div>
                                </td>
                                <td className="px-4 py-3">
                                  {isSettleTrans ? (
                                    <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold text-teal-700 border border-teal-150">
                                      Quỹ nhóm
                                    </span>
                                  ) : cat ? (
                                    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold border ${cat.color}`}>
                                      {cat.name}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 border border-slate-150">
                                      Khác
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-600">{exp.paidByName}</td>
                                <td className="px-4 py-3 text-right font-bold text-slate-900 font-mono">
                                  {new Intl.NumberFormat('vi-VN').format(exp.amount)}đ
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-400">{exp.date}</td>
                                <td className="px-4 py-3">
                                  <div className="max-w-[200px] truncate text-[10px] text-slate-400 font-mono" title={exp.splits.map(s => `${s.email || s.userId}: ${new Intl.NumberFormat('vi-VN').format(s.amount)}đ`).join(', ')}>
                                    {exp.splitType === 'EQUAL' ? 'Chia đều' : 'Tùy chọn'} ({exp.splits.length} người)
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>

              </div>

              {/* Right Column: Members lists */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Members list (AC1 limit warning) */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                    <h3 className="text-sm font-bold text-slate-800">Thành viên ({activeGroupData.members.length})</h3>
                    {activeGroupData.members.length >= 20 && (
                      <span className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Đầy nhóm</span>
                    )}
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {activeGroupData.members.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs font-mono uppercase">
                          {m.name.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-xs font-bold text-slate-800 truncate">{m.name} {m.userId === user.id ? '(Bạn)' : ''}</span>
                          <span className="block text-[9px] text-slate-400 font-mono truncate">{m.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

              </div>

            </motion.div>
          )}

        </div>
      )}

      {/* Add Expense Splitting Modal Form */}
      {isAddExpenseOpen && activeGroupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddExpenseOpen(false)} />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-50 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-150 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Thêm một khoản chi nhóm mới</h3>
                <p className="text-[10px] text-slate-400">Tiền hóa đơn chung sẽ tự động tính toán phân nợ</p>
              </div>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-slate-400 hover:text-slate-600 rounded-xl p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4 pt-4 overflow-y-auto flex-1 pr-1">
              {expError && (
                <div className="flex flex-col gap-1.5 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>Lỗi hóa đơn nhóm:</span>
                  </div>
                  <pre className="mt-1 max-h-32 overflow-auto rounded-lg bg-red-100/50 p-2 text-[10px] font-mono whitespace-pre-wrap break-all select-text leading-relaxed">
                    {expError}
                  </pre>
                </div>
              )}

              {/* Amount */}
              <div className="space-y-1">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Số tiền thanh toán (VND) <span className="text-red-500">*</span></label>
                <div className="relative rounded-2xl border border-slate-200 focus-within:border-emerald-400 overflow-hidden shadow-sm">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">đ</span>
                  <input
                    type="text"
                    value={expAmount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full py-2.5 pl-9 pr-4 text-base font-bold font-mono text-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Nội dung chi tiêu <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="Ví dụ: Tiền phòng trọ, mua gia vị nồi lẩu..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Category — group expenses always use group_fund */}
              <div className="space-y-1">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Danh mục khoản chi</label>
                <div className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                  <span>👥</span> Quỹ nhóm
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Ngày chi tiêu</label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Split type select */}
              <div className="space-y-1">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Phương thức chia tiền</label>
                <select
                  value={expSplitType}
                  onChange={(e) => setExpSplitType(e.target.value as any)}
                  className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="EQUAL">Chia đều tự động (Round 1000 VND - AC3)</option>
                  <option value="CUSTOM">Nhập số tiền tự chọn theo người (CUSTOM)</option>
                </select>
              </div>

              {/* Custom splits matrix inputs */}
              {expSplitType === 'CUSTOM' && (
                <div className="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 shadow-inner">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Nhập số tiền từng thành viên nợ:</span>
                  <div className="space-y-2">
                    {activeGroupData.members.map(m => {
                      if (!m.userId) return null;
                      return (
                        <div key={m.userId} className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-bold text-slate-700 truncate flex-1">{m.name}</span>
                          <div className="relative rounded-lg border border-slate-200 bg-white overflow-hidden max-w-[120px]">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-[10px]">đ</span>
                            <input
                              type="text"
                              value={customShares[m.userId] || ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setCustomShares({
                                  ...customShares,
                                  [m.userId!]: val
                                });
                              }}
                              placeholder="0"
                              className="w-full py-1 pl-5 pr-2 font-mono text-slate-800 text-right focus:outline-none text-xs"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-3 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="rounded-xl px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 text-white font-bold py-2 px-5 text-xs hover:bg-emerald-600 transition-colors shadow-md"
                >
                  Lưu giao dịch nhóm
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}
