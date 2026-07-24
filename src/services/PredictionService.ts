/**
 * Vibe3p AI Recommendation Platform - Prediction Service
 * Executa predições com o modelo TensorFlow.js para gerar recomendações personalizadas.
 */

import * as tf from '@tensorflow/tfjs';
import { DatasetService } from './DatasetService.ts';
import { DestinationRepository, RecommendationRepository, UserRepository, InteractionRepository } from '../repositories/ModelsRepository.ts';

export class PredictionService {
  private datasetService = new DatasetService();
  private userRepo = new UserRepository();
  private destRepo = new DestinationRepository();
  private interacRepo = new InteractionRepository();
  private recomRepo = new RecommendationRepository();

  /**
   * Gera recomendações em tempo real para um usuário específico.
   * @param userId ID do usuário (Firebase Auth UID)
   */
  async generateRecommendations(userId: string): Promise<any[]> {
    try {
      // 1. Carrega dados do usuário
      const user = await this.userRepo.find(userId) as any;
      if (!user) {
        throw new Error(`Usuário não encontrado: ${userId}`);
      }

      // 2. Carrega todos os destinos cadastrados
      const allDestinations = await this.destRepo.all() as any[];
      if (allDestinations.length === 0) {
        return [];
      }

      // 3. Carrega o histórico de interações do usuário para inferir preferências médias
      const userInteractions = await this.interacRepo.findByUserWithDestinations(userId);
      
      // Define preferências do usuário (média histórica ou valores padrão didáticos)
      let prefDays = 5;
      let prefCost = 2500;
      
      if (userInteractions.length > 0) {
        const totalDays = userInteractions.reduce((sum, item) => sum + item.interaction.travelDays, 0);
        const totalCost = userInteractions.reduce((sum, item) => sum + item.interaction.travelCost, 0);
        prefDays = Math.round(totalDays / userInteractions.length);
        prefCost = Math.round(totalCost / userInteractions.length);
      }

      const results: { destinationId: number; score: number }[] = [];

      // 4. Se o modelo de rede neural do TensorFlow.js estiver carregado, executa a inferência
      if (global._activeModel) {
        console.log(`[TFJS Inference] Gerando recomendações para usuário ${userId} utilizando a rede neural carregada.`);
        
        // Constrói os vetores de features para todos os destinos
        const featuresArray = allDestinations.map(dest => 
          this.datasetService.buildUserDestinationFeatures(
            { age: user.age },
            { category: dest.category, priceLevel: dest.priceLevel, climate: dest.climate },
            { travelDays: prefDays, travelCost: prefCost }
          )
        );

        // Executa a inferência em lote (batch prediction) de forma síncrona/otimizada
        const inputTensor = tf.tensor2d(featuresArray, [allDestinations.length, 12]);
        const outputTensor = global._activeModel.predict(inputTensor) as tf.Tensor;
        const scores = await outputTensor.data(); // Baixa os scores gerados de volta para a CPU

        // Libera tensores da memória
        inputTensor.dispose();
        outputTensor.dispose();

        // Mapeia os scores calculados para seus respectivos destinos
        allDestinations.forEach((dest, idx) => {
          results.push({
            destinationId: dest.id,
            score: Number(scores[idx])
          });
        });

      } else {
        // 5. Fallback Heurístico (se o estudante ainda não treinou o modelo)
        console.warn(`[Fallback Heuristics] Modelo TensorFlow.js inativo. Recomendações geradas com base em heurísticas.`);
        
        // Heurística de proximidade de categoria
        const favoriteCategories = userInteractions
          .filter(item => item.interaction.liked || item.interaction.rating >= 4)
          .map(item => item.destination.category);

        allDestinations.forEach(dest => {
          let score = 0.5; // score base
          
          // Aumenta score se for da categoria favorita do usuário
          if (favoriteCategories.includes(dest.category)) {
            score += 0.25;
          }
          // Ajuste de preço nível de preferência
          if (dest.priceLevel <= 2 && prefCost < 3000) {
            score += 0.15;
          }
          
          results.push({
            destinationId: dest.id,
            score: Math.min(1.0, score)
          });
        });
      }

      // 6. Limpa e atualiza recomendações no banco para persistência e dashboard
      await this.recomRepo.deleteByUser(userId);
      
      // Salva em lote as top 5 recomendações ordenadas por score
      const sortedResults = results.sort((a, b) => b.score - a.score).slice(0, 5);
      
      for (const res of sortedResults) {
        await this.recomRepo.create({
          userId,
          destinationId: res.destinationId,
          score: res.score,
          createdAt: new Date()
        });
      }

      // Retorna as recomendações completas unidas com os detalhes dos destinos
      return await this.recomRepo.findByUserWithDestinations(userId);
    } catch (error) {
      console.error('Erro na inferência do PredictionService:', error);
      throw error;
    }
  }
}
