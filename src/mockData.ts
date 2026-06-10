import { Category, Expense, Budget, User, Notification } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'rent',
    name: 'Tiền nhà & Điện nước',
    icon: 'Home',
    color: 'bg-red-500/10 border-red-500/30 text-red-600',
    textColor: 'text-red-600',
    description: 'Tiền thuê phòng trọ, KTX, hóa đơn điện nước, internet hằng tháng'
  },
  {
    id: 'food',
    name: 'Ăn uống hằng ngày',
    icon: 'Utensils',
    color: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
    textColor: 'text-amber-600',
    description: 'Ăn sáng, trưa, tối, chợ búa, cơm bình dân'
  },
  {
    id: 'study',
    name: 'Học tập & Giáo trình',
    icon: 'BookOpen',
    color: 'bg-blue-500/10 border-blue-500/30 text-blue-600',
    textColor: 'text-blue-600',
    description: 'Mua sách, giáo trình, dụng cụ học tập, học phí, photo tài liệu'
  },
  {
    id: 'transport',
    name: 'Di chuyển & Xăng xe',
    icon: 'Car',
    color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600',
    textColor: 'text-emerald-600',
    description: 'Xăng xe máy, vé xe bus, Grab, sửa xe'
  },
  {
    id: 'entertainment',
    name: 'Giải trí & Trà sữa',
    icon: 'Coffee',
    color: 'bg-pink-500/10 border-pink-500/30 text-pink-600',
    textColor: 'text-pink-600',
    description: 'Trà sữa, xem phim, tụ tập bạn bè, ăn vặt'
  },
  {
    id: 'shopping',
    name: 'Mua sắm & Đồ dùng',
    icon: 'ShoppingBag',
    color: 'bg-violet-500/10 border-violet-500/30 text-violet-600',
    textColor: 'text-violet-600',
    description: 'Quần áo, mỹ phẩm, đồ dùng cá nhân, dầu gội, bột giặt'
  },
  {
    id: 'other',
    name: 'Các chi phí khác',
    icon: 'HelpCircle',
    color: 'bg-slate-500/10 border-slate-500/30 text-slate-600',
    textColor: 'text-slate-600',
    description: 'Đau ốm, đám tiệc, các phát sinh đột xuất không nằm trong danh mục'
  },
  {
    id: 'group_fund',
    name: 'Quỹ nhóm',
    icon: 'Users',
    color: 'bg-teal-500/10 border-teal-500/30 text-teal-600',
    textColor: 'text-teal-600',
    description: 'Chi tiêu đóng quỹ nhóm, phân chia tiền phòng, tất toán công nợ nhóm'
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'user_01',
    email: 'sinhvien@hust.edu.vn',
    name: 'Nguyễn Minh Đức',
    school: 'Đại Học Bách Khoa Hà Nội',
    monthlyIncome: 4500000, // 4.5 triệu VND
    savingGoal: 500000,     // Mục tiêu tiết kiệm 500k
    joinedDate: '2026-02-15'
  }
];

