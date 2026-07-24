/**
 * Vibe3p AI Recommendation Platform - Training Service
 * Constrói, compila e treina uma rede neural densa utilizando TensorFlow.js.
 */

import * as tf from '@tensorflow/tfjs';
import { DatasetService } from './DatasetService.ts';
import { TrainingSessionRepository } from '../repositories/ModelsRepository.ts';

// Cache global para manter o modelo treinado ativo em memória
declare global {
  var _activeModel: tf.LayersModel | undefined;
}

export class TrainingService {
  private datasetService = new DatasetService();
  private trainingRepo = new TrainingSessionRepository();

  /**
   * Constrói e compila o modelo de recomendação (Rede Neural Multicamadas)
   */
  private createModel(layer1Units: number = 16, layer2Units: number = 8): tf.LayersModel {
    const model = tf.sequential();

    // Camada de entrada (vetor de 12 features) e primeira camada densa
    model.add(tf.layers.dense({
      units: layer1Units,
      activation: 'relu',
      inputShape: [12],
    }));

    // Segunda camada densa para aprender representações intermediárias
    model.add(tf.layers.dense({
      units: layer2Units,
      activation: 'relu',
    }));

    // Camada de saída (Sigmoid para classificação binária: probabilidade de gostar do destino)
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
    }));

    // Compila o modelo com otimizador Adam e Binary Crossentropy (ideal para classificação binária)
    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  /**
   * Executa o treinamento do modelo usando os dados de interações existentes.
   * @param epochs número de épocas de treinamento (padrão: 50)
   * @param layer1Units número de neurônios na camada oculta 1 (padrão: 16)
   * @param layer2Units número de neurônios na camada oculta 2 (padrão: 8)
   */
  async trainModel(epochs: number = 50, layer1Units: number = 16, layer2Units: number = 8): Promise<{ loss: number; accuracy: number; epochs: number; message: string }> {
    try {
      // 1. Gera o dataset normalizado
      const rawDataset = await this.datasetService.generateDataset();
      if (rawDataset.length < 5) {
        throw new Error('Dados insuficientes para treinamento. Por favor, registre pelo menos 5 interações ou popule o banco.');
      }

      // 2. Transforma em tensores do TensorFlow.js
      const xsArray = rawDataset.map(d => d.x);
      const ysArray = rawDataset.map(d => d.y);

      const xs = tf.tensor2d(xsArray, [xsArray.length, 12]);
      const ys = tf.tensor2d(ysArray, [ysArray.length, 1]);

      // 3. Cria a estrutura do modelo com as unidades dinâmicas definidas pelo usuário
      const model = this.createModel(layer1Units, layer2Units);

      // 4. Executa o treinamento de forma síncrona/assíncrona acompanhando as métricas
      console.log(`Iniciando treinamento com ${rawDataset.length} amostras por ${epochs} épocas (Camada 1: ${layer1Units}, Camada 2: ${layer2Units})...`);
      
      const valSplit = rawDataset.length >= 10 ? 0.1 : 0.0;

      const history = await model.fit(xs, ys, {
        epochs,
        shuffle: true,
        validationSplit: valSplit, // Reserva 10% se houver amostras suficientes, senão treina com tudo
        verbose: 0,
      });

      // 5. Extrai métricas finais do histórico de treinamento de forma resiliente (suportando 'accuracy' e 'acc')
      const lossList = history.history.loss;
      const finalLoss = Array.isArray(lossList)
        ? lossList[lossList.length - 1] as number
        : (lossList ? Number(lossList) : 0.0);

      const accList = history.history.accuracy || history.history.acc;
      const finalAcc = Array.isArray(accList)
        ? accList[accList.length - 1] as number
        : (accList ? Number(accList) : 1.0);

      // Limpa os tensores de treinamento para liberar memória GPU/CPU
      xs.dispose();
      ys.dispose();

      // 6. Armazena o modelo treinado na memória para inferências futuras
      global._activeModel = model;

      // 7. Salva a sessão de treinamento no banco de dados para o dashboard acadêmico
      const version = `v1.0.${Date.now().toString().slice(-4)}`;
      await this.trainingRepo.create({
        epochs,
        loss: finalLoss,
        accuracy: finalAcc,
        modelVersion: version,
        trainedAt: new Date()
      });

      return {
        loss: finalLoss,
        accuracy: finalAcc,
        epochs,
        message: `Treinamento finalizado com sucesso! Modelo versão ${version} ativo.`
      };
    } catch (error) {
      console.error('Erro no pipeline de treinamento do TensorFlow.js:', error);
      throw error;
    }
  }

  /**
   * Obtém o status do modelo atual ativo na memória.
   */
  async getActiveModelStatus() {
    const latestSession = await this.trainingRepo.getLatest();
    return {
      isLoaded: !!global._activeModel,
      latestSession,
    };
  }
}
