import { describe, it, expect } from 'vitest';
import { calculateEqualSplits, calculateDebts } from '../src/server/groups';
import { GroupMember, GroupExpense } from '../src/types';

describe('Group splitting & rounding calculation logic', () => {
  const members = [
    { userId: 'user_01', email: 'sinhvien@hust.edu.vn' },
    { userId: 'user_02', email: 'user2@hust.edu.vn' },
    { userId: 'user_03', email: 'user3@hust.edu.vn' }
  ];

  it('chia đều 10.000đ cho 3 người, làm tròn về 1.000đ, phần dư tính cho người đầu tiên (AC3)', () => {
    // 10000 / 3 = 3333.33 => làm tròn thành 3000
    // phần dư = 10000 - (3000 * 2) = 4000 cho người đầu tiên
    const splits = calculateEqualSplits(10000, members);
    
    expect(splits).toHaveLength(3);
    expect(splits[0].userId).toBe('user_01');
    expect(splits[0].amount).toBe(4000);
    expect(splits[1].userId).toBe('user_02');
    expect(splits[1].amount).toBe(3000);
    expect(splits[2].userId).toBe('user_03');
    expect(splits[2].amount).toBe(3000);

    const totalCalculated = splits.reduce((sum, s) => sum + s.amount, 0);
    expect(totalCalculated).toBe(10000);
  });

  it('chia đều 11.000đ cho 3 người, làm tròn về 1.000đ, phần dư tính cho người đầu tiên (AC3)', () => {
    // 11000 / 3 = 3666.67 => làm tròn thành 4000
    // phần dư = 11000 - (4000 * 2) = 3000 cho người đầu tiên
    const splits = calculateEqualSplits(11000, members);
    
    expect(splits).toHaveLength(3);
    expect(splits[0].userId).toBe('user_01');
    expect(splits[0].amount).toBe(3000);
    expect(splits[1].userId).toBe('user_02');
    expect(splits[1].amount).toBe(4000);
    expect(splits[2].userId).toBe('user_03');
    expect(splits[2].amount).toBe(4000);

    const totalCalculated = splits.reduce((sum, s) => sum + s.amount, 0);
    expect(totalCalculated).toBe(11000);
  });

  it('tính toán chính xác các khoản nợ chéo trong nhóm (calculateDebts)', () => {
    const groupMembers: GroupMember[] = [
      { id: 'm1', groupId: 'g1', userId: 'user_01', name: 'Đức', email: 'sinhvien@hust.edu.vn', joinedAt: '2026-06-01' },
      { id: 'm2', groupId: 'g1', userId: 'user_02', name: 'Tuấn', email: 'user2@hust.edu.vn', joinedAt: '2026-06-01' },
      { id: 'm3', groupId: 'g1', userId: 'user_03', name: 'Lan', email: 'user3@hust.edu.vn', joinedAt: '2026-06-01' }
    ];

    // Khoản chi 1: Đức trả 90,000đ, chia đều cho cả 3 (mỗi người nợ 30,000đ)
    const expenses: GroupExpense[] = [
      {
        id: 'e1',
        groupId: 'g1',
        paidBy: 'user_01',
        paidByName: 'Đức',
        amount: 90000,
        description: 'Ăn trưa nhóm',
        date: '2026-06-01',
        splitType: 'EQUAL',
        splits: [
          { userId: 'user_01', email: 'sinhvien@hust.edu.vn', amount: 30000 },
          { userId: 'user_02', email: 'user2@hust.edu.vn', amount: 30000 },
          { userId: 'user_03', email: 'user3@hust.edu.vn', amount: 30000 }
        ]
      }
    ];

    let debts = calculateDebts('g1', groupMembers, expenses);
    expect(debts).toHaveLength(2);
    
    // Tuấn nợ Đức 30k
    const tuanDebt = debts.find(d => d.fromUserId === 'user_02' && d.toUserId === 'user_01');
    expect(tuanDebt).toBeDefined();
    expect(tuanDebt?.amount).toBe(30000);

    // Lan nợ Đức 30k
    const lanDebt = debts.find(d => d.fromUserId === 'user_03' && d.toUserId === 'user_01');
    expect(lanDebt).toBeDefined();
    expect(lanDebt?.amount).toBe(30000);

    // Khoản chi 2: Tuấn trả 30,000đ, chỉ chia đều cho Tuấn và Lan (mỗi người nợ 15,000đ)
    expenses.push({
      id: 'e2',
      groupId: 'g1',
      paidBy: 'user_02',
      paidByName: 'Tuấn',
      amount: 30000,
      description: 'Mua nước rửa bát',
      date: '2026-06-02',
      splitType: 'CUSTOM',
      splits: [
        { userId: 'user_02', email: 'user2@hust.edu.vn', amount: 15000 },
        { userId: 'user_03', email: 'user3@hust.edu.vn', amount: 15000 }
      ]
    });

    // Lúc này:
    // Đức: +60,000đ (đã đóng 90k, nợ 30k)
    // Tuấn: -15,000đ (đã đóng 30k, nợ 45k)
    // Lan: -45,000đ (đã đóng 0k, nợ 45k)
    // Nợ mới: Tuấn nợ Đức 15k, Lan nợ Đức 45k
    debts = calculateDebts('g1', groupMembers, expenses);
    expect(debts).toHaveLength(2);

    const tuanDebt2 = debts.find(d => d.fromUserId === 'user_02' && d.toUserId === 'user_01');
    expect(tuanDebt2?.amount).toBe(15000);

    const lanDebt2 = debts.find(d => d.fromUserId === 'user_03' && d.toUserId === 'user_01');
    expect(lanDebt2?.amount).toBe(45000);
  });
});
