/**
 * Vibe3p AI Recommendation Platform - Shared TypeScript Types
 */

export interface User {
  id: string;
  name: string;
  age: number;
  city: string;
  state: string;
  country: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Destination {
  id: number;
  name: string;
  category: string;
  city: string;
  state: string;
  country: string;
  priceLevel: number; // 1 to 4
  climate: string; // Quente, Frio, Temperado
  createdAt?: string;
  updatedAt?: string;
}

export interface Interaction {
  id: number;
  userId: string;
  destinationId: number;
  rating: number;
  visited: boolean;
  liked: boolean;
  travelDays: number;
  travelCost: number;
  travelDate: string;
  createdAt?: string;
}

export interface JoinedInteraction {
  interaction: Interaction;
  destination: Destination;
}

export interface Recommendation {
  id: number;
  userId: string;
  destinationId: number;
  score: number;
  createdAt?: string;
}

export interface JoinedRecommendation {
  recommendation: Recommendation;
  destination: Destination;
}

export interface TrainingSession {
  id: number;
  epochs: number;
  loss: number;
  accuracy: number;
  modelVersion: string;
  trainedAt: string;
}

export interface TrainingStatus {
  isLoaded: boolean;
  latestSession: TrainingSession | null;
  datasetSize: number;
}