// Giả định ngày hôm nay là ngày 2026-06-01. Ta tạo dữ liệu chi tiêu phong phú của tháng 5 (để xem báo cáo) và một số giao dịch đầu tháng 6.
export const INITIAL_EXPENSES: Expense[] = [
  // --- THÁNG 5/2026 (Tháng trước - để vẽ báo cáo hoàn chỉnh) ---
  {
    id: 'exp_01',
    userId: 'user_01',
    amount: 1500000,
    categoryId: 'rent',
    title: 'Tiền phòng trọ tháng 5 + điện nước',
    date: '2026-05-02',
    note: 'Đóng đầu tháng cho chủ nhà',
    isNecessary: true
  },
  {
    id: 'exp_02',
    userId: 'user_01',
    amount: 120000,
    categoryId: 'study',
    title: 'Sách giải tích 2 và giáo trình',
    date: '2026-05-04',
    note: 'Mua ở cổng trường',
    isNecessary: true
  },
  {
    id: 'exp_03',
    userId: 'user_01',
    amount: 45000,
    categoryId: 'food',
    title: 'Ăn cơm trưa Bách Khoa',
    date: '2026-05-05',
    note: 'Suất cơm sườn 45k',
    isNecessary: true
  },
  {
    id: 'exp_04',
    userId: 'user_01',
    amount: 60000,
    categoryId: 'entertainment',
    title: 'Trà sữa KOI Thé với bạn',
    date: '2026-05-06',
    note: 'Thèm quá mua uống giải sầu',
    isNecessary: false
  },
  {
    id: 'exp_05',
    userId: 'user_01',
    amount: 90000,
    categoryId: 'transport',
    title: 'Đổ xăng xe máy Wave',
    date: '2026-05-08',
    note: 'Xăng đắt quá đổ đầy bình',
    isNecessary: true
  },
  {
    id: 'exp_06',
    userId: 'user_01',
    amount: 350000,
    categoryId: 'shopping',
    title: 'Mua giày sneaker giá rẻ',
    date: '2026-05-10',
    note: 'Mua sale trên Shopee',
    isNecessary: false
  },
  {
    id: 'exp_07',
    userId: 'user_01',
    amount: 45000,
    categoryId: 'food',
    title: 'Cơm tối bình dân',
    date: '2026-05-11',
    isNecessary: true
  },
  {
    id: 'exp_08',
    userId: 'user_01',
    amount: 250000,
    categoryId: 'study',
    title: 'Tiền quỹ lớp kì II',
    date: '2026-05-12',
    note: 'Đóng cho lớp trưởng',
    isNecessary: true
  },
  {
    id: 'exp_09',
    userId: 'user_01',
    amount: 85000,
    categoryId: 'food',
    title: 'Ăn lẩu ly ăn vặt vỉa hè',
    date: '2026-05-15',
    note: 'Ăn chung với mấy bạn cùng phòng ký túc xá cũ',
    isNecessary: false
  },
  {
    id: 'exp_10',
    userId: 'user_01',
    amount: 110000,
    categoryId: 'shopping',
    title: 'Kem đánh răng, dầu gội, sữa tắm',
    date: '2026-05-16',
    note: 'Mua ở tạp hóa đầu ngõ',
    isNecessary: true
  },
  {
    id: 'exp_11',
    userId: 'user_01',
    amount: 45000,
    categoryId: 'food',
    title: 'Bát phở bò ăn sáng',
    date: '2026-05-18',
    isNecessary: true
  },
  {
    id: 'exp_12',
    userId: 'user_01',
    amount: 150000,
    categoryId: 'entertainment',
    title: 'Vé xem phim Doctor Strange mới',
    date: '2026-05-20',
    note: 'CGV Vincom Bà Triệu',
    isNecessary: false
  },
  {
    id: 'exp_13',
    userId: 'user_01',
    amount: 90000,
    categoryId: 'transport',
    title: 'Đổ xăng lần 2',
    date: '2026-05-22',
    isNecessary: true
  },
  {
    id: 'exp_14',
    userId: 'user_01',
    amount: 420000,
    categoryId: 'food',
    title: 'Ăn buffet lẩu sinh nhật bạn',
    date: '2026-05-24',
    note: 'Buổi tối vui vẻ nhưng hơi xót ví',
    isNecessary: false
  },
  {
    id: 'exp_15',
    userId: 'user_01',
    amount: 250000,
    categoryId: 'other',
    title: 'Thuốc men cảm cúm',
    date: '2026-05-26',
    note: 'Bị sốt mua thuốc tây uống',
    isNecessary: true
  },
  {
    id: 'exp_16',
    userId: 'user_01',
    amount: 50000,
    categoryId: 'food',
    title: 'Bánh mỳ và cafe sáng',
    date: '2026-05-28',
    isNecessary: true
  },
  {
    id: 'exp_17',
    userId: 'user_01',
    amount: 200000,
    categoryId: 'shopping',
    title: 'Mua áo thun mùa hè',
    date: '2026-05-29',
    note: 'Mua chợ đêm',
    isNecessary: false
  },

  // --- THÁNG 6/2026 (Tháng hiện tại - Mới bắt đầu chi tiêu) ---
  {
    id: 'exp_20',
    userId: 'user_01',
    amount: 1600000,
    categoryId: 'rent',
    title: 'Tiền phòng trọ + Internet tháng 6',
    date: '2026-06-01',
    note: 'Đã đóng buổi sáng',
    isNecessary: true
  },
  {
    id: 'exp_21',
    userId: 'user_01',
    amount: 55000,
    categoryId: 'food',
    title: 'Bún chả trưa đầu tháng',
    date: '2026-06-01',
    isNecessary: true
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  { categoryId: 'rent', amount: 1600000 },
  { categoryId: 'food', amount: 1200000 },
  { categoryId: 'study', amount: 400000 },
  { categoryId: 'transport', amount: 300000 },
  { categoryId: 'entertainment', amount: 300000 },
  { categoryId: 'shopping', amount: 400000 },
  { categoryId: 'other', amount: 200000 }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'not_01',
    userId: 'user_01',
    type: 'success',
    title: 'Chào mừng bạn đến với Student Expense Manager!',
    message: 'Hãy bắt đầu phân chia các khoản ngân sách chi tiêu để không còn cháy túi cuối tháng nhé.',
    date: '2026-06-01 08:00:00',
    read: false
  },
  {
    id: 'not_02',
    userId: 'user_01',
    type: 'warning',
    title: 'Hạn mức Nhà trọ tháng 6 đã đạt tối đa!',
    message: 'Khoản chi "Tiền phòng trọ + Internet" 1,600,000đ đã dùng hết 100% ngân sách danh mục nhà trọ tháng này.',
    date: '2026-06-01 09:15:00',
    read: false
  }
];
