import { describe, it, expect } from 'vitest';
import { parseVietnameseVoiceCommand } from '../src/lib/voiceParser';

describe('Voice Command NLP Parser Unit Tests', () => {
  it('phân tích chính xác cụm từ có đơn vị nghìn', () => {
    const res = parseVietnameseVoiceCommand('ăn trưa 35 nghìn');
    expect(res.amount).toBe(35000);
    expect(res.title).toBe('Ăn trưa');
    expect(res.categoryId).toBe('food');
  });

  it('phân tích chính xác cụm từ có đơn vị k', () => {
    const res = parseVietnameseVoiceCommand('xăng xe 50k');
    expect(res.amount).toBe(50000);
    expect(res.title).toBe('Xăng xe');
    expect(res.categoryId).toBe('transport');
  });

  it('phân tích chính xác cụm từ có đơn vị triệu', () => {
    const res = parseVietnameseVoiceCommand('đóng tiền trọ 2 triệu');
    expect(res.amount).toBe(2000000);
    expect(res.title).toBe('Đóng tiền trọ'); // 'đóng tiền' preserved
    expect(res.categoryId).toBe('rent');
  });

  it('phân tích chính xác cụm từ viết tắt ko có đơn vị', () => {
    const res = parseVietnameseVoiceCommand('mua sách 150');
    expect(res.amount).toBe(150000);
    expect(res.title).toBe('Sách');
    expect(res.categoryId).toBe('study');
  });
});
