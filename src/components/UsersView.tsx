/**
 * Vibe3p AI Recommendation Platform - Users Component
 */

import React, { useState, useEffect } from 'react';
import { UserCheck, Users, RefreshCw, HelpCircle, MapPin, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { User } from '../types.ts';

interface UsersViewProps {
  users: User[];
  currentUser: User | null;
  activeSimulatedId: string;
  onSimulateUser: (userId: string) => void;
  onSyncProfile: (data: { name: string; age: number; city: string; state: string; country: string }) => Promise<void>;
  isSyncing: boolean;
  onCreateUser: (data: { id: string; name: string; age: number; city: string; state: string; country: string }) => Promise<void>;
  onUpdateUser: (id: string, data: { name: string; age: number; city: string; state: string; country: string }) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

export default function UsersView({
  users,
  currentUser,
  activeSimulatedId,
  onSimulateUser,
  onSyncProfile,
  isSyncing,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}: UsersViewProps) {
  // Estado para "Meu Perfil"
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('Brasil');

  // Estados para Criação/Edição de outros usuários
  const [isCreating, setIsCreating] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Campos do Formulário para Novo/Editado Usuário
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState(30);
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formCountry, setFormCountry] = useState('Brasil');

  // Preenche o formulário se o usuário já estiver sincronizado no banco de dados
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setAge(currentUser.age || 25);
      setCity(currentUser.city || '');
      setState(currentUser.state || '');
      setCountry(currentUser.country || 'Brasil');
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !state || !country) {
      alert('Por favor, preencha todos os campos do formulário.');
      return;
    }
    // Restringe idade entre 0 e 100 de forma segura
    const boundedAge = Math.min(100, Math.max(0, Number(age)));
    onSyncProfile({ name, age: boundedAge, city, state, country });
  };

  const handleOpenCreate = () => {
    const randomId = `user_${Math.random().toString(36).substring(2, 9)}`;
    setFormId(randomId);
    setFormName('');
    setFormAge(30);
    setFormCity('');
    setFormState('');
    setFormCountry('Brasil');
    setIsCreating(true);
    setEditingUserId(null);
  };

  const handleOpenEdit = (user: User, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita simular ao clicar em Editar
    setFormId(user.id);
    setFormName(user.name);
    setFormAge(user.age);
    setFormCity(user.city);
    setFormState(user.state);
    setFormCountry(user.country);
    setEditingUserId(user.id);
    setIsCreating(false);
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingUserId(null);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCity || !formState || !formCountry) {
      alert('Por favor, preencha todos os campos do formulário.');
      return;
    }
    const boundedAge = Math.min(100, Math.max(0, Number(formAge)));

    if (isCreating) {
      await onCreateUser({
        id: formId,
        name: formName,
        age: boundedAge,
        city: formCity,
        state: formState,
        country: formCountry
      });
    } else if (editingUserId) {
      await onUpdateUser(editingUserId, {
        name: formName,
        age: boundedAge,
        city: formCity,
        state: formState,
        country: formCountry
      });
    }
    handleCancelForm();
  };

  const handleDeleteClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita simular ao clicar em Remover
    await onDeleteUser(id);
  };

  return (
    <div className="space-y-8" id="users-view">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Perfil do Usuário Ativo */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 lg:col-span-1 h-fit">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <UserCheck className="text-indigo-600" size={20} />
              Meu Perfil de Viajante
            </h3>
            <p className="text-xs text-slate-500">
              Gerencie seus dados demográficos para calibrar o algoritmo de IA.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Alice"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Idade (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cidade</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Curitiba"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estado</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Ex: PR"
                  maxLength={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">País</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Ex: Brasil"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSyncing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Sincronizar Perfil
                </>
              )}
            </button>
          </form>

          {/* Dica Didática */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-indigo-900 text-xs space-y-2">
            <h4 className="font-bold flex items-center gap-1.5">
              <HelpCircle size={14} />
              Como a IA usa esses dados?
            </h4>
            <p className="leading-relaxed">
              A idade é mapeada no vetor de features de treino (X) como uma variável normalizada (<code className="bg-indigo-100 font-semibold px-1 rounded">idade / 100</code>).
              Usuários jovens tendem a ter afinidades diferentes de usuários maduros no modelo aprendido.
            </p>
          </div>
        </div>

        {/* Lista de Usuários Disponíveis para Simulação */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Users className="text-indigo-600" size={20} />
                Gerenciar e Simular Viajantes (Modo Didático)
              </h3>
              <p className="text-xs text-slate-500">
                Adicione, altere, delete e simule perfis para testar as predições do TensorFlow.js.
              </p>
            </div>
            {!isCreating && editingUserId === null && (
              <button
                onClick={handleOpenCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 self-start sm:self-center"
              >
                <Plus size={14} />
                Novo Viajante
              </button>
            )}
          </div>

          {/* Formulário de Criação / Edição inline */}
          {(isCreating || editingUserId !== null) && (
            <div className="bg-slate-50 border border-indigo-100 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h4 className="text-sm font-bold text-slate-800">
                  {isCreating ? 'Adicionar Novo Viajante Sintético' : `Editar Viajante: ${formId}`}
                </h4>
                <button onClick={handleCancelForm} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isCreating && (
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Identificador Único (ID)</label>
                    <input
                      type="text"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value.replace(/\s+/g, '_'))}
                      placeholder="Ex: user_maria_99"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Maria Alice"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Idade (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formAge}
                    onChange={(e) => setFormAge(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Ex: Curitiba"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Estado</label>
                    <input
                      type="text"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      placeholder="Ex: PR"
                      maxLength={2}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">País</label>
                    <input
                      type="text"
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      placeholder="Ex: Brasil"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs transition font-semibold flex items-center gap-1"
                  >
                    <Check size={13} />
                    Salvar Viajante
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => {
              const isSelected = user.id === activeSimulatedId;
              return (
                <div
                  key={user.id}
                  onClick={() => onSimulateUser(user.id)}
                  className={`border rounded-xl p-4 transition cursor-pointer flex flex-col justify-between h-44 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-slate-800 truncate max-w-[150px]">{user.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]" title={user.id}>ID: {user.id}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {isSelected && (
                          <span className="bg-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Ativo
                          </span>
                        )}
                        <button
                          onClick={(e) => handleOpenEdit(user, e)}
                          title="Editar Viajante"
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(user.id, e)}
                          title="Remover Viajante"
                          className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-600 text-xs pt-4 border-t border-slate-100 mt-2">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-700">{user.age}</span> anos
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <MapPin size={13} className="text-slate-400" />
                      <span className="truncate">{user.city} - {user.state}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {users.length === 0 && (
              <div className="col-span-2 py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-2">
                <p className="text-sm font-semibold">Nenhum usuário cadastrado.</p>
                <p className="text-xs">Por favor, popule o banco de dados didático na Home ou registre seu perfil.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
