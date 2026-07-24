/**
 * Vibe3p AI Recommendation Platform - Model Repositories
 * Implementa repositórios especializados para cada modelo estendendo BaseRepository.
 */

import { BaseRepository } from './BaseRepository.ts';
import { db } from '../db/index.ts';
import { users, destinations, interactions, recommendations, trainingSessions } from '../db/schema.ts';
import { eq, desc, and } from 'drizzle-orm';

// 1. Repositório de Usuários
export class UserRepository extends BaseRepository<typeof users> {
  constructor() {
    super(users);
  }

  /**
   * Registra ou atualiza um usuário usando a estratégia de upsert recomendada.
   */
  async getOrCreateUser(id: string, data: { name: string; age: number; city: string; state: string; country: string }) {
    try {
      const results = await db.insert(users)
        .values({ id, ...data })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: data.name,
            age: data.age,
            city: data.city,
            state: data.state,
            country: data.country,
            updatedAt: new Date()
          }
        })
        .returning();
      return results[0];
    } catch (error) {
      console.error(`Erro ao sincronizar usuário (${id}):`, error);
      throw new Error(`Erro ao registrar perfil do usuário.`, { cause: error });
    }
  }
}

// 2. Repositório de Destinos Turísticos
export class DestinationRepository extends BaseRepository<typeof destinations> {
  constructor() {
    super(destinations);
  }

  /**
   * Conta a quantidade total de destinos.
   */
  async count() {
    try {
      const results = await db.select().from(destinations);
      return results.length;
    } catch (error) {
      console.error(`Erro ao contar destinos:`, error);
      return 0;
    }
  }
}

// 3. Repositório de Interações
export class InteractionRepository extends BaseRepository<typeof interactions> {
  constructor() {
    super(interactions);
  }

  /**
   * Retorna as interações de um usuário específico, trazendo também detalhes do destino.
   */
  async findByUserWithDestinations(userId: string) {
    try {
      return await db.select({
        interaction: interactions,
        destination: destinations
      })
      .from(interactions)
      .innerJoin(destinations, eq(interactions.destinationId, destinations.id))
      .where(eq(interactions.userId, userId))
      .orderBy(desc(interactions.createdAt));
    } catch (error) {
      console.error(`Erro ao obter interações do usuário (${userId}):`, error);
      throw new Error(`Erro ao obter interações do usuário.`, { cause: error });
    }
  }

  /**
   * Conta o total de interações registradas no banco.
   */
  async count() {
    try {
      const results = await db.select().from(interactions);
      return results.length;
    } catch (error) {
      console.error(`Erro ao contar interações:`, error);
      return 0;
    }
  }
}

// 4. Repositório de Recomendações geradas por IA
export class RecommendationRepository extends BaseRepository<typeof recommendations> {
  constructor() {
    super(recommendations);
  }

  /**
   * Limpa as recomendações antigas de um usuário antes de prever novas.
   */
  async deleteByUser(userId: string) {
    try {
      await db.delete(recommendations).where(eq(recommendations.userId, userId));
    } catch (error) {
      console.error(`Erro ao remover recomendações antigas para usuário (${userId}):`, error);
      throw new Error(`Erro ao limpar histórico de recomendações.`, { cause: error });
    }
  }

  /**
   * Retorna as recomendações ordenadas por score de afinidade com detalhes do destino.
   */
  async findByUserWithDestinations(userId: string) {
    try {
      return await db.select({
        recommendation: recommendations,
        destination: destinations
      })
      .from(recommendations)
      .innerJoin(destinations, eq(recommendations.destinationId, destinations.id))
      .where(eq(recommendations.userId, userId))
      .orderBy(desc(recommendations.score));
    } catch (error) {
      console.error(`Erro ao carregar recomendações para usuário (${userId}):`, error);
      throw new Error(`Erro ao carregar recomendações inteligentes.`, { cause: error });
    }
  }
}

// 5. Repositório de Sessões de Treinamento do TensorFlow.js
export class TrainingSessionRepository extends BaseRepository<typeof trainingSessions> {
  constructor() {
    super(trainingSessions);
  }

  /**
   * Retorna a sessão de treinamento mais recente (modelo ativo).
   */
  async getLatest() {
    try {
      const results = await db.select()
        .from(trainingSessions)
        .orderBy(desc(trainingSessions.trainedAt))
        .limit(1);
      return results[0] || null;
    } catch (error) {
      console.error(`Erro ao obter sessão de treinamento ativa:`, error);
      return null;
    }
  }

  /**
   * Conta a quantidade total de treinamentos realizados.
   */
  async count() {
    try {
      const results = await db.select().from(trainingSessions);
      return results.length;
    } catch (error) {
      console.error(`Erro ao contar sessões de treinamento:`, error);
      return 0;
    }
  }
}
