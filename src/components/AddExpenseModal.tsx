import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  DollarSign, 
  Calendar, 
  FileText, 
  Check, 
  AlertCircle,
  UploadCloud,
  Loader2,
  Trash2,
  Mic,
  Volume2,
  Square
} from 'lucide-react';
import { Category, Expense } from '../types';
import { motion } from 'motion/react';
import { ApiService } from '../lib/api';
import { parseVietnameseVoiceCommand } from '../lib/voiceParser';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'userId'> & { recurringCycle?: 'NONE' | 'WEEKLY' | 'MONTHLY' }) => void;
  editingExpense?: Expense | null;
  onEditExpense?: (id: string, expense: Omit<Expense, 'id' | 'userId'>) => void;
  startWithVoice?: boolean;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  categories,
  onAddExpense,
  editingExpense,
  onEditExpense,
  startWithVoice = false
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(
    new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]
  );
  const [note, setNote] = useState<string>('');
  const [isNecessary, setIsNecessary] = useState<boolean>(true);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringCycle, setRecurringCycle] = useState<'NONE' | 'WEEKLY' | 'MONTHLY'>('NONE');
  const [error, setError] = useState<string | null>(null);

  // OCR States (MH-02)
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isAmountMissing, setIsAmountMissing] = useState<boolean>(false);
  const [highlightedFields, setHighlightedFields] = useState<{ amount?: boolean; date?: boolean; title?: boolean }>({});

  // Voice States (CH-01)
  const [helperTab, setHelperTab] = useState<'ocr' | 'voice'>('ocr');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceText, setVoiceText] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setAmount(new Intl.NumberFormat('en-US').format(editingExpense.amount));
        setCategoryId(editingExpense.categoryId);
        setTitle(editingExpense.title);
        setDate(editingExpense.date);
        setNote(editingExpense.note || '');
        setIsNecessary(editingExpense.isNecessary);
        setIsRecurring(editingExpense.isRecurring || false);
        setReceiptImage(editingExpense.receiptImage || null);
        setIsAmountMissing(false);
        setHighlightedFields({});
        setHelperTab('ocr');
      } else {
        setAmount('');
        const selectableCategories = categories.filter(c => c.id !== 'group_fund');
        if (selectableCategories.length > 0) {
          setCategoryId(selectableCategories[0].id);
        }
        setTitle('');
        setDate(new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]);
        setNote('');
        setIsNecessary(true);
        setIsRecurring(false);
        setRecurringCycle('NONE');
        setReceiptImage(null);
        setIsAmountMissing(false);
        setHighlightedFields({});
        setHelperTab(startWithVoice ? 'voice' : 'ocr');
      }
      setError(null);
      setOcrError(null);
      setVoiceText('');
      setVoiceError(null);
      setIsListening(false);
    }
  }, [editingExpense, isOpen, categories, startWithVoice]);

  const startSpeechRecognition = () => {
    if (!SpeechRecognition) {
      setVoiceError('Trình duyệt của bạn không hỗ trợ Nhận diện giọng nói. Vui lòng dùng Google Chrome.');
      return;
    }
    setVoiceError(null);
    setVoiceText('');
    setIsListening(true);
    setHighlightedFields({});

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'vi-VN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);

      const parsed = parseVietnameseVoiceCommand(transcript);

      if (parsed.amount) {
        setAmount(new Intl.NumberFormat('en-US').format(parsed.amount));
        setHighlightedFields(prev => ({ ...prev, amount: true }));
      }
      if (parsed.title) {
        setTitle(parsed.title);
        setHighlightedFields(prev => ({ ...prev, title: true }));
      }
      if (parsed.categoryId) {
        setCategoryId(parsed.categoryId);
      }
      if (parsed.categoryId === 'entertainment' || parsed.categoryId === 'shopping') {
        setIsNecessary(false);
      } else {
        setIsNecessary(true);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setVoiceError('Quyền truy cập Micro bị từ chối. Vui lòng bật Micro trong cài đặt trình duyệt.');
      } else {
        setVoiceError(`Lỗi nhận diện: ${event.error}`);
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  useEffect(() => {
    if (isOpen && helperTab === 'voice' && startWithVoice && !editingExpense) {
      const timer = setTimeout(() => {
        startSpeechRecognition();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, helperTab, startWithVoice]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const valAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(valAmount) || valAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lý lớn hơn 0đ.');
      return;
    }

    if (!title.trim()) {
      setError('Vui lòng điền nội dung chi tiêu (ví dụ: Ăn cơm trưa).');
      return;
    }

    if (!categoryId) {
      setError('Vui lòng lựa chọn một danh mục chi tiêu.');
      return;
    }

    if (!date) {
      setError('Vui lòng chọn ngày chi tiêu.');
      return;
    }

    const payload = {
      amount: valAmount,
      categoryId,
      title: title.trim(),
      date,
      note: note.trim() || undefined,
      isNecessary,
      isRecurring: editingExpense ? isRecurring : (recurringCycle !== 'NONE'),
      recurringCycle: editingExpense ? undefined : recurringCycle,
      receiptImage: receiptImage || undefined // Pass scanned receipt image (AC6)
    };

    if (editingExpense && onEditExpense) {
      onEditExpense(editingExpense.id, payload);
    } else {
      onAddExpense(payload);
    }

    // Reset Form
    if (!editingExpense) {
      setAmount('');
      setTitle('');
      setNote('');
      setIsNecessary(true);
      setIsRecurring(false);
      setRecurringCycle('NONE');
      setReceiptImage(null);
      setIsAmountMissing(false);
      setHighlightedFields({});
    }
    setError(null);
    onClose();
  };

  const processReceiptFile = async (file: File) => {
    // Validate size (max 10MB) - AC1
    if (file.size > 10 * 1024 * 1024) {
      setOcrError('Kích thước ảnh vượt quá giới hạn 10MB cho phép');
      return;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isAllowed = ['jpg', 'jpeg', 'png', 'heic'].includes(fileExtension || '');
    if (!isAllowed) {
      setOcrError('Định dạng tệp không hỗ trợ. Vui lòng chọn JPG, PNG hoặc HEIC.');
      return;
    }

    setIsScanning(true);
    setOcrError(null);
    setIsAmountMissing(false);
    setHighlightedFields({});

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        setReceiptImage(base64String);

        try {
          const res = await ApiService.scanReceipt(base64String, file.name, file.type);

          if (res.amount) {
            setAmount(new Intl.NumberFormat('en-US').format(res.amount));
            setHighlightedFields(prev => ({ ...prev, amount: true }));
          } else {
            setAmount('');
            setIsAmountMissing(true); // AC4 highlight Amount in red
          }

          if (res.date) {
            setDate(res.date);
            setHighlightedFields(prev => ({ ...prev, date: true }));
          }

          if (res.merchant) {
            setTitle(res.merchant);
            setHighlightedFields(prev => ({ ...prev, title: true }));
          }

          if (res.note) {
            setNote(res.note);
          }

          const matchedCategory = categories.find(c => 
            res.merchant && new RegExp(c.name, 'i').test(res.merchant)
          );
          if (matchedCategory) {
            setCategoryId(matchedCategory.id);
          } else {
            const text = `${res.merchant || ''} ${res.note || ''}`.toLowerCase();
            if (text.includes('cơm') || text.includes('ăn') || text.includes('uống') || text.includes('coffee') || text.includes('phở') || text.includes('lẩu')) {
              setCategoryId('food');
            } else if (text.includes('xăng') || text.includes('xe') || text.includes('grab') || text.includes('be')) {
              setCategoryId('transport');
            } else if (text.includes('sách') || text.includes('vở') || text.includes('giáo trình') || text.includes('học')) {
              setCategoryId('study');
            } else if (text.includes('phim') || text.includes('vé') || text.includes('sữa') || text.includes('chơi')) {
              setCategoryId('entertainment');
            } else if (text.includes('áo') || text.includes('quần') || text.includes('shopee') || text.includes('tiki')) {
              setCategoryId('shopping');
            } else if (text.includes('phòng') || text.includes('trọ') || text.includes('điện') || text.includes('nước')) {
              setCategoryId('rent');
            }
          }
        } catch (apiErr: any) {
          setOcrError(apiErr.message || 'Lỗi quét hóa đơn');
        } finally {
          setIsScanning(false);
        }
      };
      reader.onerror = () => {
        setOcrError('Lỗi đọc tệp ảnh');
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setOcrError(err.message || 'Lỗi đọc tệp ảnh');
      setIsScanning(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processReceiptFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processReceiptFile(file);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const items = Array.from(e.clipboardData.items || []);
    const imageItem = items.find(item => item.kind === 'file' && item.type.startsWith('image/'));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        await processReceiptFile(file);
      }
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ cho phép nhập số
    const value = e.target.value.replace(/\D/g, '');
    if (value) {
      // Định dạng hiển thị dấu phẩy hàng nghìn
      const formatted = new Intl.NumberFormat('en-US').format(parseFloat(value));
      setAmount(formatted);
    } else {
      setAmount('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative z-50 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-emerald-50/50 px-5 sm:px-6 py-3.5 sm:py-4.5 shrink-0 animate-fade-in">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
              {editingExpense ? 'Chỉnh sửa khoản chi tiêu' : 'Nhập chi tiêu mới'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              {editingExpense ? 'Cập nhật lại thông tin dòng tiền chính xác hơn' : 'Nhập nhanh chi tiêu trong dưới 10 giây để kiểm soát dòng tiền'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} onPaste={handlePaste} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {/* AI Helper Tabs (OCR vs Voice) */}
          {!editingExpense && (
            <div className="space-y-2.5">
              <div className="flex rounded-2xl bg-slate-100 p-1 text-[11px] sm:text-xs font-bold border border-slate-200/40">
                <button
                  type="button"
                  onClick={() => setHelperTab('ocr')}
                  className={`flex-1 py-2 rounded-xl text-center transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    helperTab === 'ocr' 
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200/10' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 animate-pulse" />
                  Quét Hóa Đơn AI
                </button>
                <button
                  type="button"
                  onClick={() => setHelperTab('voice')}
                  className={`flex-1 py-2 rounded-xl text-center transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    helperTab === 'voice' 
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200/10' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Mic className="h-3.5 w-3.5 text-rose-500 animate-bounce" />
                  Nhập Giọng Nói AI
                </button>
              </div>

              {/* OCR Tab Content */}
              {helperTab === 'ocr' && (
                <div className="space-y-1 bg-slate-50 p-4 rounded-3xl border border-slate-200/60 shadow-xs transition-all animate-fade-in">
                  <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Quét hóa đơn bằng AI
                  </label>

                  {ocrError && (
                    <div className="mb-2 flex flex-col gap-1.5 rounded-xl bg-red-50 p-3 text-[11px] font-semibold text-red-700">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Lỗi quét hóa đơn:</span>
                      </div>
                      <pre className="mt-1 max-h-40 overflow-auto rounded-lg bg-red-100/50 p-2 text-[10px] font-mono whitespace-pre-wrap break-all select-text leading-relaxed">
                        {ocrError}
                      </pre>
                    </div>
                  )}

                  {isScanning ? (
                    <div className="flex flex-col items-center justify-center py-6 bg-white border border-slate-100 rounded-2xl space-y-2 shadow-xs">
                      <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                      <span className="text-xs font-bold text-slate-500 animate-pulse font-mono">Đang quét và phân tích hóa đơn...</span>
                    </div>
                  ) : receiptImage ? (
                    <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 animate-fade-in shadow-xs">
                      <img src={receiptImage} alt="Receipt Preview" className="h-16 w-16 object-cover rounded-xl border border-slate-200 shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-slate-700 block truncate">Ảnh hóa đơn đã tải lên</span>
                        <span className="text-[9px] text-emerald-600 font-mono block font-bold">✨ Nhận diện bằng AI</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptImage(null);
                          setIsAmountMissing(false);
                          setHighlightedFields({});
                        }}
                        className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 place-items-center">
                      <label
                        className="group flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-white rounded-3xl py-8 px-6 transition-all cursor-pointer text-center shadow-xs w-full"
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onPaste={handlePaste}
                      >
                        <UploadCloud className="h-7 w-7 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        <span className="text-sm font-semibold text-slate-700 mt-3">Chọn ảnh hóa đơn hoặc kéo thả / dán ảnh (Ctrl+V)</span>
                        <input type="file" accept="image/png, image/jpeg, image/heic" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Voice Tab Content */}
              {helperTab === 'voice' && (
                <div className="space-y-3 bg-slate-50 p-5 rounded-3xl border border-slate-200/60 shadow-xs transition-all animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                      Ghi nhận chi tiêu bằng Giọng Nói (NLP)
                    </label>
                    {isListening && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                  </div>

                  {voiceError && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-[11px] font-semibold text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{voiceError}</span>
                    </div>
                  )}

                  <div className="flex flex-col items-center justify-center py-6 bg-white border border-slate-100 rounded-2xl space-y-4 shadow-xs relative overflow-hidden">
                    {isListening ? (
                      <div className="flex flex-col items-center space-y-3">
                        {/* Audio Waveform Animation */}
                        <div className="flex items-center gap-1 h-8">
                          <span className="w-1 bg-rose-500 rounded-full animate-pulse h-6"></span>
                          <span className="w-1 bg-rose-400 rounded-full animate-pulse h-4" style={{ animationDelay: '0.15s' }}></span>
                          <span className="w-1 bg-rose-500 rounded-full animate-pulse h-8" style={{ animationDelay: '0.3s' }}></span>
                          <span className="w-1 bg-rose-400 rounded-full animate-pulse h-5" style={{ animationDelay: '0.45s' }}></span>
                          <span className="w-1 bg-rose-500 rounded-full animate-pulse h-6" style={{ animationDelay: '0.6s' }}></span>
                        </div>
                        <span className="text-xs font-bold text-slate-500 animate-pulse font-mono">Đang lắng nghe... Hãy nói ngay!</span>
                        <p className="text-[10px] text-slate-400 italic">Ví dụ: "Ăn trưa cơm bụi 35 nghìn"</p>
                        <button
                          type="button"
                          onClick={() => {
                            if (recognitionRef.current) {
                              recognitionRef.current.stop();
                            }
                          }}
                          className="mt-3 rounded-2xl bg-rose-550 hover:bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-rose-600/20"
                        >
                          <Square className="h-3 w-3 fill-white text-white" />
                          Dừng ghi âm
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={startSpeechRecognition}
                        className="group flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all duration-300 transform active:scale-95 shadow-md shadow-rose-100 cursor-pointer animate-pulse"
                        title="Bắt đầu ghi giọng nói"
                      >
                        <Mic className="h-7 w-7 text-rose-500 group-hover:scale-110 transition-transform" />
                      </button>
                    )}

                    {!isListening && !voiceText && (
                      <div className="text-center px-4">
                        <span className="text-xs font-semibold text-slate-700 block">Nhấp nút Mic để bắt đầu nói</span>
                        <span className="text-[10px] text-slate-400 block mt-1">Hỗ trợ tiếng Việt: Tự động điền số tiền, nội dung & phân loại danh mục bằng AI</span>
                      </div>
                    )}

                    {voiceText && (
                      <div className="w-full px-5 text-center animate-fade-in">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kết quả nhận diện:</span>
                        <div className="inline-block bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 leading-relaxed shadow-inner">
                          💬 "{voiceText}"
                        </div>
                        <span className="block text-[9px] text-emerald-600 font-bold mt-2">✨ Đã tự động phân tích và điền vào biểu mẫu bên dưới!</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-1">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Số tiền chi tiêu (VND) <span className="text-red-500">*</span>
            </label>
            <div className={`relative rounded-2xl border focus-within:border-emerald-400 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/15 overflow-hidden ${
              isAmountMissing 
                ? 'border-red-500 bg-red-50/10' 
                : highlightedFields.amount 
                ? 'border-emerald-500 bg-emerald-50/10 ring-2 ring-emerald-500/10' 
                : 'border-slate-200'
            }`}>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">
                đ
              </span>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full py-2.5 sm:py-3.5 pl-9 pr-4 text-base sm:text-xl font-bold font-mono text-slate-900 focus:outline-none bg-transparent"
                id="expense-amount-input"
                required
              />
            </div>
            {isAmountMissing && (
              <p className="text-[10px] text-red-500 font-bold mt-1 animate-pulse" id="expense-amount-warning">
                ⚠️ Không nhận dạng được số tiền từ hóa đơn. Vui lòng nhập thủ công!
              </p>
            )}
            {highlightedFields.amount && (
              <p className="text-[10px] text-emerald-600 font-bold mt-1">
                ✓ Đã tự động điền số tiền từ hóa đơn
              </p>
            )}
          </div>

          {/* Title Text Input */}
          <div className="space-y-1">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Nội dung chi tiêu <span className="text-red-500">*</span>
            </label>
            <div className={`relative rounded-2xl border focus-within:border-emerald-500 shadow-sm transition-all overflow-hidden ${
              highlightedFields.title ? 'border-emerald-500 bg-emerald-50/10 ring-2 ring-emerald-500/10' : 'border-slate-200'
            }`}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ăn trưa cơm bụi, trà sữa, xăng xe..."
                className="w-full py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none bg-transparent"
                id="expense-title-input"
                required
              />
            </div>
            {highlightedFields.title && (
              <p className="text-[10px] text-emerald-600 font-bold mt-1">
                ✓ Đã tự động điền tên cửa hàng từ hóa đơn
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Category Select */}
            <div className="space-y-1">
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Lựa chọn danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 shadow-sm"
                id="expense-category-input"
                required
              >
                {categories.filter(cat => cat.id !== 'group_fund').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div className="space-y-1">
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Ngày thực hiện <span className="text-red-500">*</span>
              </label>
              <div className={`relative rounded-2xl border focus-within:border-emerald-500 shadow-sm transition-all ${
                highlightedFields.date ? 'border-emerald-500 bg-emerald-50/10 ring-2 ring-emerald-500/10' : 'border-slate-200'
              }`}>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-0 bg-transparent"
                  id="expense-date-input"
                  required
                />
              </div>
              {highlightedFields.date && (
                <p className="text-[10px] text-emerald-600 font-bold mt-1">
                  ✓ Đã tự động điền ngày từ hóa đơn
                </p>
              )}
            </div>
          </div>

          {/* Classification Option (Needs vs Wants) */}
          <div className="space-y-1">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Phân loại chi tiêu tài chính (Nhiều lựa chọn) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsNecessary(true)}
                className={`flex flex-col items-center justify-center rounded-2xl border p-2 text-center transition-all cursor-pointer ${
                  isNecessary
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-2 ring-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 text-slate-500'
                }`}
              >
                <span className="text-xs font-bold block">Bắt buộc</span>
                <span className="text-[9px] opacity-75 block">Needs</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNecessary(false)}
                className={`flex flex-col items-center justify-center rounded-2xl border p-2 text-center transition-all cursor-pointer ${
                  !isNecessary
                    ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/10'
                    : 'border-slate-200 hover:border-slate-300 text-slate-500'
                }`}
              >
                <span className="text-xs font-bold block">Sở thích</span>
                <span className="text-[9px] opacity-75 block">Wants</span>
              </button>
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-1">
            <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Ghi chú phát sinh (Tùy chọn)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú chi tiết thêm..."
              rows={2}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 shadow-sm"
              id="expense-note-input"
            />
          </div>

          {/* Recurring Expense Option */}
          {!editingExpense && (
            <div className="space-y-1">
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Chi tiêu định kỳ (Lặp lại)
              </label>
              <select
                value={recurringCycle}
                onChange={(e) => setRecurringCycle(e.target.value as 'NONE' | 'WEEKLY' | 'MONTHLY')}
                className="w-full rounded-2xl border border-slate-200 px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 shadow-sm bg-no-repeat bg-[right_16px_center]"
                id="expense-recurring-input"
              >
                <option value="NONE">Không lặp lại (Một lần)</option>
                <option value="WEEKLY">Lặp lại hàng tuần</option>
                <option value="MONTHLY">Lặp lại hàng tháng</option>
              </select>
            </div>
          )}

          {/* Submit Action Block */}
          <div className="flex gap-3 pt-2 text-right justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors border border-slate-200 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-500 hover:bg-emerald-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-200 transition-all cursor-pointer"
            >
              {editingExpense ? 'Lưu thay đổi' : 'Lưu chi tiêu'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
