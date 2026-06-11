export interface ParsedVoiceCommand {
  amount?: number;
  title?: string;
  categoryId?: string;
}

/**
 * Parses a Vietnamese voice transcript into expense fields.
 */
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Expands shorthand numbers like "50k", "2tr" into standard token parts.
 */
function expandToken(token: string): string[] {
  const match = token.match(/^(\d+(?:[\.,\d]*\d)?)(k|nghìn|ngàn|tr|triệu|tỷ|đ|đồng)$/i);
  if (match) {
    return [match[1], match[2]];
  }
  return [token];
}

/**
 * Converts Vietnamese spoken words and numbers into a numeric value.
 */
function parseWordBasedNumber(phrase: string): number | null {
  const cleanPhrase = removeVietnameseTones(phrase.toLowerCase());
  const hasMultiplier = /\b(k|nghin|ngan|trieu|tr|ty)\b/i.test(cleanPhrase);

  const words = phrase.toLowerCase().split(/\s+/).filter(Boolean);
  const expandedWords: string[] = [];
  for (const w of words) {
    expandedWords.push(...expandToken(w));
  }

  const unitMap: Record<string, number> = {
    'khong': 0,
    'mot': 1,
    'hai': 2,
    'ba': 3,
    'bon': 4,
    'tu': 4,
    'nam': 5,
    'lam': 5,
    'nham': 5,
    'sau': 6,
    'bay': 7,
    'tam': 8,
    'chin': 9
  };

  let total = 0;
  let groupValue = 0;
  let tempValue = 0;

  for (const token of expandedWords) {
    const clean = removeVietnameseTones(token);

    if (/^\d+(?:[\.,\d]*\d)?$/.test(token)) {
      let val = 0;
      if (hasMultiplier) {
        val = parseFloat(token.replace(/,/g, '.')) || 0;
      } else {
        val = parseFloat(token.replace(/[\.,]/g, '')) || 0;
      }
      tempValue = val;
      continue;
    }

    if (unitMap[clean] !== undefined) {
      tempValue = unitMap[clean];
    } else if (clean === 'muoi' || clean === 'mươi' || clean === 'chuc') {
      if (tempValue === 0) {
        tempValue = 10;
      } else {
        tempValue = tempValue * 10;
      }
    } else if (clean === 'tram') {
      if (tempValue === 0) {
        tempValue = 100;
      } else {
        tempValue = tempValue * 100;
      }
    } else if (clean === 'nghin' || clean === 'ngan' || clean === 'k') {
      groupValue += tempValue;
      total += (groupValue || 1) * 1000;
      groupValue = 0;
      tempValue = 0;
    } else if (clean === 'trieu' || clean === 'tr') {
      groupValue += tempValue;
      total += (groupValue || 1) * 1000000;
      groupValue = 0;
      tempValue = 0;
    } else if (clean === 'ty') {
      groupValue += tempValue;
      total += (groupValue || 1) * 1000000000;
      groupValue = 0;
      tempValue = 0;
    }
  }

  total += groupValue + tempValue;
  return total > 0 ? total : null;
}

export function parseVietnameseVoiceCommand(text: string): ParsedVoiceCommand {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return {};

  // Clean punctuation but preserve dot/comma inside numbers (e.g. 35.000, 2.5)
  const cleanedText = normalized.replace(/(?<!\d)[.,?]|[.,?](?!\d)/g, ' ');

  const numKeywords = new Set([
    'khong', 'mot', 'hai', 'ba', 'bon', 'tu', 'nam', 'lam', 'nham', 'sau', 'bay', 'tam', 'chin',
    'muoi', 'mươi', 'chuc', 'tram', 'nghin', 'ngan', 'trieu', 'tr', 'ty', 'k', 'le', 'linh', 'dong', 'd'
  ]);

  const isNumberToken = (w: string) => {
    const expanded = expandToken(w);
    return expanded.every(token => {
      if (/^\d+(?:[\.,\d]*\d)?$/.test(token)) return true;
      const clean = removeVietnameseTones(token);
      return numKeywords.has(clean);
    });
  };

  const words = cleanedText.split(/\s+/).filter(Boolean);
  let bestStart = -1;
  let bestEnd = -1;
  let currentStart = -1;

  for (let i = 0; i < words.length; i++) {
    if (isNumberToken(words[i])) {
      if (currentStart === -1) {
        currentStart = i;
      }
      if (i - currentStart >= bestEnd - bestStart) {
        bestStart = currentStart;
        bestEnd = i;
      }
    } else {
      currentStart = -1;
    }
  }

  let amount: number | undefined;
  let title = normalized;

  if (bestStart !== -1) {
    const numberPhraseWords = words.slice(bestStart, bestEnd + 1);
    const numberPhrase = numberPhraseWords.join(' ');
    
    const parsedAmount = parseWordBasedNumber(numberPhrase);
    if (parsedAmount !== null) {
      amount = parsedAmount;
      
      // Shorthand auto-multiply: e.g. "35" -> 35000
      if (amount < 1000) {
        const lastWord = numberPhraseWords[numberPhraseWords.length - 1];
        const lastWordClean = removeVietnameseTones(lastWord);
        if (!['trieu', 'tr', 'ty'].includes(lastWordClean)) {
          amount *= 1000;
        }
      }

      // Reconstruct title by excluding the matched number phrase
      const before = words.slice(0, bestStart).join(' ');
      const after = words.slice(bestEnd + 1).join(' ');
      title = [before, after].filter(Boolean).join(' ');
    }
  }

  // Clean filler words from start of title
  title = title
    .replace(/^(het|chi|thu|tien|khoan|mua|thanh toan|cho|mot|hai|ba|bon|nam|sau|bay|tam|chin|muoi)\s+/gi, '')
    .trim();

  // Clean trailing currency units
  title = title
    .replace(/\s+(vnd|dong|d|đ)$/gi, '')
    .trim();

  if (title) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  } else {
    title = 'Chi tiêu bằng giọng nói';
  }

  // Category mapping
  let categoryId = 'food';
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
