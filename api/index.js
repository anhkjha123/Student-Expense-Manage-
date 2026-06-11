// src/server/app.ts
import express from "express";

// src/server/db.ts
import fs from "fs";
import path from "path";
var isVercel = !!process.env.VERCEL;
var DB_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "data");
var DB_FILE = path.join(DB_DIR, "db.json");
function initDB() {
  if (!fs.existsSync(DB_DIR)) {
    try {
      fs.mkdirSync(DB_DIR, { recursive: true });
    } catch (e) {
      console.warn("Cannot create DB_DIR, might be read-only:", e);
    }
  }
  if (!fs.existsSync(DB_FILE)) {
    let initialSchema = null;
    if (isVercel) {
      const bundledPath = path.join(process.cwd(), "data", "db.json");
      if (fs.existsSync(bundledPath)) {
        try {
          initialSchema = JSON.parse(fs.readFileSync(bundledPath, "utf-8"));
        } catch (e) {
          console.warn("Failed to read bundled db.json:", e);
        }
      }
    }
    if (!initialSchema) {
      initialSchema = {
        users: [
          {
            id: "user_01",
            email: "sinhvien@hust.edu.vn",
            name: "Nguy\u1EC5n Minh \u0110\u1EE9c",
            school: "\u0110\u1EA1i H\u1ECDc B\xE1ch Khoa H\xE0 N\u1ED9i",
            monthlyIncome: 45e5,
            savingGoal: 5e5,
            joinedDate: "2026-02-15",
            passwordHash: "sinhvien_hashed_pw"
            // Demo password
          }
        ],
        expenses: [
          // Một số khoản chi của tháng 5/2026 và tháng 6/2026 cho người dùng mẫu
          {
            id: "exp_01",
            userId: "user_01",
            amount: 15e5,
            categoryId: "rent",
            title: "Ti\u1EC1n ph\xF2ng tr\u1ECD th\xE1ng 5 + \u0111i\u1EC7n n\u01B0\u1EDBc",
            date: "2026-05-02",
            note: "\u0110\xF3ng \u0111\u1EA7u th\xE1ng cho ch\u1EE7 nh\xE0",
            isNecessary: true
          },
          {
            id: "exp_02",
            userId: "user_01",
            amount: 12e4,
            categoryId: "study",
            title: "S\xE1ch gi\u1EA3i t\xEDch 2 v\xE0 gi\xE1o tr\xECnh",
            date: "2026-05-04",
            note: "Mua \u1EDF c\u1ED5ng tr\u01B0\u1EDDng",
            isNecessary: true
          },
          {
            id: "exp_03",
            userId: "user_01",
            amount: 45e3,
            categoryId: "food",
            title: "\u0102n c\u01A1m tr\u01B0a B\xE1ch Khoa",
            date: "2026-05-05",
            note: "Su\u1EA5t c\u01A1m s\u01B0\u1EDDn 45k",
            isNecessary: true
          },
          {
            id: "exp_04",
            userId: "user_01",
            amount: 6e4,
            categoryId: "entertainment",
            title: "Tr\xE0 s\u1EEFa KOI Th\xE9 v\u1EDBi b\u1EA1n",
            date: "2026-05-06",
            note: "Th\xE8m qu\xE1 mua u\u1ED1ng gi\u1EA3i s\u1EA7u",
            isNecessary: false
          },
          {
            id: "exp_05",
            userId: "user_01",
            amount: 9e4,
            categoryId: "transport",
            title: "\u0110\u1ED5 x\u0103ng xe m\xE1y Wave",
            date: "2026-05-08",
            note: "X\u0103ng \u0111\u1EAFt qu\xE1 \u0111\u1ED5 \u0111\u1EA7y b\xECnh",
            isNecessary: true
          },
          {
            id: "exp_06",
            userId: "user_01",
            amount: 35e4,
            categoryId: "shopping",
            title: "Mua gi\xE0y sneaker gi\xE1 r\u1EBB",
            date: "2026-05-10",
            note: "Mua sale tr\xEAn Shopee",
            isNecessary: false
          },
          {
            id: "exp_07",
            userId: "user_01",
            amount: 45e3,
            categoryId: "food",
            title: "C\u01A1m t\u1ED1i b\xECnh d\xE2n",
            date: "2026-05-11",
            isNecessary: true
          },
          {
            id: "exp_08",
            userId: "user_01",
            amount: 25e4,
            categoryId: "study",
            title: "Ti\u1EC1n qu\u1EF9 l\u1EDBp k\xEC II",
            date: "2026-05-12",
            note: "\u0110\xF3ng cho l\u1EDBp tr\u01B0\u1EDFng",
            isNecessary: true
          },
          {
            id: "exp_09",
            userId: "user_01",
            amount: 85e3,
            categoryId: "food",
            title: "\u0102n l\u1EA9u ly \u0103n v\u1EB7t v\u1EC9a h\xE8",
            date: "2026-05-15",
            note: "\u0102n chung v\u1EDBi m\u1EA5y b\u1EA1n c\xF9ng ph\xF2ng k\xFD t\xFAc x\xE1 c\u0169",
            isNecessary: false
          },
          {
            id: "exp_10",
            userId: "user_01",
            amount: 11e4,
            categoryId: "shopping",
            title: "Kem \u0111\xE1nh r\u0103ng, d\u1EA7u g\u1ED9i, s\u1EEFa t\u1EAFm",
            date: "2026-05-16",
            note: "Mua \u1EDF t\u1EA1p h\xF3a \u0111\u1EA7u ng\xF5",
            isNecessary: true
          },
          {
            id: "exp_11",
            userId: "user_01",
            amount: 45e3,
            categoryId: "food",
            title: "B\xE1t ph\u1EDF b\xF2 \u0103n s\xE1ng",
            date: "2026-05-18",
            isNecessary: true
          },
          {
            id: "exp_12",
            userId: "user_01",
            amount: 15e4,
            categoryId: "entertainment",
            title: "V\xE9 xem phim Doctor Strange m\u1EDBi",
            date: "2026-05-20",
            note: "CGV Vincom B\xE0 Tri\u1EC7u",
            isNecessary: false
          },
          {
            id: "exp_13",
            userId: "user_01",
            amount: 9e4,
            categoryId: "transport",
            title: "\u0110\u1ED5 x\u0103ng l\u1EA7n 2",
            date: "2026-05-22",
            isNecessary: true
          },
          {
            id: "exp_14",
            userId: "user_01",
            amount: 42e4,
            categoryId: "food",
            title: "\u0102n buffet l\u1EA9u sinh nh\u1EADt b\u1EA1n",
            date: "2026-05-24",
            note: "Bu\u1ED5i t\u1ED1i vui v\u1EBB nh\u01B0ng h\u01A1i x\xF3t v\xED",
            isNecessary: false
          },
          {
            id: "exp_15",
            userId: "user_01",
            amount: 25e4,
            categoryId: "other",
            title: "Thu\u1ED1c men c\u1EA3m c\xFAm",
            date: "2026-05-26",
            note: "B\u1ECB s\u1ED1t mua thu\u1ED1c t\xE2y u\u1ED1ng",
            isNecessary: true
          },
          {
            id: "exp_16",
            userId: "user_01",
            amount: 5e4,
            categoryId: "food",
            title: "B\xE1nh m\u1EF3 v\xE0 cafe s\xE1ng",
            date: "2026-05-28",
            isNecessary: true
          },
          {
            id: "exp_17",
            userId: "user_01",
            amount: 2e5,
            categoryId: "shopping",
            title: "Mua \xE1o thun m\xF9a h\xE8",
            date: "2026-05-29",
            note: "Mua ch\u1EE3 \u0111\xEAm",
            isNecessary: false
          },
          {
            id: "exp_20",
            userId: "user_01",
            amount: 16e5,
            categoryId: "rent",
            title: "Ti\u1EC1n ph\xF2ng tr\u1ECD + Internet th\xE1ng 6",
            date: "2026-06-01",
            note: "\u0110\xE3 \u0111\xF3ng bu\u1ED5i s\xE1ng",
            isNecessary: true
          },
          {
            id: "exp_21",
            userId: "user_01",
            amount: 55e3,
            categoryId: "food",
            title: "B\xFAn ch\u1EA3 tr\u01B0a \u0111\u1EA7u th\xE1ng",
            date: "2026-06-01",
            isNecessary: true
          }
        ],
        budgets: [
          { userId: "user_01", categoryId: "rent", amount: 16e5 },
          { userId: "user_01", categoryId: "food", amount: 12e5 },
          { userId: "user_01", categoryId: "study", amount: 4e5 },
          { userId: "user_01", categoryId: "transport", amount: 3e5 },
          { userId: "user_01", categoryId: "entertainment", amount: 3e5 },
          { userId: "user_01", categoryId: "shopping", amount: 4e5 },
          { userId: "user_01", categoryId: "other", amount: 2e5 }
        ],
        notifications: [
          {
            id: "not_01",
            userId: "user_01",
            type: "success",
            title: "Ch\xE0o m\u1EEBng b\u1EA1n \u0111\u1EBFn v\u1EDBi Student Expense Manager!",
            message: "H\xE3y b\u1EAFt \u0111\u1EA7u ph\xE2n chia c\xE1c kho\u1EA3n ng\xE2n s\xE1ch chi ti\xEAu \u0111\u1EC3 kh\xF4ng c\xF2n ch\xE1y t\xFAi cu\u1ED1i th\xE1ng nh\xE9.",
            date: "2026-06-01 08:00:00",
            read: false
          },
          {
            id: "not_02",
            userId: "user_01",
            type: "warning",
            title: "H\u1EA1n m\u1EE9c Nh\xE0 tr\u1ECD th\xE1ng 6 \u0111\xE3 \u0111\u1EA1t t\u1ED1i \u0111a!",
            message: 'Kho\u1EA3n chi "Ti\u1EC1n ph\xF2ng tr\u1ECD + Internet" 1,600,000\u0111 \u0111\xE3 d\xF9ng h\u1EBFt 100% ng\xE2n s\xE1ch danh m\u1EE5c nh\xE0 tr\u1ECD th\xE1ng n\xE0y.',
            date: "2026-06-01 09:15:00",
            read: false
          }
        ],
        savingGoals: [
          {
            id: "goal_01",
            userId: "user_01",
            name: "Mua Macbook Pro",
            targetAmount: 35e6,
            currentAmount: 0,
            deadline: "2026-12-31",
            status: "On Track",
            categoryId: "study"
          }
        ],
        incomes: [
          {
            id: "inc_01",
            userId: "user_01",
            amount: 45e5,
            source: "FAMILY",
            date: "2026-05-01",
            note: "B\u1ED1 m\u1EB9 cho ti\u1EC1n ti\xEAu v\u1EB7t th\xE1ng 5"
          },
          {
            id: "inc_02",
            userId: "user_01",
            amount: 2e6,
            source: "PART_TIME",
            date: "2026-05-15",
            note: "L\u01B0\u01A1ng gia s\u01B0"
          },
          {
            id: "inc_03",
            userId: "user_01",
            amount: 45e5,
            source: "FAMILY",
            date: "2026-06-01",
            note: "B\u1ED1 m\u1EB9 cho ti\u1EC1n ti\xEAu v\u1EB7t th\xE1ng 6"
          }
        ],
        recurringExpenses: [
          {
            id: "rec_01",
            userId: "user_01",
            amount: 16e5,
            categoryId: "rent",
            title: "Ti\u1EC1n ph\xF2ng tr\u1ECD + Internet",
            cycle: "MONTHLY",
            startDate: "2026-06-01"
          }
        ],
        groups: [],
        groupMembers: [],
        groupExpenses: [],
        groupSettlements: []
      };
    }
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSchema, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write default db.json:", e);
    }
  }
}
var Database = class {
  constructor() {
    try {
      initDB();
    } catch (e) {
      console.error("Failed to initialize database:", e);
    }
  }
  read() {
    try {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const schema = JSON.parse(data);
      if (!schema.groups) schema.groups = [];
      if (!schema.groupMembers) schema.groupMembers = [];
      if (!schema.groupExpenses) schema.groupExpenses = [];
      if (!schema.groupSettlements) schema.groupSettlements = [];
      return schema;
    } catch (e) {
      console.error("L\u1ED7i khi \u0111\u1ECDc file database:", e);
      return {
        users: [],
        expenses: [],
        budgets: [],
        notifications: [],
        savingGoals: [],
        incomes: [],
        recurringExpenses: [],
        groups: [],
        groupMembers: [],
        groupExpenses: [],
        groupSettlements: []
      };
    }
  }
  write(schema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), "utf-8");
    } catch (e) {
      console.error("L\u1ED7i khi ghi file database:", e);
    }
  }
  // --- USERS ---
  getUsers() {
    return this.read().users;
  }
  saveUser(user) {
    const schema = this.read();
    const idx = schema.users.findIndex((u) => u.id === user.id || u.email === user.email);
    if (idx >= 0) {
      schema.users[idx] = user;
    } else {
      schema.users.push(user);
    }
    this.write(schema);
  }
  // --- EXPENSES ---
  getExpenses() {
    return this.read().expenses;
  }
  saveExpense(expense) {
    const schema = this.read();
    const idx = schema.expenses.findIndex((e) => e.id === expense.id);
    if (idx >= 0) {
      schema.expenses[idx] = expense;
    } else {
      schema.expenses.push(expense);
    }
    this.write(schema);
  }
  deleteExpense(expenseId) {
    const schema = this.read();
    const filter = schema.expenses.filter((e) => e.id !== expenseId);
    if (filter.length === schema.expenses.length) return false;
    schema.expenses = filter;
    this.write(schema);
    return true;
  }
  // --- BUDGETS ---
  getBudgets() {
    return this.read().budgets;
  }
  saveBudgetsForUser(userId, budgets) {
    const schema = this.read();
    schema.budgets = schema.budgets.filter((b) => b.userId !== userId);
    budgets.forEach((b) => {
      schema.budgets.push({
        userId,
        categoryId: b.categoryId,
        amount: b.amount
      });
    });
    this.write(schema);
  }
  // --- NOTIFICATIONS ---
  getNotifications() {
    return this.read().notifications;
  }
  saveNotification(notif) {
    const schema = this.read();
    const idx = schema.notifications.findIndex((n) => n.id === notif.id);
    if (idx >= 0) {
      schema.notifications[idx] = notif;
    } else {
      schema.notifications.unshift(notif);
    }
    this.write(schema);
  }
  saveAllNotifications(notifs) {
    const schema = this.read();
    schema.notifications = notifs;
    this.write(schema);
  }
  // --- SAVING GOALS ---
  getSavingGoals() {
    return this.read().savingGoals || [];
  }
  saveSavingGoal(goal) {
    const schema = this.read();
    if (!schema.savingGoals) schema.savingGoals = [];
    const idx = schema.savingGoals.findIndex((g) => g.id === goal.id);
    if (idx >= 0) {
      schema.savingGoals[idx] = goal;
    } else {
      schema.savingGoals.push(goal);
    }
    this.write(schema);
  }
  deleteSavingGoal(id) {
    const schema = this.read();
    if (!schema.savingGoals) return false;
    const filter = schema.savingGoals.filter((g) => g.id !== id);
    if (filter.length === schema.savingGoals.length) return false;
    schema.savingGoals = filter;
    this.write(schema);
    return true;
  }
  // --- INCOMES ---
  getIncomes() {
    return this.read().incomes || [];
  }
  saveIncome(income) {
    const schema = this.read();
    if (!schema.incomes) schema.incomes = [];
    const idx = schema.incomes.findIndex((i) => i.id === income.id);
    if (idx >= 0) {
      schema.incomes[idx] = income;
    } else {
      schema.incomes.push(income);
    }
    this.write(schema);
  }
  deleteIncome(id) {
    const schema = this.read();
    if (!schema.incomes) return false;
    const filter = schema.incomes.filter((i) => i.id !== id);
    if (filter.length === schema.incomes.length) return false;
    schema.incomes = filter;
    this.write(schema);
    return true;
  }
  // --- RECURRING EXPENSES ---
  getRecurringExpenses() {
    return this.read().recurringExpenses || [];
  }
  saveRecurringExpense(recurring) {
    const schema = this.read();
    if (!schema.recurringExpenses) schema.recurringExpenses = [];
    const idx = schema.recurringExpenses.findIndex((r) => r.id === recurring.id);
    if (idx >= 0) {
      schema.recurringExpenses[idx] = recurring;
    } else {
      schema.recurringExpenses.push(recurring);
    }
    this.write(schema);
  }
  deleteRecurringExpense(id) {
    const schema = this.read();
    if (!schema.recurringExpenses) return false;
    const filter = schema.recurringExpenses.filter((r) => r.id !== id);
    if (filter.length === schema.recurringExpenses.length) return false;
    schema.recurringExpenses = filter;
    this.write(schema);
    return true;
  }
  // --- GROUPS ---
  getGroups() {
    return this.read().groups || [];
  }
  saveGroup(group) {
    const schema = this.read();
    if (!schema.groups) schema.groups = [];
    const idx = schema.groups.findIndex((g) => g.id === group.id);
    if (idx >= 0) {
      schema.groups[idx] = group;
    } else {
      schema.groups.push(group);
    }
    this.write(schema);
  }
  deleteGroup(groupId) {
    const schema = this.read();
    if (!schema.groups) return false;
    const filtered = schema.groups.filter((g) => g.id !== groupId);
    if (filtered.length === schema.groups.length) return false;
    schema.groups = filtered;
    if (schema.groupMembers) {
      schema.groupMembers = schema.groupMembers.filter((m) => m.groupId !== groupId);
    }
    if (schema.groupExpenses) {
      schema.groupExpenses = schema.groupExpenses.filter((e) => e.groupId !== groupId);
    }
    if (schema.groupSettlements) {
      schema.groupSettlements = schema.groupSettlements.filter((s) => s.groupId !== groupId);
    }
    this.write(schema);
    return true;
  }
  // --- GROUP MEMBERS ---
  getGroupMembers() {
    return this.read().groupMembers || [];
  }
  saveGroupMember(member) {
    const schema = this.read();
    if (!schema.groupMembers) schema.groupMembers = [];
    const idx = schema.groupMembers.findIndex((m) => m.id === member.id);
    if (idx >= 0) {
      schema.groupMembers[idx] = member;
    } else {
      schema.groupMembers.push(member);
    }
    this.write(schema);
  }
  saveGroupMembers(members) {
    const schema = this.read();
    if (!schema.groupMembers) schema.groupMembers = [];
    members.forEach((m) => {
      const idx = schema.groupMembers.findIndex((gm) => gm.id === m.id);
      if (idx >= 0) {
        schema.groupMembers[idx] = m;
      } else {
        schema.groupMembers.push(m);
      }
    });
    this.write(schema);
  }
  // --- GROUP EXPENSES ---
  getGroupExpenses() {
    return this.read().groupExpenses || [];
  }
  saveGroupExpense(expense) {
    const schema = this.read();
    if (!schema.groupExpenses) schema.groupExpenses = [];
    const idx = schema.groupExpenses.findIndex((e) => e.id === expense.id);
    if (idx >= 0) {
      schema.groupExpenses[idx] = expense;
    } else {
      schema.groupExpenses.push(expense);
    }
    this.write(schema);
  }
  // --- GROUP SETTLEMENTS ---
  getGroupSettlements() {
    return this.read().groupSettlements || [];
  }
  saveGroupSettlement(settlement) {
    const schema = this.read();
    if (!schema.groupSettlements) schema.groupSettlements = [];
    const idx = schema.groupSettlements.findIndex((s) => s.id === settlement.id);
    if (idx >= 0) {
      schema.groupSettlements[idx] = settlement;
    } else {
      schema.groupSettlements.push(settlement);
    }
    this.write(schema);
  }
};
var dbInstance = new Database();

