import { Response } from 'express';
import { AuthenticatedRequest } from './auth';
import { parseReceipt } from './ocrParser';

export const ocrController = {
  scanReceipt: async (req: AuthenticatedRequest, res: Response) => {
    const startTime = Date.now();
    try {
      const { image, name, mimeType } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'Không tìm thấy dữ liệu ảnh hóa đơn' });
      }

      // Check size (base64 approximation: 4 base64 chars = 3 bytes)
      const cleanBase64 = image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      const approxSizeBytes = (cleanBase64.length * 3) / 4;
      const sizeMB = approxSizeBytes / (1024 * 1024);

      if (sizeMB > 10) {
        return res.status(400).json({ error: 'Kích thước tệp vượt quá giới hạn 10MB cho phép' });
      }

      // Check format from name or mime type
      const filename = name || '';
      const isAllowedFormat = /\.(jpg|jpeg|png|heic)$/i.test(filename) || 
                              (mimeType && /image\/(jpeg|png|heic|heif)/i.test(mimeType));
                              
      if (!isAllowedFormat) {
        return res.status(400).json({ error: 'Định dạng tệp không hỗ trợ. Hệ thống chỉ hỗ trợ JPG, PNG, HEIC' });
      }

      // Parse receipt data
      const parsedData = await parseReceipt(image, mimeType || 'image/jpeg');
      
      const durationMs = Date.now() - startTime;
      console.log(`[OCR API] Scanned receipt in ${durationMs}ms`);

      res.json({
        ...parsedData,
        thumbnailUrl: image, // Return the uploaded image as thumbnail (AC6)
        processingTimeMs: durationMs
      });
    } catch (e: any) {
      console.error('[OCR Controller Error]', e);
      res.status(500).json({ error: e.message || 'Lỗi hệ thống khi quét hóa đơn' });
    }
  }
};
