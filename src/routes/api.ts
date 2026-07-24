/**
 * Vibe3p AI Recommendation Platform - API Router
 * Define os endpoints REST e associa-os aos controladores protegidos por autenticação.
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import {
  UserController,
  DestinationController,
  InteractionController,
  TrainingController,
  RecommendationController
} from '../controllers/controllers.ts';

const router = Router();

const userController = new UserController();
const destController = new DestinationController();
const interController = new InteractionController();
const trainController = new TrainingController();
const recomController = new RecommendationController();

// --- Rotas de Usuário ---
router.get('/users', requireAuth, userController.list);
router.get('/users/profile', requireAuth, userController.getProfile);
router.post('/users/sync', requireAuth, userController.sync);
router.post('/users', requireAuth, userController.create);
router.put('/users/:id', requireAuth, userController.update);
router.delete('/users/:id', requireAuth, userController.delete);

// --- Rotas de Destinos ---
router.get('/destinations', requireAuth, destController.list);
router.post('/destinations', requireAuth, destController.create);
router.put('/destinations/:id', requireAuth, destController.update);
router.delete('/destinations/:id', requireAuth, destController.delete);
router.post('/destinations/seed', requireAuth, destController.seed);

// --- Rotas de Interações ---
router.get('/interactions', requireAuth, interController.listAll);
router.get('/interactions/user', requireAuth, interController.listUserInteractions);
router.post('/interactions', requireAuth, interController.create);
router.delete('/interactions/:id', requireAuth, interController.delete);

// --- Rotas do TensorFlow.js (Treinamento) ---
router.post('/training/train', requireAuth, trainController.train);
router.get('/training/status', requireAuth, trainController.status);

// --- Rotas de Recomendações de IA ---
router.get('/recommendations', requireAuth, recomController.getRecommendations);

export default router;
