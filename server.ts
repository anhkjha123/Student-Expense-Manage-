import 'dotenv/config'; // Load .env file trước mọi thứ khác
import app from './src/server/app';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { checkAndGenerateRecurringExpenses } from './src/server/recurringExpenses';

async function startServer() {
  const PORT = 3000;

  // Bật bộ kiểm tra recurring expenses mỗi phút
  setInterval(() => {
    checkAndGenerateRecurringExpenses();
  }, 60 * 1000);
  // Run once immediately
  checkAndGenerateRecurringExpenses();

  // --- VITE INTERCEPTOR DEV MIDDLEWARE vs STANDALONE STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OK] Student Expense Manager Server is booted on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CRITICAL] Error booting Express fullstack server:', err);
});

