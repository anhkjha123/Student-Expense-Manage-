import { describe, it, expect } from 'vitest';
import { parseReceiptText, parseReceipt } from '../src/server/ocrParser';

describe('OCR Receipt Parser - S5-08 Unit Tests (10+ Invoice Samples)', () => {
  
  // Sample 1: GS25
  it('phân tích chính xác mẫu hóa đơn GS25', () => {
    const text = 'GS25 CONVENIENCE STORE\nNGAY: 2026-06-01\nTỔNG THANH TOÁN: 45,000 VND\nNote: Com tru B Bach Khoa';
    const res = parseReceiptText(text);
    expect(res.merchant).toBe('GS25');
    expect(res.amount).toBe(45000);
    expect(res.date).toBe('2026-06-01');
  });

  // Sample 2: Phuc Long
  it('phân tích chính xác mẫu hóa đơn Phúc Long', () => {
    const text = 'PHÚC LONG COFFEE & TEA\nDATE: 2026-05-15\nTOTAL AMOUNT: 125.000đ\nNote: Ca phe hop lop';
    const res = parseReceiptText(text);
    expect(res.merchant?.toLowerCase()).toContain('phúc long');
    expect(res.amount).toBe(125000);
    expect(res.date).toBe('2026-05-15');
  });

  // Sample 3: Circle K
  it('phân tích chính xác mẫu hóa đơn Circle K', () => {
    const text = 'CIRCLE K SUPERMARKET\nNgay: 2026-06-05\nThanh tien: 80000 d';
    const res = parseReceiptText(text);
    expect(res.merchant).toBe('Circle K');
    expect(res.amount).toBe(80000);
    expect(res.date).toBe('2026-06-05');
  });

  // Sample 4: CGV Cinema
  it('phân tích chính xác mẫu hóa đơn CGV', () => {
    const text = 'CGV CINEMA VINCOM\nDATE: 2026-05-20\nTOTAL: 150000 VND\nVe xem phim';
    const res = parseReceiptText(text);
    expect(res.merchant).toBe('CGV Cinema');
    expect(res.amount).toBe(150000);
    expect(res.date).toBe('2026-05-20');
  });

  // Sample 5: Co.opmart
  it('phân tích chính xác mẫu hóa đơn Co.opmart', () => {
    const text = 'CO.OPMART SUPERMARKET\nNgay: 2026-06-08\nTong cong: 450.000\nMua thuc pham sinh hoat';
    const res = parseReceiptText(text);
    expect(res.merchant).toBe('Co.opmart');
    expect(res.amount).toBe(450000);
    expect(res.date).toBe('2026-06-08');
  });

  // Sample 6: WinMart
  it('phân tích chính xác mẫu hóa đơn WinMart', () => {
    const text = 'WINMART STORE HUST\nDate: 2026-06-02\nCash: 95.000đ\nMua banh mi va mi goi';
    const res = parseReceiptText(text);
    expect(res.merchant).toBe('WinMart');
    expect(res.amount).toBe(95000);
    expect(res.date).toBe('2026-06-02');
  });

  // Sample 7: Highlands Coffee
  it('phân tích chính xác mẫu hóa đơn Highlands Coffee', () => {
    const text = 'HIGHLANDS COFFEE\nDate: 2026-06-09\nAmount: 55000\nFreeze tra xanh size L';
    const res = parseReceiptText(text);
    expect(res.merchant).toBe('Highlands Coffee');
    expect(res.amount).toBe(55000);
    expect(res.date).toBe('2026-06-09');
  });

  // Sample 8: Grab
  it('phân tích chính xác mẫu hóa đơn Grab ride', () => {
    const text = 'GRAB BIKE TRIP\nDate: 2026-06-03\nTotal: 25.000\nDi hoc quan 5';
    const res = parseReceiptText(text);
    expect(res.merchant).toBe('Grab');
    expect(res.amount).toBe(25000);
    expect(res.date).toBe('2026-06-03');
  });

  // Sample 9: Shopee
  it('phân tích chính xác mẫu hóa đơn Shopee', () => {
    const text = 'SHOPEE VIETNAM\nNgay: 2026-06-07\nTong thanh toan: 350.000đ\nMua ao thun';
    const res = parseReceiptText(text);
    expect(res.merchant).toBe('Shopee');
    expect(res.amount).toBe(350000);
    expect(res.date).toBe('2026-06-07');
  });

  // Sample 10: KFC
  it('phân tích chính xác mẫu hóa đơn KFC', () => {
    const text = 'KFC FAST FOOD\nDATE: 2026-05-12\nTOTAL: 110.000 VND\nGia dinh combo';
    const res = parseReceiptText(text);
    expect(res.merchant).toBe('KFC');
    expect(res.amount).toBe(110000);
    expect(res.date).toBe('2026-05-12');
  });

  // Sample 11: Starbucks (Extra check)
  it('phân tích chính xác mẫu hóa đơn Starbucks', () => {
    const text = 'STARBUCKS COFFEE\nDATE: 2026-06-10\nTOTAL AMOUNT: 90000';
    const res = parseReceiptText(text);
    expect(res.merchant).toBe('Starbucks');
    expect(res.amount).toBe(90000);
    expect(res.date).toBe('2026-06-10');
  });

  // Test parseReceipt with Base64 encoding of text
  it('phân tích tệp text được mã hóa base64 thông qua hàm parseReceipt', async () => {
    const text = 'GS25 CONVENIENCE STORE\nNGAY: 2026-06-01\nTỔNG THANH TOÁN: 45,000 VND';
    const base64 = Buffer.from(text).toString('base64');
    const res = await parseReceipt(base64, 'image/png');
    expect(res.merchant).toBe('GS25');
    expect(res.amount).toBe(45000);
    expect(res.date).toBe('2026-06-01');
  });
});
