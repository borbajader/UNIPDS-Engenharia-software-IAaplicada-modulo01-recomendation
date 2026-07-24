/**
 * Vibe3p AI Recommendation Platform - Dataset Service
 * Transforma registros da tabela de interações em matrizes numéricas normalizadas para o TensorFlow.js.
 */

import { db } from '../db/index.ts';
import { interactions, destinations, users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { CATEGORIES, CLIMATES } from '../constants.ts';

// Definição de mapeamento estático para codificação de categorias e clima (One-Hot Encoding)
export { CATEGORIES, CLIMATES };

export interface MLFeatureVector {
  userId: string;
  destinationId: number;
  x: number[]; // Vetor de 12 features
  y: number;   // Label: 1 (gostou) ou 0 (não gostou)
}

export class DatasetService {
  /**
   * Codifica uma categoria em um vetor One-Hot
   */
  encodeCategory(category: string): number[] {
    const vector = new Array(CATEGORIES.length).fill(0);
    const index = CATEGORIES.indexOf(category);
    if (index !== -1) {
      vector[index] = 1;
    }
    return vector;
  }

  /**
   * Codifica um clima em um vetor One-Hot
   */
  encodeClimate(climate: string): number[] {
    const vector = new Array(CLIMATES.length).fill(0);
    const index = CLIMATES.indexOf(climate);
    if (index !== -1) {
      vector[index] = 1;
    }
    return vector;
  }

  /**
   * Gera o dataset a partir de interações no banco de dados.
   */
  async generateDataset(): Promise<MLFeatureVector[]> {
    try {
      // Carrega interações trazendo dados dos usuários e dos destinos
      const records = await db.select({
        interaction: interactions,
        destination: destinations,
        user: users
      })
      .from(interactions)
      .innerJoin(destinations, eq(interactions.destinationId, destinations.id))
      .innerJoin(users, eq(interactions.userId, users.id));

      if (records.length === 0) {
        return [];
      }

      return records.map((record) => {
        const u = record.user;
        const d = record.destination;
        const i = record.interaction;

        // Normalização das Features Numéricas
        const normAge = u.age / 100.0; // Idade normalizada entre 0 e 1 (considerando até 100 anos)
        const normPrice = d.priceLevel / 4.0; // Price Level (1 a 4) normalizado
        const normDays = i.travelDays / 30.0; // Dias de viagem normalizados (considerando até 30 dias)
        const normCost = i.travelCost / 10000.0; // Custo normalizado (considerando até 10.000)

        // Codificação One-Hot para Categorias e Climas
        const catEncoded = this.encodeCategory(d.category);
        const cliEncoded = this.encodeClimate(d.climate);

        // Combina em um vetor X de 12 dimensões:
        // [normAge, ...catEncoded, normPrice, ...cliEncoded, normDays, normCost]
        const x = [
          normAge,
          ...catEncoded,
          normPrice,
          ...cliEncoded,
          normDays,
          normCost
        ];

        // Label Y: 1 se o usuário curtiu (liked) ou deu nota >= 4, senão 0
        const y = i.liked || i.rating >= 4 ? 1 : 0;

        return {
          userId: u.id,
          destinationId: d.id,
          x,
          y
        };
      });
    } catch (error) {
      console.error('Erro ao gerar dataset no DatasetService:', error);
      throw new Error('Falha ao processar e normalizar dataset de treinamento.', { cause: error });
    }
  }

  /**
   * Constrói o vetor de features X para um par específico de Usuário e Destino.
   * Útil para inferência em tempo real.
   */
  buildUserDestinationFeatures(
    user: { age: number },
    destination: { category: string; priceLevel: number; climate: string },
    preferences: { travelDays: number; travelCost: number }
  ): number[] {
    const normAge = user.age / 100.0;
    const normPrice = destination.priceLevel / 4.0;
    const normDays = preferences.travelDays / 30.0;
    const normCost = preferences.travelCost / 10000.0;

    const catEncoded = this.encodeCategory(destination.category);
    const cliEncoded = this.encodeClimate(destination.climate);

    return [
      normAge,
      ...catEncoded,
      normPrice,
      ...cliEncoded,
      normDays,
      normCost
    ];
  }
}
