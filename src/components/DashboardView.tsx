/**
 * Vibe3p AI Recommendation Platform - Dashboard Component
 */

import React from 'react';
import { motion } from 'motion/react';
import { Database, MapPin, Activity, Brain, ShieldAlert, FileCode, CheckCircle, GraduationCap } from 'lucide-react';
import { User, Destination, TrainingStatus } from '../types.ts';

interface DashboardViewProps {
  users: User[];
  destinations: Destination[];
  interactionCount: number;
  trainingStatus: TrainingStatus | null;
  onNavigate: (tab: string) => void;
  onSeed: () => Promise<void>;
  isSeeding: boolean;
}

export default function DashboardView({
  users,
  destinations,
  interactionCount,
  trainingStatus,
  onNavigate,
  onSeed,
  isSeeding,
}: DashboardViewProps) {
  const latestSession = trainingStatus?.latestSession;

  return (
    <div className="space-y-8" id="dashboard-view">
      {/* Header com chamada didática */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
            <GraduationCap size={14} />
            Projeto de Estudo Acadêmico de IA
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Painel de recomendação e dados</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Esta plataforma ensina de forma prática como converter dados relacionais (PostgreSQL) em matrizes numéricas, treinar uma rede neural densa com <strong>TensorFlow.js</strong> no Node.js e realizar inferências de recomendação personalizadas em tempo real.
          </p>
        </div>
        {destinations.length === 0 && (
          <button
            onClick={onSeed}
            disabled={isSeeding}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSeeding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Populando...
              </>
            ) : (
              <>
                <Database size={18} />
                Popular Banco de Dados Didático
              </>
            )}
          </button>
        )}
      </div>

      {/* Grid de Estatísticas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Usuários Cadastrados',
            value: users.length,
            icon: <Database className="text-blue-500" size={24} />,
            desc: 'Perfis didáticos de teste',
            tab: 'users',
          },
          {
            title: 'Destinos Disponíveis',
            value: destinations.length,
            icon: <MapPin className="text-emerald-500" size={24} />,
            desc: 'Praias, montanhas e climas',
            tab: 'destinations',
          },
          {
            title: 'Amostras de Interações',
            value: interactionCount,
            icon: <Activity className="text-amber-500" size={24} />,
            desc: 'Dataset para alimentar as recomendações',
            tab: 'interactions',
          },
          {
            title: 'Sessões de Treino',
            value: trainingStatus?.latestSession ? 'Disponível' : 'Inativo',
            icon: <Brain className="text-indigo-500" size={24} />,
            desc: trainingStatus?.latestSession ? `Versão ${latestSession?.modelVersion}` : 'Modelo ainda não treinado',
            tab: 'training',
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            onClick={() => onNavigate(item.tab)}
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-slate-500">{item.title}</span>
              <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">{item.icon}</div>
            </div>
            <div className="mt-4 space-y-1">
              <h3 className="text-2xl font-bold text-slate-800">{item.value}</h3>
              <p className="text-xs text-slate-400 font-mono">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grid de Status da Aplicação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Painel de Modelo Ativo */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Brain className="text-indigo-600" size={20} />
              Modelo TensorFlow.js Ativo
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              O status indica se o modelo carregado em memória está pronto para processar as recomendações.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Status em Memória</span>
                {trainingStatus?.isLoaded ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    <CheckCircle size={12} />
                    Carregado (Ativo)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    <ShieldAlert size={12} />
                    Heurística Local (Inativo)
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Versão Ativa</span>
                <span className="text-sm font-mono text-slate-700">
                  {latestSession ? latestSession.modelVersion : 'v0.0.0 (Pre-train)'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Acurácia Validação</span>
                <span className="text-sm font-semibold text-slate-800">
                  {latestSession ? `${(latestSession.accuracy * 100).toFixed(1)}%` : '---'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Loss do Treinamento</span>
                <span className="text-sm font-mono text-slate-700">
                  {latestSession ? latestSession.loss.toFixed(4) : '---'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => onNavigate('training')}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 py-2.5 rounded-lg text-sm shadow-sm transition"
            >
              Treinar Modelo
            </button>
          </div>
        </div>

        {/* Infográfico do Fluxo do Pipeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FileCode className="text-indigo-600" size={20} />
            Fluxo da aplicação
          </h3>
          <p className="text-sm text-slate-500">
            Como um clique em um destino turístico vira uma recomendação por IA em nossa plataforma:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="border border-slate-100 rounded-lg p-4 bg-slate-50 space-y-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-700">Coleta e Banco</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Interações do usuário (ratings, likes, dias, custos) são gravadas no banco de dados relacional <strong>PostgreSQL</strong>.
              </p>
            </div>

            <div className="border border-slate-100 rounded-lg p-4 bg-slate-50 space-y-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-700">Processamento (X)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                O <strong>DatasetService</strong> realiza o One-Hot Encoding das categorias e clima e normaliza as features numéricas em matrizes.
              </p>
            </div>

            <div className="border border-slate-100 rounded-lg p-4 bg-slate-50 space-y-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-700">TensorFlow & IA</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Uma rede neural de 3 camadas aprende a correlação das features com o gosto do usuário e prevê scores de afinidade (0 a 1).
              </p>
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs p-3.5 rounded-lg flex items-center gap-3">
            <GraduationCap size={24} className="flex-shrink-0 text-indigo-600" />
            <span>
              <strong>Dica Acadêmica:</strong> Experimente usar o botão de popular dados didáticos acima, ir na aba <strong>Dataset</strong> para ver os vetores numéricos de entrada da rede neural e em seguida na aba <strong>Treinamento</strong> para ver o modelo aprendendo!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
