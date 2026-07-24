/**
 * Vibe3p AI Recommendation Platform - Models Services
 * Camada de serviços para Usuários, Destinos Turísticos e Interações, incluindo o Seeder.
 */

import { UserRepository, DestinationRepository, InteractionRepository, TrainingSessionRepository, RecommendationRepository } from '../repositories/ModelsRepository.ts';
import { db } from '../db/index.ts';
import { users, destinations, interactions, recommendations, trainingSessions } from '../db/schema.ts';

export class UserService {
  private userRepo = new UserRepository();

  async getUsers() {
    return await this.userRepo.all();
  }

  async getUser(id: string) {
    return await this.userRepo.find(id);
  }

  async syncUser(id: string, data: { name: string; age: number; city: string; state: string; country: string }) {
    return await this.userRepo.getOrCreateUser(id, data);
  }

  async createUser(data: { id: string; name: string; age: number; city: string; state: string; country: string }) {
    return await this.userRepo.create({ ...data, createdAt: new Date(), updatedAt: new Date() });
  }

  async updateUser(id: string, data: { name: string; age: number; city: string; state: string; country: string }) {
    return await this.userRepo.update(id, { ...data, updatedAt: new Date() });
  }

  async deleteUser(id: string) {
    return await this.userRepo.delete(id);
  }
}

export class DestinationService {
  private destRepo = new DestinationRepository();

  async getDestinations() {
    return await this.destRepo.all();
  }

  async getDestination(id: number) {
    return await this.destRepo.find(id);
  }

  async createDestination(data: { name: string; category: string; city: string; state: string; country: string; priceLevel: number; climate: string }) {
    return await this.destRepo.create({ ...data, createdAt: new Date(), updatedAt: new Date() });
  }

  async updateDestination(id: number, data: { name: string; category: string; city: string; state: string; country: string; priceLevel: number; climate: string }) {
    return await this.destRepo.update(id, { ...data, updatedAt: new Date() });
  }

  async deleteDestination(id: number) {
    return await this.destRepo.delete(id);
  }

