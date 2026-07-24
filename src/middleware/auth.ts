/**
 * Vibe3p AI Recommendation Platform - Authentication Middleware
 * Middleware do Express para proteger rotas da API usando tokens Firebase Auth.
 */

import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const testUserId = req.headers['x-user-id'];

  // Modo didático: se não houver token mas houver header de teste, simula o usuário
  if (!authHeader && testUserId) {
    req.user = {
      uid: testUserId,
      email: `${testUserId}@vibe3p.ai`,
      name: testUserId === 'user_seeder_1' ? 'Ana Souza' : 
            testUserId === 'user_seeder_2' ? 'Carlos Lima' :
            testUserId === 'user_seeder_3' ? 'Juliana Costa' : 'Usuário de Teste'
    };
    return next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado: Token ausente' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Erro ao verificar token do Firebase:', error);
    return res.status(401).json({ error: 'Não autorizado: Token inválido ou expirado' });
  }
};
