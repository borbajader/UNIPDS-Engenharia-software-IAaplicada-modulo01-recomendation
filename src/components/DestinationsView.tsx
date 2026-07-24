/**
 * Vibe3p AI Recommendation Platform - Destinations Component
 */

import React, { useState } from 'react';
import { PlusCircle, MapPin, DollarSign, Thermometer, Info, Edit2, Trash2, X } from 'lucide-react';
import { Destination } from '../types.ts';
import { CATEGORIES, CLIMATES } from '../constants.ts';

interface DestinationsViewProps {
  destinations: Destination[];
  onCreateDestination: (data: {
    name: string;
    category: string;
    city: string;
    state: string;
    country: string;
    priceLevel: number;
    climate: string;
  }) => Promise<void>;
  isCreating: boolean;
  onUpdateDestination: (id: number, data: {
    name: string;
    category: string;
    city: string;
    state: string;
    country: string;
    priceLevel: number;
    climate: string;
  }) => Promise<void>;
  onDeleteDestination: (id: number) => Promise<void>;
}

export default function DestinationsView({
  destinations,
  onCreateDestination,
  isCreating,
  onUpdateDestination,
  onDeleteDestination,
}: DestinationsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDestId, setEditingDestId] = useState<number | null>(null);

  // Campos do formulário
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [priceLevel, setPriceLevel] = useState(2);
  const [climate, setClimate] = useState(CLIMATES[0]);

  const handleOpenEdit = (dest: Destination) => {
    setEditingDestId(dest.id);
    setName(dest.name);
    setCategory(dest.category);
    setCity(dest.city);
    setState(dest.state);
    setCountry(dest.country);
    setPriceLevel(dest.priceLevel);
    setClimate(dest.climate);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingDestId(null);
    setName('');
    setCategory(CATEGORIES[0]);
    setCity('');
    setState('');
    setCountry('Brasil');
    setPriceLevel(2);
    setClimate(CLIMATES[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !state || !country) {
      alert('Por favor, preencha todos os campos do formulário de destino.');
      return;
    }

    const payload = {
      name,
      category,
      city,
      state,
      country,
      priceLevel: Number(priceLevel),
      climate,
    };

    if (editingDestId !== null) {
      await onUpdateDestination(editingDestId, payload);
    } else {
      await onCreateDestination(payload);
    }

    handleCloseForm();
  };

  return (
    <div className="space-y-8" id="destinations-view">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-800">Catálogo de Destinos</h3>
          <p className="text-xs text-slate-500">
            Estes destinos possuem atributos qualitativos (clima, categoria) mapeados como tensores para alimentar a IA.
          </p>
        </div>
        <button
          onClick={() => {
            if (showAddForm) {
              handleCloseForm();
            } else {
              setShowAddForm(true);
            }
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm"
        >
          {showAddForm ? <X size={16} /> : <PlusCircle size={16} />}
          {showAddForm ? 'Fechar Formulário' : 'Novo Destino'}
        </button>
      </div>

      {/* Formulário de Criação/Edição de Destino */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-inner grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4 col-span-1 md:col-span-3 flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-700">
              {editingDestId !== null ? `Editar Destino Turístico: ID ${editingDestId}` : 'Cadastrar Novo Destino Turístico'}
            </h4>
            <button type="button" onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome do Destino</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Fernando de Noronha"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Categoria de Turismo</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Clima</label>
            <select
              value={climate}
              onChange={(e) => setClimate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CLIMATES.map((cli) => (
                <option key={cli} value={cli}>{cli}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cidade / Estado</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Gramado"
                className="col-span-2 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="RS"
                maxLength={2}
                className="col-span-1 w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">País</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Brasil"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nível de Custo (1 a 4)</label>
            <select
              value={priceLevel}
              onChange={(e) => setPriceLevel(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={1}>1 - Muito Econômico</option>
              <option value={2}>2 - Moderado</option>
              <option value={3}>3 - Alto</option>
              <option value={4}>4 - Luxo / Premium</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 py-2.5 rounded-lg text-sm shadow-sm transition disabled:opacity-50"
            >
              {isCreating ? 'Salvando...' : editingDestId !== null ? 'Atualizar Destino' : 'Cadastrar Destino'}
            </button>
          </div>
        </form>
      )}

      {/* Grid de Destinos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            {/* Header com Categoria e Ações */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-start">
              <div className="max-w-[70%]">
                <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2">
                  {dest.category}
                </span>
                <h4 className="text-lg font-bold text-slate-800 leading-tight truncate" title={dest.name}>{dest.name}</h4>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-slate-400 text-[10px] font-mono">ID: {dest.id}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(dest)}
                    title="Editar Destino"
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => onDeleteDestination(dest.id)}
                    title="Remover Destino"
                    className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Informações de Atributos */}
            <div className="p-5 space-y-3 bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <MapPin size={14} className="text-slate-400" />
                <span className="truncate">{dest.city}, {dest.state} - {dest.country}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Thermometer size={14} className="text-indigo-500" />
                  <span className="font-semibold">{dest.climate}</span>
                </div>
                <div className="flex items-center gap-0.5 text-xs text-slate-600">
                  <DollarSign size={14} className="text-emerald-500" />
                  <span className="font-bold text-slate-700">Nível {dest.priceLevel}</span>
                  <div className="flex text-emerald-500 ml-1">
                    {Array.from({ length: dest.priceLevel }).map((_, i) => (
                      <DollarSign key={i} size={10} className="-ml-0.5" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {destinations.length === 0 && (
          <div className="col-span-3 py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-4">
            <Info size={32} className="mx-auto text-slate-300" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Nenhum destino turístico cadastrado.</p>
              <p className="text-xs">Clique em "Popular Banco de Dados Didático" na página inicial ou crie um novo destino acima!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
