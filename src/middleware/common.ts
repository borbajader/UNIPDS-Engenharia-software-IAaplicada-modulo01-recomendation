/**
 * Vibe3p AI Recommendation Platform - Common Middlewares
 * Implementação de middlewares utilitários: requestLogger, notFound e errorHandler.
 */

import { Request, Response, NextFunction } from 'express';

// 1. Logger de requisições recebidas
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[Vibe3p-API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
};

// 2. Tratamento de rotas não encontradas (404)
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
};

// 3. Gerenciador global de erros (500)
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Vibe3p-API Error]:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Ocorreu um erro interno no servidor.';
  res.status(status).json({
    error: message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
