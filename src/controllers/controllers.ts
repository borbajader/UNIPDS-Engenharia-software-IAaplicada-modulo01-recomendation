/**
 * Vibe3p AI Recommendation Platform - Controllers
 * Controladores do Express para intermediar requisições HTTP e as camadas de Serviços.
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { UserService, DestinationService, InteractionService } from '../services/ModelsService.ts';
import { TrainingService } from '../services/TrainingService.ts';
import { PredictionService } from '../services/PredictionService.ts';
import { DatasetService } from '../services/DatasetService.ts';
import { TrainingSessionRepository } from '../repositories/ModelsRepository.ts';

const userService = new UserService();
const destService = new DestinationService();
const interService = new InteractionService();
const trainService = new TrainingService();
const predService = new PredictionService();
const datasetService = new DatasetService();
const trainingRepo = new TrainingSessionRepository();

// 1. UserController
export class UserController {
  async list(req: AuthRequest, res: Response) {
    try {
      const usersList = await userService.getUsers();
      res.json(usersList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async sync(req: AuthRequest, res: Response) {
    try {
      const uid = req.user.uid;
      const { name, age, city, state, country } = req.body;
      if (!name || !age || !city || !state || !country) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes: name, age, city, state, country.' });
      }
      const updatedUser = await userService.syncUser(uid, { name, age, city, state, country });
      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const uid = req.user.uid;
      const user = await userService.getUser(uid);
      if (!user) {
        return res.status(404).json({ error: 'Perfil não cadastrado no banco de dados local.' });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { id, name, age, city, state, country } = req.body;
      if (!id || !name || age === undefined || !city || !state || !country) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes: id, name, age, city, state, country.' });
      }
      const newUser = await userService.createUser({ id, name, age: Number(age), city, state, country });
      res.status(201).json(newUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id;
      const { name, age, city, state, country } = req.body;
      if (!name || age === undefined || !city || !state || !country) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes: name, age, city, state, country.' });
      }
      const updated = await userService.updateUser(id, { name, age: Number(age), city, state, country });
      if (!updated) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id;
      const deleted = await userService.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      res.json({ message: 'Usuário removido com sucesso.', deleted });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

// 2. DestinationController
export class DestinationController {
  async list(req: AuthRequest, res: Response) {
    try {
      const list = await destService.getDestinations();
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { name, category, city, state, country, priceLevel, climate } = req.body;
      if (!name || !category || !city || !state || !country || !priceLevel || !climate) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes para criar destino.' });
      }
      const newDest = await destService.createDestination({ name, category, city, state, country, priceLevel, climate });
      res.status(201).json(newDest);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const { name, category, city, state, country, priceLevel, climate } = req.body;
      if (!name || !category || !city || !state || !country || priceLevel === undefined || !climate) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes para atualizar destino.' });
      }
      const updated = await destService.updateDestination(id, { name, category, city, state, country, priceLevel: Number(priceLevel), climate });
      if (!updated) {
        return res.status(404).json({ error: 'Destino não encontrado.' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const deleted = await destService.deleteDestination(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Destino não encontrado.' });
      }
      res.json({ message: 'Destino removido com sucesso.', deleted });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async seed(req: AuthRequest, res: Response) {
    try {
      const counts = await destService.seedDatabase();
      res.json({
        message: 'Banco de dados didático populado com sucesso!',
        counts
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

// 3. InteractionController
export class InteractionController {
  async listAll(req: AuthRequest, res: Response) {
    try {
      const all = await interService.getInteractions();
      res.json(all);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async listUserInteractions(req: AuthRequest, res: Response) {
    try {
      const uid = req.user.uid;
      const userList = await interService.getUserInteractions(uid);
      res.json(userList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const uid = req.user.uid;
      const { destinationId, rating, visited, liked, travelDays, travelCost, travelDate } = req.body;
      if (destinationId === undefined || rating === undefined || travelDays === undefined || travelCost === undefined || !travelDate) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes para registrar interação.' });
      }

      const newInter = await interService.createInteraction({
        userId: uid,
        destinationId: Number(destinationId),
        rating: Number(rating),
        visited: !!visited,
        liked: !!liked,
        travelDays: Number(travelDays),
        travelCost: Number(travelCost),
        travelDate,
      });

      // Atualiza as recomendações do usuário instantaneamente com base no novo comportamento
      try {
        await predService.generateRecommendations(uid);
      } catch (predErr) {
        console.error('Erro ao recalcular recomendações após interação:', predErr);
      }

      res.status(201).json(newInter);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = Number(req.params.id);
      const deleted = await interService.deleteInteraction(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Interação não encontrada.' });
      }
      res.json({ message: 'Interação removida com sucesso.', deleted });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

// 4. TrainingController
export class TrainingController {
  async train(req: AuthRequest, res: Response) {
    try {
      const epochs = req.body.epochs ? Number(req.body.epochs) : 50;
      const layer1Units = req.body.layer1Units ? Number(req.body.layer1Units) : 16;
      const layer2Units = req.body.layer2Units ? Number(req.body.layer2Units) : 8;

      // Validações didáticas de limites (épocas até 500, neurônios até 5x o valor padrão de 16 e 8)
      if (epochs < 1 || epochs > 500) {
        return res.status(400).json({ error: 'O número de épocas deve estar entre 1 e 500 para estudo.' });
      }
      if (layer1Units < 1 || layer1Units > 80) {
        return res.status(400).json({ error: 'O número de neurônios da Camada 1 deve estar entre 1 e 80 (até 5x o valor padrão 16).' });
      }
      if (layer2Units < 1 || layer2Units > 40) {
        return res.status(400).json({ error: 'O número de neurônios da Camada 2 deve estar entre 1 e 40 (até 5x o valor padrão 8).' });
      }

      const results = await trainService.trainModel(epochs, layer1Units, layer2Units);
      res.json(results);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async status(req: AuthRequest, res: Response) {
    try {
      const statusInfo = await trainService.getActiveModelStatus();
      const dataset = await datasetService.generateDataset();
      res.json({
        ...statusInfo,
        datasetSize: dataset.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

// 5. RecommendationController
export class RecommendationController {
  async getRecommendations(req: AuthRequest, res: Response) {
    try {
      const uid = req.user.uid;
      const recs = await predService.generateRecommendations(uid);
      res.json(recs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
