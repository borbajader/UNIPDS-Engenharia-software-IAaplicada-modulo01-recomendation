/**
 * Vibe3p AI Recommendation Platform - Firebase Admin Setup
 * Inicializa o SDK Admin do Firebase para verificação de tokens de autenticação.
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

let firebaseConfig: { projectId?: string } = {};

try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (e) {
  console.warn('[Firebase Admin] Configuração do Firebase não encontrada. Rodando em modo simulado/local.');
}

const apps = getApps();
if (!apps.length && firebaseConfig.projectId) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export const adminAuth = {
  verifyIdToken: async (token: string) => {
    if (!firebaseConfig.projectId) {
      throw new Error('Firebase não configurado');
    }
    return getAuth().verifyIdToken(token);
  }
};

