import app from '../src/server/app';
import type { IncomingMessage, ServerResponse } from 'http';

// Wrap Express app as a Vercel Serverless Function handler
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}

