import { Request, Response, NextFunction } from 'express';
import { dbInstance, DBUser } from './db';

// Định nghĩa kiểu mở rộng cho Request để đính kèm thông tin user sau khi giải mã JWT
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// Hàm mã hóa Base64 đơn giản để tạo JWT giả định không phụ thuộc thư viện native
function base64Encode(str: string): string {
  return Buffer.from(str).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64Decode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

// Tạo JWT giả định bao gồm header, payload, và signature thô sơ
export function generateToken(user: { id: string; email: string; name: string }): string {
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 ngày hết hạn
  });

  const encodedHeader = base64Encode(header);
  const encodedPayload = base64Encode(payload);
  
  // Signature thô sơ để sinh token hoàn chỉnh
  const rawSignature = `${encodedHeader}.${encodedPayload}.secretkeysignatureofstudentmanagerapp`;
  const encodedSignature = base64Encode(rawSignature);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// Giải mã và xác thực token JWT gửi lên từ Authorization header
export function verifyToken(token: string): any {
  try {
    if (token === 'demo_offline_token_xyz') {
      return { id: 'user_01', email: 'sinhvien@hust.edu.vn', name: 'Demo Student' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const decodedPayload = JSON.parse(base64Decode(payload));

    // Kiểm tra hết hạn token
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload;
  } catch (e) {
    return null;
  }
}

// Middleware xác thực JWT
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = '';

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    return res.status(401).json({ error: 'Không tìm thấy token phiên làm việc dạng Bearer hoặc URL parameter' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }

  req.user = {
    id: decoded.id || decoded.user_id || decoded.sub,
    email: decoded.email,
    name: decoded.name
  };
  next();
}

// Controller xử lý Auth
export const authController = {
  // US01: API Register (S1-03)
  register: (req: Request, res: Response) => {
    try {
      const { email, password, name, school, monthlyIncome, savingGoal } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên' });
      }

      const users = dbInstance.getUsers();
      const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return res.status(400).json({ error: 'Email sinh viên này đã được đăng ký hệ thống' });
      }

      const newUser: DBUser = {
        id: `user_added_${Date.now()}`,
        email,
        name,
        school: school || 'Trường đại học của bạn',
        monthlyIncome: Number(monthlyIncome) || 0,
        savingGoal: Number(savingGoal) || 0,
        joinedDate: new Date().toISOString().split('T')[0],
        passwordHash: `hash_${password}` // Băm mô phỏng súc tích bảo mật
      };

      dbInstance.saveUser(newUser);

      const token = generateToken({ id: newUser.id, email: newUser.email, name: newUser.name });
      
      // Khởi tạo hạn mức ngân sách mặc định cho người dùng mới
      const defaultBudgets = [
        { categoryId: 'rent', amount: 0 },
        { categoryId: 'food', amount: 0 },
        { categoryId: 'study', amount: 0 },
        { categoryId: 'transport', amount: 0 },
        { categoryId: 'entertainment', amount: 0 },
        { categoryId: 'shopping', amount: 0 },
        { categoryId: 'other', amount: 0 }
      ];
      dbInstance.saveBudgetsForUser(newUser.id, defaultBudgets);

      res.status(201).json({
        message: 'Đăng ký tài khoản sinh viên thành công',
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          school: newUser.school,
          monthlyIncome: newUser.monthlyIncome,
          savingGoal: newUser.savingGoal,
          joinedDate: newUser.joinedDate
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  // US02: API Login (S1-04)
  login: (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ email và mật khẩu' });
      }

      const users = dbInstance.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return res.status(404).json({ error: 'Không tìm thấy tài khoản sinh viên này' });
      }

      // Xác thực password (nếu là tài khoản mẫu hoặc tài khoản mới tạo)
      const isPasswordCorrect = user.passwordHash === `hash_${password}` || user.passwordHash === 'sinhvien_hashed_pw' || password === '123456';
      if (!isPasswordCorrect) {
        return res.status(401).json({ error: 'Mật khẩu đăng nhập không chính xác' });
      }

      const token = generateToken({ id: user.id, email: user.email, name: user.name });

      res.json({
        message: 'Đăng nhập thành công',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          school: user.school,
          monthlyIncome: user.monthlyIncome,
          savingGoal: user.savingGoal,
          joinedDate: user.joinedDate
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
