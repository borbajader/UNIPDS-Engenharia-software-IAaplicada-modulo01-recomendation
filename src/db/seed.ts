/**
 * Vibe3p AI Recommendation Platform - Database Seeder
 * Popula o PostgreSQL com dados sintéticos estruturados e balanceados para treinamento do modelo.
 */

import * as dotenv from 'dotenv';
// Carrega as variáveis do arquivo .env
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, destinations, interactions, recommendations, trainingSessions } from './schema.ts';

async function seed() {
  console.log('🌱 Iniciando a população do Banco de Dados Didático (PostgreSQL)...');

  const sqlHost = process.env.SQL_HOST;
  const sqlUser = process.env.SQL_USER;
  const sqlPassword = process.env.SQL_PASSWORD;
  const sqlDbName = process.env.SQL_DB_NAME;

  if (!sqlHost || !sqlUser || !sqlPassword || !sqlDbName) {
    console.error('❌ Erro: Variáveis de ambiente SQL_* não estão configuradas corretamente no .env.');
    process.exit(1);
  }

  // Inicializa o pool local de conexão para fechá-lo de forma segura ao término do script
  const pool = new Pool({
    host: sqlHost,
    user: sqlUser,
    password: sqlPassword,
    database: sqlDbName,
    max: 1,
  });

  const db = drizzle(pool);

  try {
    // 1. Limpa todas as tabelas na ordem de dependência para evitar conflitos de FK
    console.log('🧹 Limpando dados existentes de sessões anteriores...');
    await db.delete(recommendations);
    await db.delete(interactions);
    await db.delete(destinations);
    await db.delete(users);
    await db.delete(trainingSessions);

    // 2. Cria Destinos Didáticos (Diferentes categorias, preços e climas para a IA aprender padrões)
    console.log('📍 Cadastrando destinos turísticos didáticos...');
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
      const [d] = await db.insert(destinations).values({
        name: dest.name,
        category: dest.category,
        city: dest.city,
        state: dest.state,
        country: dest.country,
        priceLevel: dest.priceLevel,
        climate: dest.climate,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      insertedDestinations.push(d);
    }
    console.log(`✅ ${insertedDestinations.length} destinos turísticos inseridos.`);

    // 3. Cria Usuários Didáticos (Com diferentes perfis de idade e localização - expandido para 50)
    console.log('👥 Cadastrando perfis de viajantes sintéticos...');
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

    const insertedUsers = [];
    for (const u of mockUsers) {
      const [user] = await db.insert(users).values({
        id: u.id,
        name: u.name,
        age: u.age,
        city: u.city,
        state: u.state,
        country: u.country,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          name: u.name,
          age: u.age,
          city: u.city,
          state: u.state,
          country: u.country,
          updatedAt: new Date(),
        },
      }).returning();
      insertedUsers.push(user);
    }
    console.log(`✅ ${insertedUsers.length} usuários didáticos inseridos/atualizados.`);

    // 4. Cria Interações comportamentais simulando perfis claros (Padrões para a IA descobrir)
    console.log('📊 Cadastrando histórico de comportamento e avaliações de viagem (X/Y)...');
    let interactionCount = 0;

    const addInteraction = async (userId: string, destIdx: number, rating: number, liked: boolean, days: number, cost: number) => {
      const dId = insertedDestinations[destIdx].id;
      await db.insert(interactions).values({
        userId,
        destinationId: dId,
        rating,
        visited: true,
        liked,
        travelDays: days,
        travelCost: cost,
        travelDate: '2026-08-15',
        createdAt: new Date(),
      });
      interactionCount++;
    };

    // Inserindo Interações da Ana (Preferência: Praia e Quente = Gosta)
    await addInteraction('user_seeder_1', 0, 5, true, 7, 4500);  // Noronha: Curtiu (Preço Alto mas amou)
    await addInteraction('user_seeder_1', 8, 5, true, 5, 2000);  // Jeri: Curtiu bastante
    await addInteraction('user_seeder_1', 2, 4, true, 3, 1200);  // Rio de Janeiro: Curtiu
    await addInteraction('user_seeder_1', 1, 2, false, 4, 1800); // Gramado (Frio, não gostou muito)
    await addInteraction('user_seeder_1', 7, 2, false, 3, 2200); // Campos Jordão (Frio, detestou)
    await addInteraction('user_seeder_1', 4, 4, true, 6, 1100);  // Chapada (Barato, curtiu)

    // Inserindo Interações do Carlos (Preferência: Natureza e Histórico = Gosta)
    await addInteraction('user_seeder_2', 4, 5, true, 8, 1500);  // Chapada Diamantina: Amou
    await addInteraction('user_seeder_2', 9, 5, true, 6, 2500);  // Bonito: Amou
    await addInteraction('user_seeder_2', 3, 4, true, 4, 1000);  // Ouro Preto: Gostou
    await addInteraction('user_seeder_2', 5, 4, true, 10, 8000); // Roma: Curtiu bastante
    await addInteraction('user_seeder_2', 10, 2, false, 5, 9000); // NY (Muito Urbano, frio)
    await addInteraction('user_seeder_2', 2, 3, false, 3, 1500); // Rio (Muito quente/urbano)

    // Inserindo Interações da Juliana (Preferência: Montanha e Frio = Gosta)
    await addInteraction('user_seeder_3', 1, 5, true, 6, 3200);  // Gramado: Amou
    await addInteraction('user_seeder_3', 7, 5, true, 4, 4000);  // Campos Jordão: Amou
    await addInteraction('user_seeder_3', 10, 4, true, 7, 8500); // NY: Curtiu (Frio)
    await addInteraction('user_seeder_3', 0, 2, false, 5, 7500); // Noronha: Detestou (Muito quente)
    await addInteraction('user_seeder_3', 8, 2, false, 4, 5000); // Jeri: Não curtiu
    await addInteraction('user_seeder_3', 11, 5, true, 8, 6500); // Machu Picchu: Amou (Frio/Montanha)

    // Inserindo Interações do Marcos (Preferência: Histórico de Luxo = Gosta)
    await addInteraction('user_seeder_4', 5, 5, true, 12, 9500); // Roma: Excelente
    await addInteraction('user_seeder_4', 6, 5, true, 9, 11000); // Kyoto: Excelente
    await addInteraction('user_seeder_4', 3, 4, true, 5, 2000);  // Ouro Preto: Gostou
    await addInteraction('user_seeder_4', 11, 4, true, 7, 7000); // Machu Picchu: Gostou
    await addInteraction('user_seeder_4', 8, 1, false, 5, 4000); // Jeri (Sol/Praia, detesta)
    await addInteraction('user_seeder_4', 4, 2, false, 6, 3000); // Chapada (Muito rústico, não gostou)

    // Inserindo Interações da Beatriz (Preferência: Urbano e Frio = Gosta)
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

    console.log(`✅ ${interactionCount} interações didáticas cadastradas.`);
    console.log('\n🎉 População de banco de dados concluída com sucesso!');
    console.log('🚀 A base de dados didática está pronta para treinamento local da rede neural!');

  } catch (err) {
    console.error('❌ Erro inesperado ao semear dados:', err);
  } finally {
    await pool.end();
  }
}

seed();