  /**
   * Método auxiliar para popular o banco de dados com dados didáticos de alta qualidade.
   * Ajuda o estudante a ver o TensorFlow.js funcionando imediatamente com dados realistas.
   */
  async seedDatabase(): Promise<{ users: number; destinations: number; interactions: number }> {
    try {
      // 1. Limpa todas as tabelas na ordem de dependência para evitar conflitos de FK
      await db.delete(recommendations);
      await db.delete(interactions);
      await db.delete(destinations);
      await db.delete(users);
      await db.delete(trainingSessions);

      // 2. Cria Destinos Didáticos (Diferentes categorias, preços e climas para a IA aprender padrões)
      const mockDestinations = [
        { name: 'Fernando de Noronha', category: 'Praia', city: 'Noronha', state: 'PE', country: 'Brasil', priceLevel: 4, climate: 'Quente' },
        { name: 'Gramado', category: 'Montanha', city: 'Gramado', state: 'RS', country: 'Brasil', priceLevel: 3, climate: 'Frio' },
        { name: 'Rio de Janeiro', category: 'Urbano', city: 'Rio de Janeiro', state: 'RJ', country: 'Brasil', priceLevel: 3, climate: 'Quente' },
        { name: 'Ouro Preto', category: 'Histórico', city: 'Ouro Preto', state: 'MG', country: 'Brasil', priceLevel: 2, climate: 'Temperado' },
        { name: 'Chapada Diamantina', category: 'Natureza', city: 'Lençóis', state: 'BA', country: 'Brasil', priceLevel: 2, climate: 'Temperado' },
        { name: 'Roma', category: 'Histórico', city: 'Roma', state: 'Lazio', country: 'Itália', priceLevel: 4, climate: 'Temperado' },
        { name: 'Kyoto', category: 'Histórico', city: 'Kyoto', state: 'Kyoto', country: 'Japão', priceLevel: 4, climate: 'Temperado' },
        { name: 'Campos do Jordão', category: 'Montanha', city: 'Campos do Jordão', state: 'SP', country: 'Brasil', priceLevel: 3, climate: 'Frio' },
        { name: 'Jericoacoara', category: 'Praia', city: 'Jijoca', state: 'CE', country: 'Brasil', priceLevel: 3, climate: 'Quente' },
        { name: 'Bonito', category: 'Natureza', city: 'Bonito', state: 'MS', country: 'Brasil', priceLevel: 3, climate: 'Quente' },
        { name: 'Nova York', category: 'Urbano', city: 'Nova York', state: 'NY', country: 'EUA', priceLevel: 4, climate: 'Frio' },
        { name: 'Machu Picchu', category: 'Histórico', city: 'Cusco', state: 'Cusco', country: 'Peru', priceLevel: 4, climate: 'Frio' },
      ];

      const insertedDestinations = [];
      for (const dest of mockDestinations) {
        const d = await this.destRepo.create({ ...dest, createdAt: new Date(), updatedAt: new Date() });
        insertedDestinations.push(d);
      }

      // 3. Cria Usuários Didáticos (Com diferentes perfis de idade e localização - expandido para 50)
      const mockUsers = [
        { id: 'user_seeder_1', name: 'Ana Souza', age: 22, city: 'Santos', state: 'SP', country: 'Brasil' },
        { id: 'user_seeder_2', name: 'Carlos Lima', age: 31, city: 'Belo Horizonte', state: 'MG', country: 'Brasil' },
        { id: 'user_seeder_3', name: 'Juliana Costa', age: 45, city: 'Curitiba', state: 'PR', country: 'Brasil' },
        { id: 'user_seeder_4', name: 'Marcos Rocha', age: 58, city: 'Salvador', state: 'BA', country: 'Brasil' },
        { id: 'user_seeder_5', name: 'Beatriz Melo', age: 27, city: 'Porto Alegre', state: 'RS', country: 'Brasil' },
      ];

      const firstNames = [
        'Bruno', 'Camila', 'Daniel', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Letícia',
        'Mateus', 'Natália', 'Otávio', 'Patrícia', 'Rafael', 'Sofia', 'Thiago', 'Vanessa', 'Lucas', 'Larissa',
        'Rodrigo', 'Amanda', 'Gustavo', 'Fernanda', 'André', 'Carla', 'Ricardo', 'Aline', 'Marcelo', 'Camilla',
        'Diego', 'Mariana', 'Vitor', 'Luana', 'Gabriel', 'Bárbara', 'Alexandre', 'Jéssica', 'Fábio', 'Carolina',
        'Leonardo', 'Priscila', 'Renan', 'Daniela', 'Sandro', 'Tatiana'
      ];

      const lastNames = [
        'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
        'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Teixeira', 'Almeida', 'Lopes', 'Araújo', 'Melo', 'Barbosa',
        'Cardoso', 'Rocha', 'Nascimento', 'Moreira', 'Cavalcanti', 'Mendes', 'Vieira', 'Freitas', 'Cunha'
      ];

      const cities = [
        { city: 'São Paulo', state: 'SP' },
        { city: 'Rio de Janeiro', state: 'RJ' },
        { city: 'Belo Horizonte', state: 'MG' },
        { city: 'Porto Alegre', state: 'RS' },
        { city: 'Curitiba', state: 'PR' },
        { city: 'Salvador', state: 'BA' },
        { city: 'Recife', state: 'PE' },
        { city: 'Fortaleza', state: 'CE' },
        { city: 'Brasília', state: 'DF' },
        { city: 'Manaus', state: 'AM' }
      ];

      // Gera mais 45 usuários sintéticos para somar 50
      for (let i = 6; i <= 50; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[(i * 3) % lastNames.length];
        const cityObj = cities[i % cities.length];
        
        // Define o arquétipo (1 a 5)
        const archetype = ((i - 6) % 5) + 1;
        let age = 30;
        if (archetype === 1) age = 18 + (i % 11);
        else if (archetype === 2) age = 25 + (i % 41);
        else if (archetype === 3) age = 30 + (i % 31);
        else if (archetype === 4) age = 35 + (i % 41);
        else if (archetype === 5) age = 20 + (i % 26);

        mockUsers.push({
          id: `user_seeder_${i}`,
          name: `${firstName} ${lastName}`,
          age,
          city: cityObj.city,
          state: cityObj.state,
          country: 'Brasil'
        });
      }

      const userRepo = new UserRepository();
      const insertedUsers = [];
      for (const user of mockUsers) {
        const u = await userRepo.getOrCreateUser(user.id, {
          name: user.name,
          age: user.age,
          city: user.city,
          state: user.state,
          country: user.country,
        });
        insertedUsers.push(u);
      }

      // 4. Cria Interações comportamentais simulando perfis claros (Padrões para a IA descobrir)
      // Perfil 1 (Ana Souza, 22 anos, jovem, curte praias e quer economizar)
      // Perfil 2 (Carlos Lima, 31 anos, adulto, prefere natureza/histórico e preço médio)
      // Perfil 3 (Juliana Costa, 45 anos, madura, curte montanha e frio, orçamento alto)
      // Perfil 4 (Marcos Rocha, 58 anos, idoso, curte turismo histórico/urbano de luxo, clima temperado)
      // Perfil 5 (Beatriz Melo, 27 anos, jovem, curte urbano e frio)

      const interacRepo = new InteractionRepository();
      let interactionCount = 0;

      const addInteraction = async (userId: string, destIdx: number, rating: number, liked: boolean, days: number, cost: number) => {
        const dId = insertedDestinations[destIdx].id;
        await interacRepo.create({
          userId,
          destinationId: dId,
          rating,
          liked,
          travelDays: days,
          travelCost: cost,
          travelDate: '2026-08-15',
          createdAt: new Date(),
        });
        interactionCount++;
      };

      // Inserindo Interações dos 5 usuários iniciais para manter retrocompatibilidade
      await addInteraction('user_seeder_1', 0, 5, true, 7, 4500);  // Noronha: Curtiu (Preço Alto mas amou)
      await addInteraction('user_seeder_1', 8, 5, true, 5, 2000);  // Jeri: Curtiu bastante
      await addInteraction('user_seeder_1', 2, 4, true, 3, 1200);  // Rio de Janeiro: Curtiu
      await addInteraction('user_seeder_1', 1, 2, false, 4, 1800); // Gramado (Frio, não gostou muito)
      await addInteraction('user_seeder_1', 7, 2, false, 3, 2200); // Campos Jordão (Frio, detestou)
      await addInteraction('user_seeder_1', 4, 4, true, 6, 1100);  // Chapada (Barato, curtiu)

      await addInteraction('user_seeder_2', 4, 5, true, 8, 1500);  // Chapada Diamantina: Amou
      await addInteraction('user_seeder_2', 9, 5, true, 6, 2500);  // Bonito: Amou
      await addInteraction('user_seeder_2', 3, 4, true, 4, 1000);  // Ouro Preto: Gostou
      await addInteraction('user_seeder_2', 5, 4, true, 10, 8000); // Roma: Curtiu bastante
      await addInteraction('user_seeder_2', 10, 2, false, 5, 9000); // NY (Muito Urbano, frio)
      await addInteraction('user_seeder_2', 2, 3, false, 3, 1500); // Rio (Muito quente/urbano)

      await addInteraction('user_seeder_3', 1, 5, true, 6, 3200);  // Gramado: Amou
      await addInteraction('user_seeder_3', 7, 5, true, 4, 4000);  // Campos Jordão: Amou
      await addInteraction('user_seeder_3', 10, 4, true, 7, 8500); // NY: Curtiu (Frio)
      await addInteraction('user_seeder_3', 0, 2, false, 5, 7500); // Noronha: Detestou (Muito quente)
      await addInteraction('user_seeder_3', 8, 2, false, 4, 5000); // Jeri: Não curtiu
      await addInteraction('user_seeder_3', 11, 5, true, 8, 6500); // Machu Picchu: Amou (Frio/Montanha)

      await addInteraction('user_seeder_4', 5, 5, true, 12, 9500); // Roma: Excelente
      await addInteraction('user_seeder_4', 6, 5, true, 9, 11000); // Kyoto: Excelente
      await addInteraction('user_seeder_4', 3, 4, true, 5, 2000);  // Ouro Preto: Gostou
      await addInteraction('user_seeder_4', 11, 4, true, 7, 7000); // Machu Picchu: Gostou
      await addInteraction('user_seeder_4', 8, 1, false, 5, 4000); // Jeri (Sol/Praia, detesta)
      await addInteraction('user_seeder_4', 4, 2, false, 6, 3000); // Chapada (Muito rústico, não gostou)

      await addInteraction('user_seeder_5', 10, 5, true, 5, 7500); // NY: Amou
      await addInteraction('user_seeder_5', 2, 3, false, 4, 1800); // Rio: Muito quente
      await addInteraction('user_seeder_5', 1, 4, true, 4, 2000);  // Gramado: Gostou (Frio)
      await addInteraction('user_seeder_5', 7, 4, true, 3, 2500);  // Campos Jordão: Gostou
      await addInteraction('user_seeder_5', 8, 2, false, 5, 2100); // Jeri: Muito quente

      // Inserindo Interações comportamentais consistentes para os 45 usuários sintéticos adicionais (baseado no arquétipo)
      for (let i = 6; i <= 50; i++) {
        const userId = `user_seeder_${i}`;
        const archetype = ((i - 6) % 5) + 1;
        
        if (archetype === 1) { // Jovem Aventureiro (Noronha=0, Chapada=4, Jeri=8, Bonito=9, Rio=2)
          await addInteraction(userId, 0, 5, true, 7, 4200);
          await addInteraction(userId, 4, 4, true, 5, 1200);
          await addInteraction(userId, 8, 5, true, 6, 2100);
          await addInteraction(userId, 9, 4, true, 4, 2600);
          await addInteraction(userId, 2, 4, true, 3, 1500);
          await addInteraction(userId, 1, 2, false, 3, 2000); // detesta frio/Gramado
        } else if (archetype === 2) { // Estudioso de Cultura (Ouro Preto=3, Roma=5, Kyoto=6, Machu Picchu=11, NY=10)
          await addInteraction(userId, 3, 5, true, 4, 1100);
          await addInteraction(userId, 5, 5, true, 9, 8500);
          await addInteraction(userId, 6, 4, true, 8, 9800);
          await addInteraction(userId, 11, 5, true, 7, 6000);
          await addInteraction(userId, 10, 4, true, 5, 7800);
          await addInteraction(userId, 8, 1, false, 4, 4500); // detesta praia/Jeri
        } else if (archetype === 3) { // Montanha e Inverno (Gramado=1, Campos=7, Machu Picchu=11, NY=10)
          await addInteraction(userId, 1, 5, true, 5, 3300);
          await addInteraction(userId, 7, 5, true, 4, 3800);
          await addInteraction(userId, 11, 4, true, 6, 5800);
          await addInteraction(userId, 10, 4, true, 6, 8200);
          await addInteraction(userId, 0, 1, false, 5, 7000); // detesta praia quente/Noronha
          await addInteraction(userId, 2, 2, false, 3, 1600); // detesta Rio quente
        } else if (archetype === 4) { // Luxo Premium (Noronha=0, Gramado=1, Roma=5, Kyoto=6, NY=10, Machu Picchu=11)
          await addInteraction(userId, 0, 5, true, 8, 12000);
          await addInteraction(userId, 1, 4, true, 5, 6000);
          await addInteraction(userId, 5, 5, true, 10, 15000);
          await addInteraction(userId, 6, 5, true, 12, 18000);
          await addInteraction(userId, 10, 4, true, 7, 13000);
          await addInteraction(userId, 4, 2, false, 5, 2500); // acha rústico demais
        } else if (archetype === 5) { // Urbano Prático (Rio=2, NY=10, Roma=5)
          await addInteraction(userId, 2, 4, true, 4, 1800);
          await addInteraction(userId, 10, 5, true, 6, 8200);
          await addInteraction(userId, 5, 4, true, 8, 9200);
          await addInteraction(userId, 1, 4, true, 3, 2400); // Gramado
          await addInteraction(userId, 4, 1, false, 5, 1300); // detesta natureza rústica
          await addInteraction(userId, 9, 2, false, 4, 2800); // detesta Bonito
        }
      }

      return {
        users: insertedUsers.length,
        destinations: insertedDestinations.length,
        interactions: interactionCount,
      };
    } catch (error) {
      console.error('Erro ao semear o banco de dados didático:', error);
      throw error;
    }
  }
}

export class InteractionService {
  private interacRepo = new InteractionRepository();

  async getInteractions() {
    return await this.interacRepo.all();
  }

  async getUserInteractions(userId: string) {
    return await this.interacRepo.findByUserWithDestinations(userId);
  }

  async createInteraction(data: { userId: string; destinationId: number; rating: number; visited: boolean; liked: boolean; travelDays: number; travelCost: number; travelDate: string }) {
    return await this.interacRepo.create(data);
  }

  async deleteInteraction(id: number) {
    return await this.interacRepo.delete(id);
  }
}
