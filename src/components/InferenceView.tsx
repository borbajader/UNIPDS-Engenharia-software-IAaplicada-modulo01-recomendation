/**
 * Vibe3p AI Recommendation Platform - Inference Component
 */

import React from 'react';
import { Sparkles, MapPin, Thermometer, DollarSign, Brain, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { JoinedRecommendation } from '../types.ts';

interface InferenceViewProps {
  recommendations: JoinedRecommendation[];
  isModelLoaded: boolean;
  onRefreshRecommendations: () => Promise<void>;
  isRefreshing: boolean;
  activeUserName: string;
}

export default function InferenceView({
  recommendations,
  isModelLoaded,
  onRefreshRecommendations,
  isRefreshing,
  activeUserName,
}: InferenceViewProps) {
  return (
    <div className="space-y-8 animate-fade-in" id="inference-view">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={24} />
            Recomendações do Perfil
          </h3>
          <p className="text-xs text-slate-500">
            Scores e sugestões calculados para o perfil de <strong>{activeUserName}</strong>.
          </p>
        </div>
        <button
          onClick={onRefreshRecommendations}
          disabled={isRefreshing}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={16} />
          {isRefreshing ? 'Calculando...' : 'Recalcular Recomendações'}
        </button>
      </div>

      {/* Grid de Recomendações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((item, index) => {
          const rec = item.recommendation;
          const dest = item.destination;
          const percentage = (rec.score * 100).toFixed(1);

          return (
            <div
              key={rec.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              {/* Header com Ranking e Categoria */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-extrabold text-indigo-700 text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <span className="inline-block bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-0.5">
                      {dest.category}
                    </span>
                    <h4 className="text-lg font-bold text-slate-800 leading-tight">{dest.name}</h4>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 text-[10px] font-mono">ID: {dest.id}</span>
                  {isModelLoaded ? (
                    <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                      <Brain size={10} /> Neural
                    </span>
                  ) : (
                    <span className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5 mt-1">
                      <Info size={10} /> Heurístico
                    </span>
                  )}
                </div>
              </div>

              {/* Corpo com Indicadores de Confiança */}
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Afinidade de Viagem</span>
                    <span className="font-mono font-bold text-indigo-600 text-sm">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="truncate">{dest.city}, {dest.state}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Thermometer size={14} className="text-indigo-500" />
                    <span>Clima {dest.climate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <DollarSign size={14} className="text-emerald-500" />
                    <span className="font-semibold">Nível de Custo {dest.priceLevel}</span>
                    <div className="flex text-emerald-500">
                      {Array.from({ length: dest.priceLevel }).map((_, i) => (
                        <DollarSign key={i} size={11} className="-ml-1" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {recommendations.length === 0 && (
          <div className="col-span-2 py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-4 bg-white shadow-sm">
            <Info size={32} className="mx-auto text-slate-300" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Nenhuma recomendação calculada.</p>
              <p className="text-xs">Certifique-se de popular o banco didático de teste ou cadastrar destinos turísticos.</p>
            </div>
          </div>
        )}
      </div>

      {/* Caixa didática sobre o motor de recomendações */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-indigo-900 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="font-bold flex items-center gap-1.5 text-sm">
            <Brain className="text-indigo-600" size={16} />
            Como o Modelo Faz Predições de Score?
          </h4>
          <p className="text-xs leading-relaxed text-indigo-950">
            Quando você solicita novas recomendações, a aplicação lê seu perfil ativo (idade, localização) e seu histórico de viagens (dias e custo) e executa o seguinte fluxo:
          </p>
          <ul className="text-xs space-y-1.5 pl-4 list-disc text-indigo-950">
            <li>
              O <code>PredictionService</code> constrói um vetor X para o seu perfil cruzado com <strong>cada um dos destinos</strong> cadastrados.
            </li>
            <li>
              Se o modelo TensorFlow.js estiver ativo na memória, executamos uma inferência em lote (<code>model.predict(inputTensor)</code>) que calcula de forma síncrona a afinidade de todos os locais simultaneamente.
            </li>
            <li>
              Os scores gerados são salvos na tabela de <code>recommendations</code> do PostgreSQL e os top 5 com maiores scores são apresentados acima.
            </li>
          </ul>
        </div>
        <div className="border-l border-indigo-200/60 pl-0 md:pl-6 space-y-3 flex flex-col justify-center">
          <h4 className="font-bold text-sm">Interação e Aprendizado Contínuo</h4>
          <p className="text-xs leading-relaxed text-indigo-950">
            O comportamento do sistema é dinâmico: ao adicionar avaliações na aba de <strong>Dataset</strong> ou alternar o perfil de viajante na aba de <strong>Usuários</strong>, o histórico de comportamento muda e os scores das recomendações se adaptam ao gosto atual.
          </p>
        </div>
      </div>
    </div>
  );
}
