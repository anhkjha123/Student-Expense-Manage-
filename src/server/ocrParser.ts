import { GoogleGenAI } from '@google/genai';

// Common invoice headers to skip when identifying merchant
const GENERIC_BILL_HEADERS = [
  'hóa đơn', 'hoa don', 'phiếu thanh toán', 'phieu thanh toan',
  'phiếu tính tiền', 'phieu tinh tien', 'bill thanh toan', 'bill',
  'invoice', 'receipt', 'sales receipt', 'hóa đơn gtgt', 'hoa don gtgt',
  'phiếu thu', 'phieu thu', 'hóa đơn bán lẻ', 'hoa don ban le'
];

export function parseReceiptText(text: string): { amount: number | null, date: string | null, merchant: string | null, note: string } {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 1. Extract merchant
  let merchant: string | null = null;
  const merchants = [
    'GS25', 'Circle K', 'FamilyMart', 'Co.opmart', 'WinMart', 'Highlands Coffee', 'Phuc Long', 'Phúc Long', 'Starbucks',
    'CGV Cinema', 'Bách Hóa Xanh', 'Tiki', 'Grab', 'Be Group', 'Shopee', 'Lotte Mart', 'KFC', 'Jollibee',
    'McDonald\'s', 'Pizza Hut', 'The Coffee House', 'Mixue'
  ];

  for (const m of merchants) {
    if (new RegExp(m, 'i').test(text)) {
      merchant = m;
      break;
    }
  }

  if (!merchant) {
    for (const line of lines) {
      if (line.length < 60) {
        const lowerLine = line.toLowerCase();
        const isGenericHeader = GENERIC_BILL_HEADERS.some(header => lowerLine.includes(header));
        const isAddress = /\b\d+\s+[a-zA-ZÀ-ỹ]|\bP\.\d+|\bQ\.\d+|phường|quận|đường|số|địa chỉ|dia chi|đ\/c|d\/c/i.test(line);
        const isMetadata = /^(ĐT:|sdt:|tel:|phone:|bàn:|bàn\s*\d|thu ngân|thu ngan|khách hàng|khach hang|giờ in|gio in|ngày in|ngay in|số hd|so hd|hóa đơn|hoa don|mst|mã số thuế|email|website|web:)/i.test(line);
        if (!isGenericHeader && !isAddress && !isMetadata && /[a-zA-ZÀ-ỹ]/.test(line)) {
          merchant = line;
          break;
        }
      }
    }
    if (!merchant) {
      merchant = lines[0] && lines[0].length < 60 ? lines[0] : 'Cửa hàng tiện lợi';
    }
  }

  // 2. Extract date
  let date: string | null = null;
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

  // 3. Extract amount - prioritize final payment labels
  let amount: number | null = null;

  const cleanedLines = lines.filter(line => {
    if (/^0\d{9,10}$/.test(line.replace(/\s+/g, ''))) return false;
    if (/^\d{2}[-/.]\d{2}[-/.]\d{4}$/.test(line.trim())) return false;
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(line.trim())) return false;
    return true;
  });
  const cleanedText = cleanedLines.join('\n');

  const priorityAmountRegexes = [
    /(?:tiền\s+mặt|tien\s+mat|cash)\s*[:=]?\s*([\d,.]+)/i,
    /(?:tổng\s+cộng|tong\s+cong|t\.?\s*cộng)\s*\d*\s*[:=]?\s*([\d,.]+)/i,
    /(?:grand\s+total|total\s+due|total\s+amount|amount\s+paid)\s*[:=]?\s*([\d,.]+)/i,
    /(?:thành\s+tiền|thanh\s+tien)\s*[:=]?\s*([\d,.]+)/i,
    /(?:khách\s+(?:phải\s+)?trả|khach\s+tra)\s*[:=]?\s*([\d,.]+)/i,
    /(?:tổng\s+thanh\s+toán|tong\s+thanh\s+toan|thanh\s+toán|thanh\s+toan)\s*[:=]?\s*([\d,.]+)/i,
    /\bamount\b\s*[:=]?\s*([\d,.]+)/i,
  ];

  for (const regex of priorityAmountRegexes) {
    const match = cleanedText.match(regex);
    if (match) {
      const numStr = match[1].replace(/[,.]/g, '');
      const parsed = parseInt(numStr, 10);
      if (!isNaN(parsed) && parsed > 1000 && parsed < 100000000) {
        amount = parsed;
        break;
      }
    }
  }

  if (!amount) {
    const fallbackRegexes = [
      /([\d,.]+)\s*(?:vnd|đ)\b/i,
      /total\s*[:=]?\s*([\d,.]+)/i,
    ];
    for (const regex of fallbackRegexes) {
      const match = cleanedText.match(regex);
      if (match) {
        const numStr = match[1].replace(/[,.]/g, '');
        const parsed = parseInt(numStr, 10);
        if (!isNaN(parsed) && parsed > 1000 && parsed < 100000000) {
          amount = parsed;
          break;
        }
      }
    }
  }

  // 4. Extract item lines for note
  const itemLines: string[] = [];
  for (const line of lines) {
    // Matches formats like "1) Coca 2 25,000 50,000" or "Coca x2 50,000" or "Coca 2 50,000"
    const itemMatch = line.match(/^(?:\d+[).]?\s+)?([a-zA-ZÀ-ỹ0-9\s&+-]+?)\s+(?:x\s*|\*|\bSL\b:?\s*)?(\d+)\s+[\d,.]+(?:\s+[\d,.])?/i);
    if (itemMatch) {
      const itemName = itemMatch[1].trim();
      const itemQty = itemMatch[2].trim();
      // Filter out common header or noise strings matching as items
      const isNoise = /^(tên hàng|ten hang|sl|đơn giá|don gia|t\.tiền|t\.tien|thành tiền|thanh tien|tổng cộng|tong cong|tiền mặt|tien mat)/i.test(itemName);
      if (!isNoise && itemName.length > 1 && itemName.length < 35) {
        itemLines.push(`${itemName} x${itemQty}`);
      }
    }
  }
  const noteItems = itemLines.length > 0
    ? `Mua tại ${merchant} gồm: ${itemLines.slice(0, 5).join(', ')}`
    : `Quét tự động từ hóa đơn ${merchant}`;

  return {
    amount,
    date: date || new Date().toISOString().substring(0, 10),
    merchant,
    note: noteItems
  };
}

