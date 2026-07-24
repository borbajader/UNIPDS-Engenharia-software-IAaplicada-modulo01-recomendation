/**
 * Vibe3p AI Recommendation Platform - Database Schema
 * Define as tabelas do PostgreSQL para o pipeline de aprendizado de máquina.
 */

import { pgTable, serial, text, integer, boolean, doublePrecision, timestamp, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Tabela de Usuários (ID corresponde ao Firebase UID)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase Auth UID
  name: text('name').notNull(),
  age: integer('age').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Tabela de Destinos Turísticos
export const destinations = pgTable('destinations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // Ex: Praia, Montanha, Histórico, Urbano
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
  priceLevel: integer('price_level').notNull(), // 1 (Econômico) a 4 (Luxo)
  climate: text('climate').notNull(), // Ex: Quente, Frio, Temperado
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Tabela de Interações (Dados comportamentais para alimentar o TensorFlow.js)
export const interactions = pgTable('interactions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  destinationId: integer('destination_id').references(() => destinations.id, { onDelete: 'cascade' }).notNull(),
  rating: real('rating').notNull(), // Nota de 1 a 5 dada pelo usuário ao destino
  visited: boolean('visited').default(false).notNull(), // Se o usuário já visitou o destino
  liked: boolean('liked').default(false).notNull(), // Se gostou do destino (Label Y para classificação)
  travelDays: integer('travel_days').notNull(), // Dias ideais de viagem informados
  travelCost: doublePrecision('travel_cost').notNull(), // Custo estimado da viagem
  travelDate: text('travel_date').notNull(), // Data da viagem formato YYYY-MM-DD
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Tabela de Recomendações (Resultados das predições salvos para acesso rápido)
export const recommendations = pgTable('recommendations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  destinationId: integer('destination_id').references(() => destinations.id, { onDelete: 'cascade' }).notNull(),
  score: real('score').notNull(), // Score calculado pelo modelo TensorFlow.js
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Tabela de Sessões de Treinamento (Histórico de métricas do TensorFlow.js)
export const trainingSessions = pgTable('training_sessions', {
  id: serial('id').primaryKey(),
  epochs: integer('epochs').notNull(),
  loss: real('loss').notNull(),
  accuracy: real('accuracy').notNull(),
  modelVersion: text('model_version').notNull(),
  trainedAt: timestamp('trained_at').defaultNow().notNull(),
});

// --- Relações entre Tabelas para Facilidade de Queries ---

export const usersRelations = relations(users, ({ many }) => ({
  interactions: many(interactions),
  recommendations: many(recommendations),
}));

export const destinationsRelations = relations(destinations, ({ many }) => ({
  interactions: many(interactions),
  recommendations: many(recommendations),
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
  user: one(users, {
    fields: [interactions.userId],
    references: [users.id],
  }),
  destination: one(destinations, {
    fields: [interactions.destinationId],
    references: [destinations.id],
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  user: one(users, {
    fields: [recommendations.userId],
    references: [users.id],
  }),
  destination: one(destinations, {
    fields: [recommendations.destinationId],
    references: [destinations.id],
  }),
}));
