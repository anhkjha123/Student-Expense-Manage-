export interface ParsedVoiceCommand {
  amount?: number;
  title?: string;
  categoryId?: string;
}

/**
 * Parses a Vietnamese voice transcript into expense fields.
 * Example inputs:
 * - "ăn trưa 35 nghìn" -> { amount: 35000, title: "Ăn trưa", categoryId: "food" }
 * - "xăng xe 50k" -> { amount: 50000, title: "Xăng xe", categoryId: "transport" }
 * - "tiền trọ 2 triệu" -> { amount: 2000000, title: "Tiền trọ", categoryId: "rent" }
 * - "mua sách giáo trình 120 ngàn" -> { amount: 120000, title: "Sách giáo trình", categoryId: "study" }
 */
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Parses a Vietnamese voice transcript into expense fields.
 * Example inputs:
 * - "ăn trưa 35 nghìn" -> { amount: 35000, title: "Ăn trưa", categoryId: "food" }
 * - "xăng xe 50k" -> { amount: 50000, title: "Xăng xe", categoryId: "transport" }
 * - "tiền trọ 2 triệu" -> { amount: 2000000, title: "Tiền trọ", categoryId: "rent" }
 * - "mua sách giáo trình 120 ngàn" -> { amount: 120000, title: "Sách giáo trình", categoryId: "study" }
 */
export function parseVietnameseVoiceCommand(text: string): ParsedVoiceCommand {
  const normalized = text.toLowerCase().trim();
  
  // 1. Regex to match number and unit: e.g. "35 nghìn", "35.000", "50k", "2 triệu", "120 ngàn"
  // Match digits with dots/commas, optionally followed by multiplier unit
  const numberRegex = /(\d+(?:[\.,\d]*\d)?)\s*(k|nghìn|ngàn|tr|triệu|đồng|đ)?\b/gi;
  
  let amount: number | undefined;
  let parsedText = normalized;
  
  const matches = [...normalized.matchAll(numberRegex)];
  
  if (matches.length > 0) {
    // We take the first match as primary amount
    const match = matches[0];
    const rawNumStr = match[1];
    const unit = match[2] ? match[2].toLowerCase() : '';
    
    let value = 0;
    if (unit === 'tr' || unit === 'triệu' || unit === 'tỷ') {
      const normalizedNum = rawNumStr.replace(/,/g, '.');
      value = parseFloat(normalizedNum);
    } else {
      const normalizedNum = rawNumStr.replace(/[\.,]/g, '');
      value = parseFloat(normalizedNum);
    }
    
    if (unit === 'k') {
      value *= 1000;
    } else if (unit === 'nghìn' || unit === 'ngàn') {
      value *= 1000;
    } else if (unit === 'tr' || unit === 'triệu') {
      value *= 1000000;
    }
    
    // Auto-multiply shorthand numbers less than 1000 (e.g. "ăn trưa 35" -> 35000, "mua sách 120" -> 120000)
    if (value < 1000 && (!unit || unit === 'đ' || unit === 'đồng')) {
      value *= 1000;
    }
    
    amount = value;
    
    // Remove the matched part from the text to get a clean title
    parsedText = normalized.replace(match[0], '').trim();
  }
  
  // Clean up filler words from the title
  let title = parsedText
    .replace(/^(hết|chi|thu|tiền|khoản|mua|thanh toán|cho|một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)\s+/gi, '')
    .trim();
  
  // Capitalize first letter of title
  if (title) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  } else {
    title = 'Chi tiêu bằng giọng nói';
  }
  
  // Map category based on keywords with regex word boundaries to avoid false matching
  let categoryId = 'food'; // Default fallback
  const textToCheck = removeVietnameseTones(title.toLowerCase());
  
  if (/\b(an|uong|com|pho|lau|tra sua|cafe|ca phe|banh|keo|snack|mi|hu tieu|an uong|an trua|an sang|an toi)\b/i.test(textToCheck)) {
    categoryId = 'food';
  } else if (/\b(xang|xe|grab|be|bus|taxi|gui xe|di lai|di chuyen|ve xe)\b/i.test(textToCheck)) {
    categoryId = 'transport';
  } else if (/\b(sach|vo|but|giao trinh|hoc|khoa hoc|hoc phi|thi|tai lieu)\b/i.test(textToCheck)) {
    categoryId = 'study';
  } else if (/\b(phim|xem phim|ve xem phim|choi|game|du lich|hat|karaoke|bong da|the thao|giai tri)\b/i.test(textToCheck)) {
    categoryId = 'entertainment';
  } else if (/\b(ao|quan|giay|shopee|tiki|lazada|mua sam|my pham|sieu thi|quan ao|laptop|may tinh|dien thoai|ipad|phone|thiet bi|computer)\b/i.test(textToCheck)) {
    categoryId = 'shopping';
  } else if (/\b(phong|tro|tien tro|dien|nuoc|wifi|mang|chung cu|nha o)\b/i.test(textToCheck)) {
    categoryId = 'rent';
  }
  
  return { amount, title, categoryId };
}
