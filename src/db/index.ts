/**
 * Vibe3p AI Recommendation Platform - Database Connection Pool
 * Configura o pool de conexões utilizando pg e inicializa o Drizzle.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Cache global para persistir o pool de conexões entre recarregamentos no desenvolvimento
declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    // Tratamento de erro no nível de pool
    global._postgresPool.on('error', (err) => {
      console.error('Erro inesperado no cliente de banco de dados ocioso:', err);
    });
  }
  return global._postgresPool;
};

// Instancia ou recupera o pool existente
const pool = createPool();

// Inicializa o Drizzle com o pool de conexões e o schema compilado
export const db = drizzle(pool, { schema });
