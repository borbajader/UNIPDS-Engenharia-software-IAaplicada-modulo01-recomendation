/**
 * Vibe3p AI Recommendation Platform - Express Server
 * Ponto de entrada do backend full-stack integrado com o middleware do Vite.
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as dotenv from 'dotenv';
import apiRouter from './src/routes/api.ts';
import { requestLogger, notFound, errorHandler } from './src/middleware/common.ts';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Configurações básicas de parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware de Log de requisições
  app.use(requestLogger);

  // Registra as rotas da API ANTES do middleware do Vite
  app.use('/api', apiRouter);

  // Configura o middleware do Vite para desenvolvimento ou serve arquivos estáticos na produção
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Fallback de SPA para servir index.html do React em qualquer rota
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Middlewares de fallback
  app.use(notFound);
  app.use(errorHandler);

  // Inicializa o servidor Express
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Vibe3p Server] Servidor escutando na porta ${PORT}`);
    console.log(`[Vibe3p Server] Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Inicia o pipeline do servidor
startServer().catch((error) => {
  console.error('[Vibe3p Server] Falha catastrófica ao iniciar servidor:', error);
});