export async function parseReceipt(imageBase64: string, mimeType: string): Promise<{ amount: number | null, date: string | null, merchant: string | null, note: string }> {
  const hasApiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && process.env.GEMINI_API_KEY !== '';
  
  if (hasApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg'
            }
          },
          'Hãy phân tích hóa đơn/receipt này và trích xuất thông tin chính xác.'
        ],
        config: {
          systemInstruction: `Bạn là chuyên gia phân tích hóa đơn tài chính chuyên nghiệp (OCR). Nhiệm vụ của bạn:
1. MERCHANT: Tên thương hiệu, cửa hàng hoặc nhà hàng chính hiển thị nổi bật ở đầu hóa đơn (ví dụ: "VINH NGUYEN RES", "Highlands Coffee", "GS25", "Circle K"). Phải bỏ qua hoàn toàn các dòng địa chỉ (ví dụ: "355 Sư Vạn Hạnh..."), số điện thoại, tên nhân viên thu ngân, số bàn, số hóa đơn, hoặc các cụm từ chung chung như "Hóa đơn thanh toán", "Phiếu tính tiền".
2. AMOUNT: Tổng số tiền thực tế người dùng thanh toán (VND, kiểu số nguyên). Hãy phân tích kỹ các mục cộng trừ để lấy đúng số tiền cuối cùng mà khách hàng phải trả hoặc đã trả (ví dụ: "225000"). Tránh lấy nhầm số lượng, đơn giá, tổng tiền hàng trước chiết khấu/giảm giá, tiền VAT riêng lẻ, hoặc tiền thối lại (tiền thừa trả khách).
3. DATE: Ngày thực hiện giao dịch, định dạng "YYYY-MM-DD" (ví dụ: từ "29/03/2019" hoặc "29-03-2019" phải chuyển thành "2019-03-29"). Nếu hóa đơn chỉ ghi ngày in hoặc ngày thanh toán, hãy lấy ngày đó. Nếu không tìm thấy năm, giả định năm hiện tại (2026).
4. NOTE: Tóm tắt danh sách mặt hàng nổi bật kèm số lượng cụ thể (tối đa 5 mặt hàng, tối đa 200 ký tự). Ví dụ: "Mua tại VINH NGUYEN RES gồm: Coca x2, Sprite x2, Tonic x2, Soda x1".`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              amount: {
                type: 'integer',
                description: 'Tổng số tiền thực tế thanh toán bằng VND (số nguyên)'
              },
              date: {
                type: 'string',
                description: 'Ngày giao dịch định dạng YYYY-MM-DD'
              },
              merchant: {
                type: 'string',
                description: 'Tên cửa hàng/nhà hàng/thương hiệu'
              },
              note: {
                type: 'string',
                description: 'Tóm tắt các mặt hàng đã mua kèm số lượng'
              }
            },
            required: ['amount', 'date', 'merchant', 'note']
          } as any
        }
      });
      
      const text = response.text || '';
      const data = JSON.parse(text);
      return {
        amount: data.amount ? Number(data.amount) : null,
        date: data.date || new Date().toISOString().substring(0, 10),
        merchant: data.merchant || 'Cửa hàng tiện lợi',
        note: data.note || `Quét tự động từ hóa đơn ${data.merchant || 'tiện lợi'}`
      };
    } catch (err) {
      console.warn("Gemini API parsing failed, falling back to offline parser:", err);
    }
  }

  // Fallback to text parsing if input base64 holds text
  try {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const decodedText = Buffer.from(cleanBase64, 'base64').toString('utf8');
    if (decodedText && /[a-zA-Z0-9\s]/.test(decodedText)) {
      return parseReceiptText(decodedText);
    }
  } catch (e) {
    // ignore
  }

  return {
    amount: null,
    date: new Date().toISOString().substring(0, 10),
    merchant: null,
    note: 'Không nhận dạng được từ ảnh. Vui lòng nhập thủ công.'
  };
}
