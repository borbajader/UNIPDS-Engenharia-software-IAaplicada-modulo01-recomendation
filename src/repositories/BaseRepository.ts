/**
 * Vibe3p AI Recommendation Platform - Base Repository
 * Repositório base genérico encapsulando as operações de CRUD de forma segura.
 * Cumpre a exigência acadêmica de estrutura limpa e tratamento de erros do Cloud SQL.
 */

import { db } from '../db/index.ts';
import { eq } from 'drizzle-orm';

export class BaseRepository<TTable extends any> {
  constructor(protected table: any) {}

  /**
   * Retorna todos os registros da tabela.
   */
  async all() {
    try {
      return await db.select().from(this.table);
    } catch (error) {
      console.error(`Erro ao listar registros da tabela:`, error);
      throw new Error(`Erro ao consultar banco de dados. Tente novamente mais tarde.`, { cause: error });
    }
  }

  /**
   * Encontra um registro pelo ID.
   */
  async find(id: any) {
    try {
      const results = await db.select().from(this.table).where(eq(this.table.id, id));
      return results[0] || null;
    } catch (error) {
      console.error(`Erro ao buscar registro por ID (${id}):`, error);
      throw new Error(`Erro ao carregar dados do registro.`, { cause: error });
    }
  }

  /**
   * Cria um novo registro na tabela.
   */
  async create(data: any) {
    try {
      const results = await db.insert(this.table).values(data).returning();
      return results[0];
    } catch (error) {
      console.error(`Erro ao criar registro:`, error);
      throw new Error(`Erro ao salvar dados no banco de dados.`, { cause: error });
    }
  }

  /**
   * Remove um registro pelo ID.
   */
  async delete(id: any) {
    try {
      const results = await db.delete(this.table).where(eq(this.table.id, id)).returning();
      return results[0] || null;
    } catch (error) {
      console.error(`Erro ao deletar registro (${id}):`, error);
      throw new Error(`Erro ao remover registro do banco de dados.`, { cause: error });
    }
  }

  /**
   * Atualiza um registro pelo ID.
   */
  async update(id: any, data: any) {
    try {
      const results = await db.update(this.table).set(data).where(eq(this.table.id, id)).returning();
      return results[0] || null;
    } catch (error) {
      console.error(`Erro ao atualizar registro (${id}):`, error);
      throw new Error(`Erro ao atualizar dados no banco de dados.`, { cause: error });
    }
  }
}