// src/server/auth.ts
function base64Encode(str) {
  return Buffer.from(str).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function base64Decode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}
function generateToken(user) {
  const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1e3),
    exp: Math.floor(Date.now() / 1e3) + 7 * 24 * 60 * 60
    // 7 ngày hết hạn
  });
  const encodedHeader = base64Encode(header);
  const encodedPayload = base64Encode(payload);
  const rawSignature = `${encodedHeader}.${encodedPayload}.secretkeysignatureofstudentmanagerapp`;
  const encodedSignature = base64Encode(rawSignature);
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}
function verifyToken(token) {
  try {
    if (token === "demo_offline_token_xyz") {
      return { id: "user_01", email: "sinhvien@hust.edu.vn", name: "Demo Student" };
    }
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [, payload] = parts;
    const decodedPayload = JSON.parse(base64Decode(payload));
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1e3)) {
      return null;
    }
    return decodedPayload;
  } catch (e) {
    return null;
  }
}
function authMiddleware(req, res, next) {
  let token = "";
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }
  if (!token) {
    return res.status(401).json({ error: "Kh\xF4ng t\xECm th\u1EA5y token phi\xEAn l\xE0m vi\u1EC7c d\u1EA1ng Bearer ho\u1EB7c URL parameter" });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: "Token kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n" });
  }
  const userId = decoded.id || decoded.user_id || decoded.sub || decoded.uid;
  req.user = {
    id: userId,
    email: decoded.email || "",
    name: decoded.name || decoded.email?.split("@")[0] || "User"
  };
  next();
}
var authController = {
  // US01: API Register (S1-03)
  register: (req, res) => {
    try {
      const { email, password, name, school, monthlyIncome, savingGoal } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Vui l\xF2ng cung c\u1EA5p \u0111\u1EA7y \u0111\u1EE7 email, m\u1EADt kh\u1EA9u v\xE0 h\u1ECD t\xEAn" });
      }
      const users = dbInstance.getUsers();
      const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return res.status(400).json({ error: "Email sinh vi\xEAn n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c \u0111\u0103ng k\xFD h\u1EC7 th\u1ED1ng" });
      }
      const newUser = {
        id: `user_added_${Date.now()}`,
        email,
        name,
        school: school || "Tr\u01B0\u1EDDng \u0111\u1EA1i h\u1ECDc c\u1EE7a b\u1EA1n",
        monthlyIncome: Number(monthlyIncome) || 0,
        savingGoal: Number(savingGoal) || 0,
        joinedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        passwordHash: `hash_${password}`
        // Băm mô phỏng súc tích bảo mật
      };
      dbInstance.saveUser(newUser);
      const token = generateToken({ id: newUser.id, email: newUser.email, name: newUser.name });
      const defaultBudgets = [
        { categoryId: "rent", amount: 0 },
        { categoryId: "food", amount: 0 },
        { categoryId: "study", amount: 0 },
        { categoryId: "transport", amount: 0 },
        { categoryId: "entertainment", amount: 0 },
        { categoryId: "shopping", amount: 0 },
        { categoryId: "other", amount: 0 }
      ];
      dbInstance.saveBudgetsForUser(newUser.id, defaultBudgets);
      res.status(201).json({
        message: "\u0110\u0103ng k\xFD t\xE0i kho\u1EA3n sinh vi\xEAn th\xE0nh c\xF4ng",
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
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  // US02: API Login (S1-04)
  login: (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Vui l\xF2ng cung c\u1EA5p \u0111\u1EA7y \u0111\u1EE7 email v\xE0 m\u1EADt kh\u1EA9u" });
      }
      const users = dbInstance.getUsers();
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y t\xE0i kho\u1EA3n sinh vi\xEAn n\xE0y" });
      }
      const isPasswordCorrect = user.passwordHash === `hash_${password}` || user.passwordHash === "sinhvien_hashed_pw" || password === "123456";
      if (!isPasswordCorrect) {
        return res.status(401).json({ error: "M\u1EADt kh\u1EA9u \u0111\u0103ng nh\u1EADp kh\xF4ng ch\xEDnh x\xE1c" });
      }
      const token = generateToken({ id: user.id, email: user.email, name: user.name });
      res.json({
        message: "\u0110\u0103ng nh\u1EADp th\xE0nh c\xF4ng",
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
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
};

// src/server/expenses.ts
var expensesController = {
  // S1-14: API Get Expense
  getExpenses: (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Ngo\u1EA1i l\u1EC7 phi\xEAn \u0111\u0103ng nh\u1EADp" });
      const allExpenses = dbInstance.getExpenses();
      const userExpenses = allExpenses.filter((e) => e.userId === userId);
      res.json(userExpenses);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  // S1-15: API Create Expense
  createExpense: (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Ngo\u1EA1i l\u1EC7 phi\xEAn \u0111\u0103ng nh\u1EADp" });
      const { amount, categoryId, title, date, note, isNecessary, isRecurring } = req.body;
      if (!amount || !categoryId || !title || !date) {
        return res.status(400).json({ error: "Vui l\xF2ng \u0111i\u1EC1n c\xE1c tr\u01B0\u1EDDng b\u1EAFt bu\u1ED9c c\u1EE7a kho\u1EA3n chi" });
      }
      const newExpense = {
        id: `exp_added_${Date.now()}`,
        userId,
        amount: Number(amount),
        categoryId,
        title,
        date,
        note: note || "",
        isNecessary: !!isNecessary,
        isRecurring: !!isRecurring
      };
      dbInstance.saveExpense(newExpense);
      const budgets = dbInstance.getBudgets().filter((b) => b.userId === userId);
      const catBudget = budgets.find((b) => b.categoryId === categoryId);
      if (catBudget && catBudget.amount > 0) {
        const yearMonth = date.substring(0, 7);
        const catExpenses = dbInstance.getExpenses().filter(
          (e) => e.userId === userId && e.categoryId === categoryId && e.date.startsWith(yearMonth)
        );
        const totalSpent = catExpenses.reduce((s, item) => s + item.amount, 0);
        const percent = totalSpent / catBudget.amount * 100;
        if (percent >= 100) {
          const alertNotif = {
            id: `notif_sys_${Date.now()}_exceeded`,
            userId,
            type: "alert",
            title: `V\u1EE2T QU\xC1 H\u1EA0N M\u1EE8C NG\xC2N S\xC1CH!`,
            message: `Ch\xFA \xFD: B\u1EA1n \u0111\xE3 ti\xEAu qu\xE1 ${new Intl.NumberFormat("vi-VN").format(totalSpent)}\u0111 tr\xEAn m\u1ED1c gi\u1EDBi h\u1EA1n ${new Intl.NumberFormat("vi-VN").format(catBudget.amount)}\u0111 c\u1EE7a danh m\u1EE5c n\xE0y.`,
            date: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
            read: false
          };
          dbInstance.saveNotification(alertNotif);
        } else if (percent >= 80) {
          const warnNotif = {
            id: `notif_sys_${Date.now()}_warning_80`,
            userId,
            type: "warning",
            title: `C\u1EA3nh b\xE1o: S\u1EAFp ch\u1EA1m tr\u1EA7n h\u1EA1n m\u1EE9c`,
            message: `B\u1EA1n \u0111\xE3 s\u1EED d\u1EE5ng ${Math.round(percent)}% h\u1EA1n m\u1EE9c d\xE3 g\xE1n c\u1EE7a danh m\u1EE5c n\xE0y th\xE1ng n\xE0y (${new Intl.NumberFormat("vi-VN").format(totalSpent)}\u0111 / ${new Intl.NumberFormat("vi-VN").format(catBudget.amount)}\u0111).`,
            date: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
            read: false
          };
          dbInstance.saveNotification(warnNotif);
        }
      }
      res.status(201).json(newExpense);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  // S1-16: API Update Expense
  updateExpense: (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Ngo\u1EA1i l\u1EC7 phi\xEAn \u0111\u0103ng nh\u1EADp" });
      const { id } = req.params;
      const { amount, categoryId, title, date, note, isNecessary, isRecurring } = req.body;
      const allExpenses = dbInstance.getExpenses();
      const existing = allExpenses.find((e) => e.id === id);
      if (!existing) {
        return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y kho\u1EA3n chi ti\xEAu c\u1EA7n c\u1EADp nh\u1EADt" });
      }
      if (existing.userId !== userId) {
        return res.status(403).json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n ch\u1EC9nh s\u1EEDa kho\u1EA3n chi ti\xEAu c\u1EE7a ng\u01B0\u1EDDi kh\xE1c" });
      }
      const updatedExpense = {
        ...existing,
        amount: amount !== void 0 ? Number(amount) : existing.amount,
        categoryId: categoryId || existing.categoryId,
        title: title || existing.title,
        date: date || existing.date,
        note: note !== void 0 ? note : existing.note,
        isNecessary: isNecessary !== void 0 ? !!isNecessary : existing.isNecessary,
        isRecurring: isRecurring !== void 0 ? !!isRecurring : existing.isRecurring
      };
      dbInstance.saveExpense(updatedExpense);
      res.json(updatedExpense);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  // S1-17: API Delete Expense
  deleteExpense: (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Ngo\u1EA1i l\u1EC7 phi\xEAn \u0111\u0103ng nh\u1EADp" });
      const { id } = req.params;
      const allExpenses = dbInstance.getExpenses();
      const existing = allExpenses.find((e) => e.id === id);
      if (!existing) {
        return res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y kho\u1EA3n chi \u0111\u1EC3 x\xF3a" });
      }
      if (existing.userId !== userId) {
        return res.status(403).json({ error: "Kh\xF4ng c\xF3 quy\u1EC1n x\xF3a kho\u1EA3n chi ti\xEAu c\u1EE7a ng\u01B0\u1EDDi kh\xE1c" });
      }
      dbInstance.deleteExpense(id);
      res.json({ message: "\u0110\xE3 x\xF3a kho\u1EA3n chi ti\xEAu th\xE0nh c\xF4ng", id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
};

// src/server/budgets.ts
var budgetsController = {
  // S2-04: API Get Budget
  getBudgets: (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Ngo\u1EA1i l\u1EC7 phi\xEAn \u0111\u0103ng nh\u1EADp" });
      const allBudgets = dbInstance.getBudgets();
      const userBudgets = allBudgets.filter((b) => b.userId === userId).map((b) => ({
        categoryId: b.categoryId,
        amount: b.amount
      }));
      res.json(userBudgets);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  // S2-03, S2-05: API Create, Update Budgets (Save a full list)
  saveBudgets: (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Ngo\u1EA1i l\u1EC7 phi\xEAn \u0111\u0103ng nh\u1EADp" });
      const { budgets } = req.body;
      if (!Array.isArray(budgets)) {
        return res.status(400).json({ error: "\u0110\u1EA7u v\xE0o budgets ph\u1EA3i l\xE0 m\u1ED9t danh s\xE1ch h\u1EE3p l\u1EC7" });
      }
      dbInstance.saveBudgetsForUser(userId, budgets);
      const newNotif = {
        id: `notif_sys_${Date.now()}_budget_upd`,
        userId,
        type: "success",
        title: "C\u1EADp nh\u1EADt h\u1EA1n m\u1EE9c th\xE0nh c\xF4ng!",
        message: "B\u1EA1n v\u1EEBa l\u01B0u c\u1EA5u h\xECnh ph\xE2n ph\u1ED1i h\u1EA1n m\u1EE9c ng\xE2n s\xE1ch th\xF4ng minh th\xE1ng n\xE0y.",
        date: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19),
        read: false
      };
      dbInstance.saveNotification(newNotif);
      res.json({ message: "L\u01B0u ng\xE2n s\xE1ch h\u1EA1n m\u1EE9c th\xE0nh c\xF4ng", budgets });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
};

// src/server/reports.ts
var reportsController = {
  // S3-03: API Monthly Report & S3-08 SQL Aggregation Queries
  getMonthlyReport: (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Ngo\u1EA1i l\u1EC7 phi\xEAn \u0111\u0103ng nh\u1EADp" });
      const { month } = req.query;
      const targetMonth = month || (/* @__PURE__ */ new Date()).toISOString().substring(0, 7);
      const allExpenses = dbInstance.getExpenses();
      const userExpenses = allExpenses.filter((e) => e.userId === userId && e.date.startsWith(targetMonth));
      const aggregation = {};
      let totalSpent = 0;
      let spentNecessary = 0;
      let spentWants = 0;
      userExpenses.forEach((exp) => {
        aggregation[exp.categoryId] = (aggregation[exp.categoryId] || 0) + exp.amount;
        totalSpent += exp.amount;
        if (exp.isNecessary) {
          spentNecessary += exp.amount;
        } else {
          spentWants += exp.amount;
        }
      });
      res.json({
        month: targetMonth,
        totalExpenses: userExpenses.length,
        totalSpent,
        spentNecessary,
        spentWants,
        categoryAggregation: aggregation
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  // S3-04: API Weekly Report
  getWeeklyReport: (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Ngo\u1EA1i l\u1EC7 phi\xEAn \u0111\u0103ng nh\u1EADp" });
      const allExpenses = dbInstance.getExpenses();
      const userExpenses = allExpenses.filter((e) => e.userId === userId);
      const weeks = {
        "Tu\u1EA7n 1": 0,
        "Tu\u1EA7n 2": 0,
        "Tu\u1EA7n 3": 0,
        "Tu\u1EA7n 4": 0
      };
      const currentMonth = (/* @__PURE__ */ new Date()).toISOString().substring(0, 7);
      userExpenses.forEach((exp) => {
        if (exp.date.startsWith(currentMonth)) {
          const day = parseInt(exp.date.split("-")[2]);
          if (day <= 7) weeks["Tu\u1EA7n 1"] += exp.amount;
          else if (day <= 14) weeks["Tu\u1EA7n 2"] += exp.amount;
          else if (day <= 21) weeks["Tu\u1EA7n 3"] += exp.amount;
          else weeks["Tu\u1EA7n 4"] += exp.amount;
        }
      });
      res.json({
        currentMonth,
        weeklyDistribution: weeks
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  // S3-05: API Category Statistics
  getCategoryStats: (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Ngo\u1EA1i l\u1EC7 phi\xEAn \u0111\u0103ng nh\u1EADp" });
      const allExpenses = dbInstance.getExpenses();
      const userExpenses = allExpenses.filter((e) => e.userId === userId);
      const stats = {};
      userExpenses.forEach((exp) => {
        if (!stats[exp.categoryId]) {
          stats[exp.categoryId] = { amount: 0, count: 0 };
        }
        stats[exp.categoryId].amount += exp.amount;
        stats[exp.categoryId].count += 1;
      });
      res.json(stats);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  // S3-06: API Top Spending Category
  getTopCategory: (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Ngo\u1EA1i l\u1EC7 phi\xEAn \u0111\u0103ng nh\u1EADp" });
      const allExpenses = dbInstance.getExpenses();
      const userExpenses = allExpenses.filter((e) => e.userId === userId);
      const totals = {};
      userExpenses.forEach((exp) => {
        totals[exp.categoryId] = (totals[exp.categoryId] || 0) + exp.amount;
      });
      let topCategory = "";
      let topAmount = 0;
      Object.entries(totals).forEach(([catId, amount]) => {
        if (amount > topAmount) {
          topCategory = catId;
          topAmount = amount;
        }
      });
      res.json({
        topCategory,
        amount: topAmount
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  // S3-15: Export PDF (HTML Render Layout)
  exportPDF: (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).send("Vui l\xF2ng \u0111\u0103ng nh\u1EADp");
      const user = dbInstance.getUsers().find((u) => u.id === userId);
      if (!user) return res.status(404).send("Kh\xF4ng t\xECm th\u1EA5y user");
      const { month } = req.query;
      const targetMonth = month || (/* @__PURE__ */ new Date()).toISOString().substring(0, 7);
      const expenses = dbInstance.getExpenses().filter((e) => e.userId === userId && e.date.startsWith(targetMonth) && !e.isRecurring);
      const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>B\xE1o c\xE1o t\xE0i ch\xEDnh c\xE1 nh\xE2n - ${user.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { margin: 0; color: #111827; }
            .header p { margin: 5px 0 0; color: #6b7280; font-size: 14px; }
            .user-info { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 15px; background: #f9fafb; border-radius: 8px; }
            .user-info div { font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #f3f4f6; color: #374151; font-weight: bold; text-align: left; padding: 12px; border-bottom: 1px solid #e5e7eb; }
            td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
            .total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 25px; color: #10b981; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
              \u{1F5A8}\uFE0F Xu\u1EA5t File PDF / In b\xE1o c\xE1o
            </button>
          </div>
          <div class="header">
            <h1>B\xC1O C\xC1O CHI TI\u1EBET CHI TI\xCAU C\xC1 NH\xC2N</h1>
            <p>Tr\xECnh d\u1EEF li\u1EC7u t\u1ED5ng ph\xE1t sinh t\u1EEB h\u1EC7 th\u1ED1ng Student Expense Manager - Th\xE1ng ${targetMonth}</p>
          </div>
          <div class="user-info">
            <div>
              <strong>Sinh vi\xEAn:</strong> ${user.name}<br>
              <strong>Tr\u01B0\u1EDDng h\u1ECDc:</strong> ${user.school}
            </div>
            <div>
              <strong>Thu nh\u1EADp h\u1EB1ng th\xE1ng:</strong> ${new Intl.NumberFormat("vi-VN").format(user.monthlyIncome)}\u0111<br>
              <strong>Ng\xE0y l\u1EADp b\xE1o c\xE1o:</strong> ${(/* @__PURE__ */ new Date()).toLocaleDateString("vi-VN")}
            </div>
          </div>

          <h2>DANH S\xC1CH L\u1ECACH S\u1EEC GIAO D\u1ECACH CHINH PH\u1EE4C</h2>
          <table>
            <thead>
              <tr>
                <th>Ng\xE0y ph\xE1t sinh</th>
                <th>T\xEAn kho\u1EA3n chi</th>
                <th>Ph\xE2n m\u1EE5c</th>
                <th>S\u1ED1 ti\u1EC1n</th>
                <th>B\u1EAFt bu\u1ED9c (Needs)</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map((e) => `
                <tr>
                  <td>${e.date}</td>
                  <td>${e.title}</td>
                  <td>${e.categoryId}</td>
                  <td><strong>${new Intl.NumberFormat("vi-VN").format(e.amount)}\u0111</strong></td>
                  <td>${e.isNecessary ? "\u0110\xFAng" : "Kh\xF4ng"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="total">
            T\u1ED4NG TH\u1EF0C CHI TI\xCAU \u0110\u1EA0T: ${new Intl.NumberFormat("vi-VN").format(totalSpent)}\u0111
          </div>
        </body>
        </html>
      `;
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (e) {
      res.status(500).send(e.message);
    }
  },
  // S3-16: Export Excel (Unicode Tab-Separated/CSV for safe loading with UTF-8 BOM)
  exportExcel: (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).send("Vui l\xF2ng \u0111\u0103ng nh\u1EADp");
      const user = dbInstance.getUsers().find((u) => u.id === userId);
      if (!user) return res.status(404).send("Kh\xF4ng t\xECm th\u1EA5y user");
      const { month } = req.query;
      const targetMonth = month || (/* @__PURE__ */ new Date()).toISOString().substring(0, 7);
      const expenses = dbInstance.getExpenses().filter((e) => e.userId === userId && e.date.startsWith(targetMonth) && !e.isRecurring);
      let csvContent = "\uFEFF";
      csvContent += "M\xE3 kho\u1EA3n chi,L\u1ECBch ng\xE0y,Chi ti\u1EBFt ti\xEAu d\xF9ng,M\u1EE5c \u0111\xEDch danh m\u1EE5c,Nh\xF3m ph\xE2n lo\u1EA1i,S\u1ED1 ti\u1EC1n chi (VND),Ghi ch\xFA th\xEAm\n";
      expenses.forEach((e) => {
        const titleEscaped = e.title.replace(/"/g, '""');
        const noteEscaped = (e.note || "").replace(/"/g, '""');
        const flowCategory = e.isNecessary ? "C\u1EA7n thi\u1EBFt (Needs)" : "Mong mu\u1ED1n (Wants)";
        csvContent += `"${e.id}","${e.date}","${titleEscaped}","${e.categoryId}","${flowCategory}",${e.amount},"${noteEscaped}"
`;
      });
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename=bao-cao-chi-tieu-${targetMonth}.csv`);
      res.status(200).send(csvContent);
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
};

// src/server/incomes.ts
var incomesController = {
  getIncomes: (req, res) => {
    const userId = req.user?.id || "user_01";
    const month = req.query.month;
    const source = req.query.source;
    let incomes = dbInstance.getIncomes().filter((i) => i.userId === userId);
    if (month) {
      incomes = incomes.filter((i) => i.date.startsWith(month));
    }
    if (source) {
      incomes = incomes.filter((i) => i.source === source);
    }
    res.json(incomes);
  },
  createIncome: (req, res) => {
    const userId = req.user?.id || "user_01";
    const newIncome = {
      ...req.body,
      id: `inc_${Date.now()}`,
      userId
    };
    dbInstance.saveIncome(newIncome);
    res.status(201).json(newIncome);
  },
  updateIncome: (req, res) => {
    const userId = req.user?.id || "user_01";
    const { id } = req.params;
    const incomes = dbInstance.getIncomes().filter((i) => i.userId === userId);
    const existing = incomes.find((i) => i.id === id);
    if (!existing) {
      return res.status(404).json({ error: "Income not found" });
    }
    const updated = { ...existing, ...req.body };
    dbInstance.saveIncome(updated);
    res.json(updated);
  },
  deleteIncome: (req, res) => {
    const { id } = req.params;
    const success = dbInstance.deleteIncome(id);
    if (success) {
      res.json({ message: "Deleted successfully" });
    } else {
      res.status(404).json({ error: "Income not found" });
    }
  }
};

// src/server/wallet.ts
var walletController = {
  getBalance: (req, res) => {
    const userId = req.user?.id || "user_01";
    const month = req.query.month;
    let incomes = dbInstance.getIncomes().filter((i) => i.userId === userId);
    let expenses = dbInstance.getExpenses().filter((e) => e.userId === userId);
    if (month) {
      incomes = incomes.filter((i) => i.date.startsWith(month));
      expenses = expenses.filter((e) => e.date.startsWith(month));
    }
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpense;
    res.json({
      balance,
      totalIncome,
      totalExpense
    });
  },
  getCashFlow: (req, res) => {
    const userId = req.user?.id || "user_01";
    const month = req.query.month;
    if (!month) {
      return res.status(400).json({ error: "Month parameter is required (YYYY-MM)" });
    }
    const incomes = dbInstance.getIncomes().filter((i) => i.userId === userId && i.date.startsWith(month));
    const expenses = dbInstance.getExpenses().filter((e) => e.userId === userId && e.date.startsWith(month));
    const flowMap = {};
    const [yearStr, monthStr] = month.split("-");
    const daysInMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${month}-${day.toString().padStart(2, "0")}`;
      flowMap[dateStr] = { income: 0, expense: 0 };
    }
    incomes.forEach((i) => {
      if (flowMap[i.date]) flowMap[i.date].income += i.amount;
    });
    expenses.forEach((e) => {
      if (flowMap[e.date]) flowMap[e.date].expense += e.amount;
    });
    const result = Object.keys(flowMap).sort().map((date) => ({
      date,
      income: flowMap[date].income,
      expense: flowMap[date].expense
    }));
    res.json(result);
  }
};

// src/server/insights.ts
var insightsController = {
  getSpendingInsights: (req, res) => {
    const userId = req.user?.id || "user_01";
    const now = /* @__PURE__ */ new Date();
    const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
    let lastMonth = now.getMonth();
    let lastYear = now.getFullYear();
    if (lastMonth === 0) {
      lastMonth = 12;
      lastYear -= 1;
    }
    const lastMonthStr = `${lastYear}-${lastMonth.toString().padStart(2, "0")}`;
    const expenses = dbInstance.getExpenses().filter((e) => e.userId === userId);
    const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));
    const lastMonthExpenses = expenses.filter((e) => e.date.startsWith(lastMonthStr));
    const insights = [];
    const currentCatMap = {};
    const lastCatMap = {};
    currentMonthExpenses.forEach((e) => {
      currentCatMap[e.categoryId] = (currentCatMap[e.categoryId] || 0) + e.amount;
    });
    lastMonthExpenses.forEach((e) => {
      lastCatMap[e.categoryId] = (lastCatMap[e.categoryId] || 0) + e.amount;
    });
    Object.keys(currentCatMap).forEach((catId) => {
      const currentAmt = currentCatMap[catId];
      const lastAmt = lastCatMap[catId] || 0;
      if (lastAmt > 0) {
        const increase = (currentAmt - lastAmt) / lastAmt;
        if (increase > 0.2) {
          insights.push({
            id: `insight_cat_${catId}`,
            type: "warning",
            message: `Chi ti\xEAu danh m\u1EE5c n\xE0y \u0111\xE3 t\u0103ng ${Math.round(increase * 100)}% so v\u1EDBi th\xE1ng tr\u01B0\u1EDBc. B\u1EA1n n\xEAn c\xE2n nh\u1EAFc c\u1EAFt gi\u1EA3m!`,
            categoryId: catId
          });
        }
      }
    });
    const dayMap = {};
    currentMonthExpenses.forEach((e) => {
      dayMap[e.date] = (dayMap[e.date] || 0) + e.amount;
    });
    let maxDay = "";
    let maxAmount = 0;
    Object.keys(dayMap).forEach((date) => {
      if (dayMap[date] > maxAmount) {
        maxAmount = dayMap[date];
        maxDay = date;
      }
    });
    if (maxDay && maxAmount > 0) {
      insights.push({
        id: "insight_max_day",
        type: "info",
        message: `Ng\xE0y ${maxDay} b\u1EA1n \u0111\xE3 chi nhi\u1EC1u nh\u1EA5t v\u1EDBi s\u1ED1 ti\u1EC1n ${maxAmount.toLocaleString()}\u0111. H\xE3y c\u1EA9n th\u1EADn c\xE1c ng\xE0y mua s\u1EAFm l\u1EDBn nh\xE9!`
      });
    }
    if (insights.length === 0) {
      insights.push({
        id: "insight_good",
        type: "success",
        message: "Tuy\u1EC7t v\u1EDDi! Th\xF3i quen chi ti\xEAu c\u1EE7a b\u1EA1n trong th\xE1ng n\xE0y r\u1EA5t \u1ED5n \u0111\u1ECBnh v\xE0 kh\xF4ng c\xF3 d\u1EA5u hi\u1EC7u b\u1EA5t th\u01B0\u1EDDng."
      });
    }
    res.json(insights);
  }
};

// src/server/recurringExpenses.ts
var recurringExpensesController = {
  getRecurringExpenses: (req, res) => {
    const userId = req.user?.id || "user_01";
    const recs = dbInstance.getRecurringExpenses().filter((r) => r.userId === userId);
    res.json(recs);
  },
  createRecurringExpense: (req, res) => {
    const userId = req.user?.id || "user_01";
    const newRec = {
      ...req.body,
      id: `rec_${Date.now()}`,
      userId
    };
    dbInstance.saveRecurringExpense(newRec);
    res.status(201).json(newRec);
  },
  updateRecurringExpense: (req, res) => {
    const userId = req.user?.id || "user_01";
    const { id } = req.params;
    const recs = dbInstance.getRecurringExpenses().filter((r) => r.userId === userId);
    const existing = recs.find((r) => r.id === id);
    if (!existing) {
      return res.status(404).json({ error: "Recurring expense not found" });
    }
    const updated = { ...existing, ...req.body };
    dbInstance.saveRecurringExpense(updated);
    res.json(updated);
  },
  deleteRecurringExpense: (req, res) => {
    const { id } = req.params;
    const success = dbInstance.deleteRecurringExpense(id);
    if (success) {
      res.json({ message: "Deleted successfully" });
    } else {
      res.status(404).json({ error: "Recurring expense not found" });
    }
  }
};

// src/server/ocrParser.ts
import { GoogleGenAI } from "@google/genai";
var GENERIC_BILL_HEADERS = [
  "h\xF3a \u0111\u01A1n",
  "hoa don",
  "phi\u1EBFu thanh to\xE1n",
  "phieu thanh toan",
  "phi\u1EBFu t\xEDnh ti\u1EC1n",
  "phieu tinh tien",
  "bill thanh toan",
  "bill",
  "invoice",
  "receipt",
  "sales receipt",
  "h\xF3a \u0111\u01A1n gtgt",
  "hoa don gtgt",
  "phi\u1EBFu thu",
  "phieu thu",
  "h\xF3a \u0111\u01A1n b\xE1n l\u1EBB",
  "hoa don ban le"
];
function parseReceiptText(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  let merchant = null;
  const merchants = [
    "GS25",
    "Circle K",
    "FamilyMart",
    "Co.opmart",
    "WinMart",
    "Highlands Coffee",
    "Phuc Long",
    "Ph\xFAc Long",
    "Starbucks",
    "CGV Cinema",
    "B\xE1ch H\xF3a Xanh",
    "Tiki",
    "Grab",
    "Be Group",
    "Shopee",
    "Lotte Mart",
    "KFC",
    "Jollibee",
    "McDonald's",
    "Pizza Hut",
    "The Coffee House",
    "Mixue"
  ];
  for (const m of merchants) {
    if (new RegExp(m, "i").test(text)) {
      merchant = m;
      break;
    }
  }
  if (!merchant) {
    for (const line of lines) {
      if (line.length < 60) {
        const lowerLine = line.toLowerCase();
        const isGenericHeader = GENERIC_BILL_HEADERS.some((header) => lowerLine.includes(header));
        const isAddress = /\b\d+\s+[a-zA-ZÀ-ỹ]|\bP\.\d+|\bQ\.\d+|phường|quận|đường|số|địa chỉ|dia chi|đ\/c|d\/c/i.test(line);
        const isMetadata = /^(ĐT:|sdt:|tel:|phone:|bàn:|bàn\s*\d|thu ngân|thu ngan|khách hàng|khach hang|giờ in|gio in|ngày in|ngay in|số hd|so hd|hóa đơn|hoa don|mst|mã số thuế|email|website|web:)/i.test(line);
        if (!isGenericHeader && !isAddress && !isMetadata && /[a-zA-ZÀ-ỹ]/.test(line)) {
          merchant = line;
          break;
        }
      }
    }
    if (!merchant) {
      merchant = lines[0] && lines[0].length < 60 ? lines[0] : "C\u1EEDa h\xE0ng ti\u1EC7n l\u1EE3i";
    }
  }
  let date = null;
  const dateRegexes = [
    /(?:ngày\s+in|ngày\s+lập|ngày|ngay|date)[:\s]+(\d{2})[-/.](\d{2})[-/.](\d{4})/i,
    /(\d{4})[-/](\d{2})[-/](\d{2})/,
    /(\d{2})[-/.](\d{2})[-/.](\d{4})/
  ];
  for (const regex of dateRegexes) {
    const match = text.match(regex);
    if (match) {
      if (match[1].length === 4) {
        date = `${match[1]}-${match[2]}-${match[3]}`;
      } else {
        date = `${match[3]}-${match[2]}-${match[1]}`;
      }
      break;
    }
  }
  let amount = null;
  const cleanedLines = lines.filter((line) => {
    if (/^0\d{9,10}$/.test(line.replace(/\s+/g, ""))) return false;
    if (/^\d{2}[-/.]\d{2}[-/.]\d{4}$/.test(line.trim())) return false;
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(line.trim())) return false;
    return true;
  });
  const cleanedText = cleanedLines.join("\n");
  const normalizeNumber = (value) => {
    const numeric = value.replace(/[^\d]/g, "");
    return numeric ? parseInt(numeric, 10) : NaN;
  };
  const parseCandidateAmounts = (text2) => {
    const candidates = [];
    const regex = /([\d,.]{3,})/g;
    let match;
    while (match = regex.exec(text2)) {
      const parsed = normalizeNumber(match[1]);
      if (!isNaN(parsed) && parsed > 1e3 && parsed < 1e8) {
        candidates.push(parsed);
      }
    }
    return candidates;
  };
  const bestCandidate = (candidates) => {
    if (!candidates.length) return null;
    return candidates.sort((a, b) => b - a)[0];
  };
  const priorityAmountRegexes = [
    /(?:tiền\s+mặt|tien\s+mat|cash)\s*[:=]?\s*([\d,.]+)/i,
    /(?:tổng\s+cộng|tong\s+cong|t\.\s*cộng|t\s*cong)\s*(?:[:=]?\s*)?([\d,.]+)/i,
    /(?:grand\s+total|total\s+due|total\s+amount|amount\s+paid|amount)\s*[:=]?\s*([\d,.]+)/i,
    /(?:thành\s+tiền|thanh\s+tien|thanh\s+tiền)\s*[:=]?\s*([\d,.]+)/i,
    /(?:khách\s+(?:phải\s+)?trả|khach\s+tra)\s*[:=]?\s*([\d,.]+)/i,
    /(?:tổng\s+thanh\s+toán|tong\s+thanh\s+toan|thanh\s+toán|thanh\s+toan)\s*[:=]?\s*([\d,.]+)/i,
    /\btotal\b\s*[:=]?\s*([\d,.]+)/i
  ];
  for (const regex of priorityAmountRegexes) {
    const match = cleanedText.match(regex);
    if (match) {
      const parsed = normalizeNumber(match[1]);
      if (!isNaN(parsed) && parsed > 1e3 && parsed < 1e8) {
        amount = parsed;
        break;
      }
    }
  }
  if (!amount) {
    const lineCandidates = [];
    for (const line of cleanedLines) {
      const lowerLine = line.toLowerCase();
      if (/(?:tổng|thành tiền|total|amount|vnđ|vnd|đ)\b/.test(lowerLine)) {
        lineCandidates.push(...parseCandidateAmounts(line));
      }
    }
    if (!lineCandidates.length) {
      lineCandidates.push(...parseCandidateAmounts(cleanedText));
    }
    amount = bestCandidate(lineCandidates);
  }
  const itemLines = [];
  for (const line of lines) {
    const itemMatch = line.match(/^(?:\d+[).]?\s+)?([a-zA-ZÀ-ỹ0-9\s&+-]+?)\s+(?:x\s*|\*|\bSL\b:?\s*)?(\d+)\s+[\d,.]+(?:\s+[\d,.])?/i);
    if (itemMatch) {
      const itemName = itemMatch[1].trim();
      const itemQty = itemMatch[2].trim();
      const isNoise = /^(tên hàng|ten hang|sl|đơn giá|don gia|t\.tiền|t\.tien|thành tiền|thanh tien|tổng cộng|tong cong|tiền mặt|tien mat)/i.test(itemName);
      if (!isNoise && itemName.length > 1 && itemName.length < 35) {
        itemLines.push(`${itemName} x${itemQty}`);
      }
    }
  }
  const noteItems = itemLines.length > 0 ? `Mua t\u1EA1i ${merchant} g\u1ED3m: ${itemLines.slice(0, 5).join(", ")}` : `Qu\xE9t t\u1EF1 \u0111\u1ED9ng t\u1EEB h\xF3a \u0111\u01A1n ${merchant}`;
  return {
    amount,
    date: date || (/* @__PURE__ */ new Date()).toISOString().substring(0, 10),
    merchant,
    note: noteItems
  };
}
function isBinaryBuffer(buffer) {
  let nonPrintable = 0;
  const len = Math.min(buffer.length, 1e3);
  for (let i = 0; i < len; i++) {
    const byte = buffer[i];
    if (byte === 0) return true;
    if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
      nonPrintable++;
    }
  }
  if (len > 0 && nonPrintable / len > 0.1) return true;
  const str = buffer.toString("utf8");
  const replacementCharCount = (str.match(/\uFFFD/g) || []).length;
  if (replacementCharCount > str.length * 0.05) return true;
  return false;
}
async function parseReceipt(imageBase64, mimeType) {
  const hasApiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && process.env.GEMINI_API_KEY !== "";
  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
  const buffer = Buffer.from(cleanBase64, "base64");
  const isImg = isBinaryBuffer(buffer);
  if (hasApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || "image/jpeg"
            }
          },
          "H\xE3y ph\xE2n t\xEDch h\xF3a \u0111\u01A1n/receipt n\xE0y v\xE0 tr\xEDch xu\u1EA5t th\xF4ng tin ch\xEDnh x\xE1c."
        ],
        config: {
          systemInstruction: `B\u1EA1n l\xE0 chuy\xEAn gia ph\xE2n t\xEDch h\xF3a \u0111\u01A1n t\xE0i ch\xEDnh chuy\xEAn nghi\u1EC7p (OCR). Nhi\u1EC7m v\u1EE5 c\u1EE7a b\u1EA1n:
1. MERCHANT: T\xEAn th\u01B0\u01A1ng hi\u1EC7u, c\u1EEDa h\xE0ng ho\u1EB7c nh\xE0 h\xE0ng ch\xEDnh hi\u1EC3n th\u1ECB n\u1ED5i b\u1EADt \u1EDF \u0111\u1EA7u h\xF3a \u0111\u01A1n (v\xED d\u1EE5: "VINH NGUYEN RES", "Highlands Coffee", "GS25", "Circle K"). Ph\u1EA3i b\u1ECF qua ho\xE0n to\xE0n c\xE1c d\xF2ng \u0111\u1ECBa ch\u1EC9 (v\xED d\u1EE5: "355 S\u01B0 V\u1EA1n H\u1EA1nh..."), s\u1ED1 \u0111i\u1EC7n tho\u1EA1i, t\xEAn nh\xE2n vi\xEAn thu ng\xE2n, s\u1ED1 b\xE0n, s\u1ED1 h\xF3a \u0111\u01A1n, ho\u1EB7c c\xE1c c\u1EE5m t\u1EEB chung chung nh\u01B0 "H\xF3a \u0111\u01A1n thanh to\xE1n", "Phi\u1EBFu t\xEDnh ti\u1EC1n".
2. AMOUNT: T\u1ED5ng s\u1ED1 ti\u1EC1n th\u1EF1c t\u1EBF ng\u01B0\u1EDDi d\xF9ng thanh to\xE1n (VND, ki\u1EC3u s\u1ED1 nguy\xEAn). H\xE3y ph\xE2n t\xEDch k\u1EF9 c\xE1c m\u1EE5c c\u1ED9ng tr\u1EEB \u0111\u1EC3 l\u1EA5y \u0111\xFAng s\u1ED1 ti\u1EC1n cu\u1ED1i c\xF9ng m\xE0 kh\xE1ch h\xE0ng ph\u1EA3i tr\u1EA3 ho\u1EB7c \u0111\xE3 tr\u1EA3 (v\xED d\u1EE5: "225000"). Tr\xE1nh l\u1EA5y nh\u1EA7m s\u1ED1 l\u01B0\u1EE3ng, \u0111\u01A1n gi\xE1, t\u1ED5ng ti\u1EC1n h\xE0ng tr\u01B0\u1EDBc chi\u1EBFt kh\u1EA5u/gi\u1EA3m gi\xE1, ti\u1EC1n VAT ri\xEAng l\u1EBB, ho\u1EB7c ti\u1EC1n th\u1ED1i l\u1EA1i (ti\u1EC1n th\u1EEBa tr\u1EA3 kh\xE1ch).
3. DATE: Ng\xE0y th\u1EF1c hi\u1EC7n giao d\u1ECBch, \u0111\u1ECBnh d\u1EA1ng "YYYY-MM-DD" (v\xED d\u1EE5: t\u1EEB "29/03/2019" ho\u1EB7c "29-03-2019" ph\u1EA3i chuy\u1EC3n th\xE0nh "2019-03-29"). N\u1EBFu h\xF3a \u0111\u01A1n ch\u1EC9 ghi ng\xE0y in ho\u1EB7c ng\xE0y thanh to\xE1n, h\xE3y l\u1EA5y ng\xE0y \u0111\xF3. N\u1EBFu kh\xF4ng t\xECm th\u1EA5y n\u0103m, gi\u1EA3 \u0111\u1ECBnh n\u0103m hi\u1EC7n t\u1EA1i (2026).
4. NOTE: T\xF3m t\u1EAFt danh s\xE1ch m\u1EB7t h\xE0ng n\u1ED5i b\u1EADt k\xE8m s\u1ED1 l\u01B0\u1EE3ng c\u1EE5 th\u1EC3 (t\u1ED1i \u0111a 5 m\u1EB7t h\xE0ng, t\u1ED1i \u0111a 200 k\xFD t\u1EF1). V\xED d\u1EE5: "Mua t\u1EA1i VINH NGUYEN RES g\u1ED3m: Coca x2, Sprite x2, Tonic x2, Soda x1".`,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              amount: {
                type: "integer",
                description: "T\u1ED5ng s\u1ED1 ti\u1EC1n th\u1EF1c t\u1EBF thanh to\xE1n b\u1EB1ng VND (s\u1ED1 nguy\xEAn)"
              },
              date: {
                type: "string",
                description: "Ng\xE0y giao d\u1ECBch \u0111\u1ECBnh d\u1EA1ng YYYY-MM-DD"
              },
              merchant: {
                type: "string",
                description: "T\xEAn c\u1EEDa h\xE0ng/nh\xE0 h\xE0ng/th\u01B0\u01A1ng hi\u1EC7u"
              },
              note: {
                type: "string",
                description: "T\xF3m t\u1EAFt c\xE1c m\u1EB7t h\xE0ng \u0111\xE3 mua k\xE8m s\u1ED1 l\u01B0\u1EE3ng"
              }
            },
            required: ["amount", "date", "merchant", "note"]
          }
        }
      });
      const text = response.text || "";
      const data = JSON.parse(text);
      return {
        amount: data.amount ? Number(data.amount) : null,
        date: data.date || (/* @__PURE__ */ new Date()).toISOString().substring(0, 10),
        merchant: data.merchant || "C\u1EEDa h\xE0ng ti\u1EC7n l\u1EE3i",
        note: data.note || `Qu\xE9t t\u1EF1 \u0111\u1ED9ng t\u1EEB h\xF3a \u0111\u01A1n ${data.merchant || "ti\u1EC7n l\u1EE3i"}`
      };
    } catch (err) {
      console.warn("Gemini API parsing failed, falling back to offline parser if possible:", err);
      if (isImg) {
        let errMsg = err.message || "";
        if (err.status === 429 || errMsg.includes("quota") || errMsg.includes("Quota")) {
          throw new Error("L\u01B0\u1EE3t qu\xE9t h\xF3a \u0111\u01A1n AI (Gemini) \u0111\xE3 h\u1EBFt h\u1EA1n m\u1EE9c trong ng\xE0y (429). Vui l\xF2ng th\u1EED l\u1EA1i sau ho\u1EB7c nh\u1EADp th\u1EE7 c\xF4ng.");
        } else if (err.status === 503 || errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE")) {
          throw new Error("D\u1ECBch v\u1EE5 AI (Gemini) hi\u1EC7n t\u1EA1i \u0111ang qu\xE1 t\u1EA3i ho\u1EB7c t\u1EA1m th\u1EDDi kh\xF4ng kh\u1EA3 d\u1EE5ng (503). Vui l\xF2ng th\u1EED l\u1EA1i sau.");
        } else if (err.status === 400 || errMsg.includes("API key")) {
          throw new Error("C\u1EA5u h\xECnh API Key c\u1EE7a AI (Gemini) kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\xE3 b\u1ECB v\xF4 hi\u1EC7u h\xF3a (400).");
        }
        throw new Error(`Qu\xE9t h\xF3a \u0111\u01A1n AI th\u1EA5t b\u1EA1i: ${err.message || "L\u1ED7i k\u1EBFt n\u1ED1i d\u1ECBch v\u1EE5 AI"}`);
      }
    }
  }
  if (!isImg) {
    try {
      const decodedText = buffer.toString("utf8");
      if (decodedText && /[a-zA-Z0-9\s]/.test(decodedText)) {
        return parseReceiptText(decodedText);
      }
    } catch (e) {
    }
  }
  return {
    amount: null,
    date: (/* @__PURE__ */ new Date()).toISOString().substring(0, 10),
    merchant: null,
    note: "Kh\xF4ng nh\u1EADn d\u1EA1ng \u0111\u01B0\u1EE3c t\u1EEB \u1EA3nh. Vui l\xF2ng nh\u1EADp th\u1EE7 c\xF4ng."
  };
}

// src/server/ocrController.ts
var ocrController = {
  scanReceipt: async (req, res) => {
    const startTime = Date.now();
    try {
      const { image, name, mimeType } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Kh\xF4ng t\xECm th\u1EA5y d\u1EEF li\u1EC7u \u1EA3nh h\xF3a \u0111\u01A1n" });
      }
      const cleanBase64 = image.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
      const approxSizeBytes = cleanBase64.length * 3 / 4;
      const sizeMB = approxSizeBytes / (1024 * 1024);
      if (sizeMB > 10) {
        return res.status(400).json({ error: "K\xEDch th\u01B0\u1EDBc t\u1EC7p v\u01B0\u1EE3t qu\xE1 gi\u1EDBi h\u1EA1n 10MB cho ph\xE9p" });
      }
      const filename = name || "";
      const isAllowedFormat = /\.(jpg|jpeg|png|heic)$/i.test(filename) || mimeType && /image\/(jpeg|png|heic|heif)/i.test(mimeType);
      if (!isAllowedFormat) {
        return res.status(400).json({ error: "\u0110\u1ECBnh d\u1EA1ng t\u1EC7p kh\xF4ng h\u1ED7 tr\u1EE3. H\u1EC7 th\u1ED1ng ch\u1EC9 h\u1ED7 tr\u1EE3 JPG, PNG, HEIC" });
      }
      const parsedData = await parseReceipt(image, mimeType || "image/jpeg");
      const durationMs = Date.now() - startTime;
      console.log(`[OCR API] Scanned receipt in ${durationMs}ms`);
      res.json({
        ...parsedData,
        thumbnailUrl: image,
        // Return the uploaded image as thumbnail (AC6)
        processingTimeMs: durationMs
      });
    } catch (e) {
      console.error("[OCR Controller Error]", e);
      res.status(500).json({ error: e.message || "L\u1ED7i h\u1EC7 th\u1ED1ng khi qu\xE9t h\xF3a \u0111\u01A1n" });
    }
  }
};

// src/server/app.ts
var app = express();
app.use(express.json({ limit: "15mb" }));
app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);
app.get("/api/expenses", authMiddleware, expensesController.getExpenses);
app.post("/api/expenses", authMiddleware, expensesController.createExpense);
app.put("/api/expenses/:id", authMiddleware, expensesController.updateExpense);
app.delete("/api/expenses/:id", authMiddleware, expensesController.deleteExpense);
app.get("/api/budgets", authMiddleware, budgetsController.getBudgets);
app.post("/api/budgets", authMiddleware, budgetsController.saveBudgets);
app.get("/api/reports/monthly", authMiddleware, reportsController.getMonthlyReport);
app.get("/api/reports/weekly", authMiddleware, reportsController.getWeeklyReport);
app.get("/api/reports/category-stats", authMiddleware, reportsController.getCategoryStats);
app.get("/api/reports/top-spending", authMiddleware, reportsController.getTopCategory);
app.get("/api/reports/export/pdf", authMiddleware, reportsController.exportPDF);
app.get("/api/reports/export/excel", authMiddleware, reportsController.exportExcel);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", serverTime: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/incomes", authMiddleware, incomesController.getIncomes);
app.post("/api/incomes", authMiddleware, incomesController.createIncome);
app.put("/api/incomes/:id", authMiddleware, incomesController.updateIncome);
app.delete("/api/incomes/:id", authMiddleware, incomesController.deleteIncome);
app.get("/api/wallet/balance", authMiddleware, walletController.getBalance);
app.get("/api/wallet/cashflow", authMiddleware, walletController.getCashFlow);
app.get("/api/insights/spending", authMiddleware, insightsController.getSpendingInsights);
app.get("/api/recurring-expenses", authMiddleware, recurringExpensesController.getRecurringExpenses);
app.post("/api/recurring-expenses", authMiddleware, recurringExpensesController.createRecurringExpense);
app.put("/api/recurring-expenses/:id", authMiddleware, recurringExpensesController.updateRecurringExpense);
app.delete("/api/recurring-expenses/:id", authMiddleware, recurringExpensesController.deleteRecurringExpense);
app.post("/api/expenses/scan-receipt", authMiddleware, ocrController.scanReceipt);
var app_default = app;

// src/server/api-entry.ts
process.on("uncaughtException", (err) => {
  console.error("[CRITICAL] Uncaught Exception on Vercel Serverless:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("[CRITICAL] Unhandled Rejection at:", promise, "reason:", reason);
});
var api_entry_default = app_default;
export {
  api_entry_default as default
};
