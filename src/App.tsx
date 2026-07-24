/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Vibe3p AI Recommendation Platform - Main Application Container
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Database,
  MapPin,
  Activity,
  Brain,
  Sparkles,
  Users,
  Compass,
  Cpu,
  Layers,
  Settings,
  HelpCircle,
  TrendingUp,
  LineChart
} from 'lucide-react';

import DashboardView from './components/DashboardView.tsx';
import UsersView from './components/UsersView.tsx';
import DestinationsView from './components/DestinationsView.tsx';
import DatasetView from './components/DatasetView.tsx';
import TrainingView from './components/TrainingView.tsx';
import InferenceView from './components/InferenceView.tsx';

import { User, Destination, TrainingStatus, JoinedRecommendation } from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Controla a abertura/fechamento do menu gaveta (drawer) em dispositivos móveis (celular)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  //Controla o modo compacto da barra lateral em computadores (exibe apenas os ícones para economizar espaço em telas menores).
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Banco de Dados States
  const [users, setUsers] = useState<User[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<JoinedRecommendation[]>([]);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);

  // Loading States
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCreatingDest, setIsCreatingDest] = useState(false);
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);
  const [isAddingInteraction, setIsAddingInteraction] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isRefreshingRecs, setIsRefreshingRecs] = useState(false);

  // Active Simulated User State (Simula o cabeçalho 'x-user-id')
  const [activeSimulatedId, setActiveSimulatedId] = useState<string>('user_seeder_1');

  // Carrega todos os dados demográficos e de pipeline
  const fetchAllData = async (userId: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    };

    try {
      // 1. Carrega usuários
      const usersRes = await fetch('/api/users', { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // 2. Carrega destinos
      const destsRes = await fetch('/api/destinations', { headers });
      if (destsRes.ok) {
        const destsData = await destsRes.json();
        setDestinations(destsData);
      }

      // 3. Carrega interações
      const intersRes = await fetch('/api/interactions', { headers });
      if (intersRes.ok) {
        const intersData = await intersRes.json();
        
        // Mapeia idade dos usuários para visualização didática no DatasetView
        const usersResObj = await fetch('/api/users', { headers });
        if (usersResObj.ok) {
          const usersList: User[] = await usersResObj.json();
          const userMap = new Map(usersList.map(u => [u.id, u]));
          
          const joinedInters = intersData.map((item: any) => {
            // Se o item for retornado no formato do join { interaction, destination }
            const i = item.interaction || item;
            const d = item.destination || { name: 'Desconhecido', category: 'N/A', priceLevel: 2, climate: 'Temperado', city: '', state: '', country: '' };
            const u = userMap.get(i.userId);
            return {
              interaction: i,
              destination: d,
              userName: u ? u.name : `Usuário (${i.userId.slice(-6)})`,
              userAge: u ? u.age : 30
            };
          });
          setInteractions(joinedInters);
        } else {
          setInteractions(intersData);
        }
      }

      // 4. Carrega status de treino do TFJS
      const statusRes = await fetch('/api/training/status', { headers });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setTrainingStatus(statusData);
      }

      // 5. Carrega Recomendações calculadas pela IA
      const recsRes = await fetch('/api/recommendations', { headers });
      if (recsRes.ok) {
        const recsData = await recsRes.json();
        setRecommendations(recsData);
      }
    } catch (err) {
      console.error('Erro ao ler dados da API:', err);
    }
  };

  // Executa carga inicial ou recarrega quando muda o usuário simulado
  useEffect(() => {
    fetchAllData(activeSimulatedId);
  }, [activeSimulatedId]);

  // Handler: Popular Banco de Dados Didático
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/destinations/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeSimulatedId,
        },
      });
      if (res.ok) {
        await fetchAllData(activeSimulatedId);
      } else {
        alert('Falha ao popular banco de dados.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Handler: Criar Destino Turístico
  const handleCreateDestination = async (data: any) => {
    setIsCreatingDest(true);
    try {
      const res = await fetch('/api/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeSimulatedId,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchAllData(activeSimulatedId);
      } else {
        alert('Falha ao cadastrar destino.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingDest(false);
    }
  };

  // Handler: Simular outro usuário
  const handleSimulateUser = (userId: string) => {
    setActiveSimulatedId(userId);
  };

  // Handler: Criar Usuário Novo
  const handleCreateUser = async (data: any) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeSimulatedId,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchAllData(activeSimulatedId);
      } else {
        const errData = await res.json();
        alert('Falha ao criar usuário: ' + (errData.error || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Editar Usuário Existente
  const handleUpdateUser = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeSimulatedId,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchAllData(activeSimulatedId);
      } else {
        const errData = await res.json();
        alert('Falha ao atualizar usuário: ' + (errData.error || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Remover Usuário Existente
  const handleDeleteUser = async (id: string) => {
    if (!confirm('Deseja realmente remover este viajante? Todas as suas interações e recomendações serão apagadas.')) {
      return;
    }
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeSimulatedId,
        },
      });
      if (res.ok) {
        const remainingUsers = users.filter(u => u.id !== id);
        if (id === activeSimulatedId) {
          if (remainingUsers.length > 0) {
            setActiveSimulatedId(remainingUsers[0].id);
          } else {
            setActiveSimulatedId('');
          }
        } else {
          await fetchAllData(activeSimulatedId);
        }
      } else {
        alert('Falha ao remover usuário.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Editar Destino Existente
  const handleUpdateDestination = async (id: number, data: any) => {
    try {
      const res = await fetch(`/api/destinations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeSimulatedId,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchAllData(activeSimulatedId);
      } else {
        const errData = await res.json();
        alert('Falha ao atualizar destino: ' + (errData.error || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Remover Destino Existente
  const handleDeleteDestination = async (id: number) => {
    if (!confirm('Deseja realmente remover este destino? Todas as interações associadas serão removidas do dataset de treino.')) {
      return;
    }
    try {
      const res = await fetch(`/api/destinations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeSimulatedId,
        },
      });
      if (res.ok) {
        await fetchAllData(activeSimulatedId);
      } else {
        alert('Falha ao remover destino.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Sincronizar dados demográficos de Perfil
  const handleSyncProfile = async (data: any) => {
    setIsSyncingProfile(true);
    try {
      const res = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeSimulatedId,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchAllData(activeSimulatedId);
      } else {
        alert('Falha ao sincronizar perfil de viajante.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncingProfile(false);
    }
  };

  // Handler: Adicionar interação/avaliação de viagem
  const handleAddInteraction = async (data: any) => {
    setIsAddingInteraction(true);
    try {
      const res = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeSimulatedId,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchAllData(activeSimulatedId);
      } else {
        alert('Falha ao registrar feedback.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingInteraction(false);
    }
  };

  // Handler: Deletar interação
  const handleDeleteInteraction = async (id: number) => {
    try {
      const res = await fetch(`/api/interactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeSimulatedId,
        },
      });
      if (res.ok) {
        await fetchAllData(activeSimulatedId);
      } else {
        alert('Falha ao deletar interação.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Treinar Rede Neural
  const handleTrainModel = async (epochs: number, layer1Units?: number, layer2Units?: number) => {
    setIsTraining(true);
    try {
      const res = await fetch('/api/training/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeSimulatedId,
        },
        body: JSON.stringify({ epochs, layer1Units, layer2Units }),
      });
      if (res.ok) {
        const result = await res.json();
        await fetchAllData(activeSimulatedId);
        return result;
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao treinar modelo.');
      }
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsTraining(false);
    }
  };

  // Handler: Recalcular predições
  const handleRefreshRecommendations = async () => {
    setIsRefreshingRecs(true);
    try {
      const res = await fetch('/api/recommendations', {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeSimulatedId,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
        
        // Recarrega status de treino para atualizar a interface
        const statusRes = await fetch('/api/training/status', {
          headers: { 'x-user-id': activeSimulatedId }
        });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setTrainingStatus(statusData);
        }
      } else {
        alert('Falha ao gerar novas recomendações.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshingRecs(false);
    }
  };

  // Identifica o nome do viajante ativo simulado
  const activeUser = users.find(u => u.id === activeSimulatedId);
  const activeUserName = activeUser ? activeUser.name : 'Simulador de Viagem';

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar de Navegação - Tema Professional Polish */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between select-none border-r border-slate-800">
        <div>
          {/* Logo e Título */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-extrabold text-xs italic text-white shadow-sm">
                V3
              </div>
              <h1 className="text-base font-bold tracking-tight">Vibe3p AI</h1>
            </div>
          </div>

          {/* Menus de Navegação */}
          <nav className="py-4 space-y-1.5">
            <div className="px-6 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Gerenciamento
            </div>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-6 py-2.5 transition text-xs font-semibold ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white border-l-4 border-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers size={15} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-6 py-2.5 transition text-xs font-semibold ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white border-l-4 border-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users size={15} />
              <span>Viajantes & Perfis</span>
            </button>

            <button
              onClick={() => setActiveTab('destinations')}
              className={`w-full flex items-center gap-3 px-6 py-2.5 transition text-xs font-semibold ${
                activeTab === 'destinations'
                  ? 'bg-blue-600 text-white border-l-4 border-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass size={15} />
              <span>Catálogo de Destinos</span>
            </button>

            <div className="px-6 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-4">
              Pipeline de IA
            </div>

            <button
              onClick={() => setActiveTab('dataset')}
              className={`w-full flex items-center gap-3 px-6 py-2.5 transition text-xs font-semibold ${
                activeTab === 'dataset'
                  ? 'bg-blue-600 text-white border-l-4 border-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database size={15} />
              <span>Dataset de Treino</span>
            </button>

            <button
              onClick={() => setActiveTab('training')}
              className={`w-full flex items-center gap-3 px-6 py-2.5 transition text-xs font-semibold ${
                activeTab === 'training'
                  ? 'bg-blue-600 text-white border-l-4 border-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Cpu size={15} />
              <span>Treinamento (TFJS)</span>
            </button>

            <button
              onClick={() => setActiveTab('inference')}
              className={`w-full flex items-center gap-3 px-6 py-2.5 transition text-xs font-semibold ${
                activeTab === 'inference'
                  ? 'bg-blue-600 text-white border-l-4 border-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles size={15} />
              <span>Predições / Recomendação</span>
            </button>
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 font-medium space-y-1">
          <div>
            Status do Sistema: <span className="text-emerald-400 font-semibold">Pronto</span>
          </div>
        </div>
      </aside>

      {/* Main Content Container - Tema Professional Polish */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Barra de Status e Ações Rápida */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 select-none shadow-sm z-10">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Viajante Ativo</span>
              <span className="text-xs font-bold text-slate-700">{activeUserName}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Acurácia Validação</span>
              <span className={`text-xs font-bold ${trainingStatus?.latestSession ? 'text-emerald-600' : 'text-slate-500'}`}>
                {trainingStatus?.latestSession ? `${(trainingStatus.latestSession.accuracy * 100).toFixed(1)}%` : '---'}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {destinations.length === 0 && (
              <button
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition shadow-sm disabled:opacity-50"
              >
                {isSeeding ? 'Populando...' : 'POPULAR BANCO DIDÁTICO'}
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('training');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-1.5"
            >
              <Cpu size={14} />
              NOVO TREINAMENTO
            </button>
          </div>
        </header>

        {/* Viewport de Conteúdo Rolável */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
          {activeTab === 'dashboard' && (
            <DashboardView
              users={users}
              destinations={destinations}
              interactionCount={interactions.length}
              trainingStatus={trainingStatus}
              onNavigate={(tab) => {
                setActiveTab(tab);
              }}
              onSeed={handleSeedDatabase}
              isSeeding={isSeeding}
            />
          )}

          {activeTab === 'users' && (
            <UsersView
              users={users}
              currentUser={activeUser || null}
              activeSimulatedId={activeSimulatedId}
              onSimulateUser={handleSimulateUser}
              onSyncProfile={handleSyncProfile}
              isSyncing={isSyncingProfile}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'destinations' && (
            <DestinationsView
              destinations={destinations}
              onCreateDestination={handleCreateDestination}
              isCreating={isCreatingDest}
              onUpdateDestination={handleUpdateDestination}
              onDeleteDestination={handleDeleteDestination}
            />
          )}

          {activeTab === 'dataset' && (
            <DatasetView
              destinations={destinations}
              interactions={interactions}
              onAddInteraction={handleAddInteraction}
              onDeleteInteraction={handleDeleteInteraction}
              isAdding={isAddingInteraction}
            />
          )}

          {activeTab === 'training' && (
            <TrainingView
              trainingStatus={trainingStatus}
              onTrainModel={handleTrainModel}
              isTraining={isTraining}
            />
          )}

          {activeTab === 'inference' && (
            <InferenceView
              recommendations={recommendations}
              isModelLoaded={!!(trainingStatus?.isLoaded)}
              onRefreshRecommendations={handleRefreshRecommendations}
              isRefreshing={isRefreshingRecs}
              activeUserName={activeUserName}
            />
          )}
        </div>
      </main>
    </div>
  );
}
