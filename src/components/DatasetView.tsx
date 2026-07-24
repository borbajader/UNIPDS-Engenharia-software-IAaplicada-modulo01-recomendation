/**
 * Vibe3p AI Recommendation Platform - Dataset and Preprocessing Component
 */

import React, { useState } from 'react';
import { Database, Plus, Trash2, HelpCircle, Binary, Calendar, DollarSign, Clock, Star, ThumbsUp } from 'lucide-react';
import { User, Destination, Interaction } from '../types.ts';
import { CATEGORIES, CLIMATES } from '../constants.ts';

interface DatasetViewProps {
  destinations: Destination[];
  interactions: any[]; // Joined interactions or basic interactions
  onAddInteraction: (data: {
    destinationId: number;
    rating: number;
    visited: boolean;
    liked: boolean;
    travelDays: number;
    travelCost: number;
    travelDate: string;
  }) => Promise<void>;
  onDeleteInteraction: (id: number) => Promise<void>;
  isAdding: boolean;
}

export default function DatasetView({
  destinations,
  interactions,
  onAddInteraction,
  onDeleteInteraction,
  isAdding,
}: DatasetViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [destId, setDestId] = useState('');
  const [rating, setRating] = useState(5);
  const [liked, setLiked] = useState(true);
  const [days, setDays] = useState(7);
  const [cost, setCost] = useState(3000);
  const [date, setDate] = useState('2026-08-15');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destId) {
      alert('Por favor, selecione um destino.');
      return;
    }
    await onAddInteraction({
      destinationId: Number(destId),
      rating: Number(rating),
      visited: true,
      liked,
      travelDays: Number(days),
      travelCost: Number(cost),
      travelDate: date,
    });
    setDestId('');
    setShowAddForm(false);
  };

  // Helper didático para simular como o DatasetService processa esta linha de dados em X
  const getDemoVector = (age: number, dest: Destination, days: number, cost: number) => {
    const normAge = (age / 100).toFixed(2);
    const normPrice = (dest.priceLevel / 4).toFixed(2);
    const normDays = (days / 30).toFixed(2);
    const normCost = (cost / 10000).toFixed(2);

    // One-hot categories
    const catVec = CATEGORIES.map(c => c === dest.category ? '1' : '0');
    // One-hot climate
    const cliVec = CLIMATES.map(c => c === dest.climate ? '1' : '0');

    return `[${normAge}, ${catVec.join(', ')}, ${normPrice}, ${cliVec.join(', ')}, ${normDays}, ${normCost}]`;
  };

  return (
    <div className="space-y-8 animate-fade-in" id="dataset-view">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="text-indigo-600" size={24} />
            Pré-processamento & Dataset
          </h3>
          <p className="text-xs text-slate-500">
            Mapeamento didático dos dados relacionais do PostgreSQL em tensores normalizados prontos para a rede neural.
          </p>
        </div>
        {destinations.length > 0 && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus size={16} />
            {showAddForm ? 'Fechar Formulário' : 'Registrar Interação'}
          </button>
        )}
      </div>

      {/* Formulário de Registro de Comportamento / Feedback do Usuário */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-4 border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-700">Registrar Novo Feedback do Viajante Ativo</h4>
            <p className="text-xs text-slate-400 mt-0.5">Adicione avaliações de viagem para recalibrar as predições do TensorFlow.js.</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Selecione o Destino</label>
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Selecionar Destino Turístico --</option>
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nota (1 a 5 Estrelas)</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} {n === 5 ? '★ (Excelente)' : '★'}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={liked}
                onChange={(e) => setLiked(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                <ThumbsUp size={14} className="text-indigo-500" />
                Gostou do Destino? (Label Y)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Duração (Dias)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="number"
                min="1"
                max="30"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Custo Total (R$)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="number"
                min="100"
                max="100000"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Data Prevista</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isAdding}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition shadow-sm disabled:opacity-50"
            >
              {isAdding ? 'Registrando...' : 'Salvar Interação'}
            </button>
          </div>
        </form>
      )}

      {/* Tabela de Preprocessing Visual (X & Y) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="space-y-0.5">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Binary size={16} className="text-indigo-600" />
              Dataset de Treino Ativo (Visão de Tensores)
            </h4>
            <p className="text-xs text-slate-400">Dados reais organizados em um formato estruturado para o fluxo de recomendação.</p>
          </div>
          <span className="text-xs font-mono bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
            {interactions.length} Amostras
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <th className="p-4">ID</th>
                <th className="p-4">Viajante (Idade)</th>
                <th className="p-4">Destino (Categ/Clima)</th>
                <th className="p-4">Parâmetros (Dias/Custo)</th>
                <th className="p-4">Feedback (Y)</th>
                <th className="p-4 font-mono text-indigo-600">Vetor de Features de Entrada (X - 12D)</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interactions.map((joined) => {
                const i = joined.interaction;
                const d = joined.destination;
                // Como não temos o objeto user inteiro aqui de forma síncrona se não estiver joined,
                // vamos deduzir a idade ou usar um placeholder
                const travelerAge = joined.userAge || 30; // Idade fallback didática
                const travelerName = joined.userName || `Usuário (${i.userId.slice(-6)})`;

                return (
                  <tr key={i.id} className="hover:bg-slate-50/40 transition">
                    <td className="p-4 font-mono text-slate-400">{i.id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{travelerName}</div>
                      <div className="text-slate-400 font-mono text-[10px]">{travelerAge} anos</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{d.name}</div>
                      <div className="text-slate-400 text-[10px] uppercase tracking-wide">
                        {d.category} • {d.climate}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600">{i.travelDays} dias</div>
                      <div className="text-slate-400 font-mono">R$ {i.travelCost.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              size={11}
                              fill={idx < i.rating ? 'currentColor' : 'none'}
                              className={idx < i.rating ? 'text-amber-400' : 'text-slate-200'}
                            />
                          ))}
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          i.liked || i.rating >= 4
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          Y = {i.liked || i.rating >= 4 ? '1' : '0'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-indigo-600 select-all max-w-xs truncate" title="Clima, Categoria, Preço, Dias, Custo">
                      {getDemoVector(travelerAge, d, i.travelDays, i.travelCost)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onDeleteInteraction(i.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
                        title="Excluir amostra"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {interactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 border-t border-slate-100">
                    <div className="space-y-2">
                      <HelpCircle size={28} className="mx-auto text-slate-300" />
                      <p className="text-sm font-semibold">Nenhuma interação registrada no dataset.</p>
                      <p className="text-xs">Clique em "Popular Banco de Dados" na Home ou registre uma nova acima.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Caixa didática de explicação sobre One-Hot Encoding e Normalização */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-indigo-900 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="font-bold flex items-center gap-1.5 text-sm">
            <HelpCircle size={16} />
            Como funciona o Vetor de Entrada (X)?
          </h4>
          <p className="text-xs leading-relaxed text-indigo-950">
            Algoritmos de rede neural não compreendem palavras textuais (ex: "Praia", "Montanha") ou números com escalas disparates (ex: R$ 8.000 vs 5 dias). Para alimentar o TensorFlow.js, realizamos:
          </p>
          <ul className="text-xs space-y-1.5 pl-4 list-disc text-indigo-950">
            <li>
              <strong>One-Hot Encoding:</strong> Mapeamos categorias exclusivas em colunas binárias. A categoria <code>Praia</code> vira <code>[1, 0, 0, 0, 0]</code> no subvetor.
            </li>
            <li>
              <strong>Normalização Linear:</strong> Comprimimos valores para a escala [0, 1]. Exemplo: <code>idade / 100</code> e <code>custo / 10000</code>.
            </li>
          </ul>
        </div>
        <div className="border-l border-indigo-200/60 pl-0 md:pl-6 space-y-3">
          <h4 className="font-bold text-sm">Arquitetura do Vetor X (12 dimensões):</h4>
          <div className="bg-indigo-950 text-indigo-100 font-mono text-[10px] p-4 rounded-lg leading-relaxed shadow-inner">
            <div className="text-indigo-400">// Índices das features no tensor:</div>
            <div>[0] : Idade (0.00 - 1.00)</div>
            <div>[1..5] : Categoria One-Hot (Praia, Montanha, Histórico, Urbano, Natureza)</div>
            <div>[6] : Nível de Custo (0.25, 0.50, 0.75, 1.00)</div>
            <div>[7..9] : Clima One-Hot (Quente, Frio, Temperado)</div>
            <div>[10] : Dias de viagem normalizados (dias / 30)</div>
            <div>[11] : Orçamento estimado normalizado (custo / 10000)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
