import app from '../src/server/app';

// Bắt lỗi runtime toàn cục để ghi nhận vào Vercel logs nếu xảy ra crash bất ngờ
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception on Vercel Serverless:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;

