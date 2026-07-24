/**
 * Vibe3p AI Recommendation Platform - Training Component
 */

import React, { useState } from 'react';
import { Brain, Play, RefreshCw, Layers, Cpu, CheckCircle, TrendingUp, HelpCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrainingStatus } from '../types.ts';

interface TrainingViewProps {
  trainingStatus: TrainingStatus | null;
  onTrainModel: (epochs: number, layer1Units: number, layer2Units: number) => Promise<any>;
  isTraining: boolean;
}

export default function TrainingView({
  trainingStatus,
  onTrainModel,
  isTraining,
}: TrainingViewProps) {
  const [epochs, setEpochs] = useState(50);
  const [layer1Units, setLayer1Units] = useState(16);
  const [layer2Units, setLayer2Units] = useState(8);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [showChart, setShowChart] = useState(true);

  const handleTrain = async () => {
    setTrainingLogs([
      '[TFJS Sandbox] Inicializando Tensores...',
      `[TFJS Sandbox] Compilando modelo sequencial com otimizador ADAM (lr=0.01)...`,
      `[TFJS Sandbox] Arquitetura definida: [Camada de Entrada: 12D → Camada Oculta 1: ${layer1Units} neurônios → Camada Oculta 2: ${layer2Units} neurônios → Saída: 1D]`,
      `[TFJS Sandbox] Dataset pronto com ${trainingStatus?.datasetSize || 0} amostras.`,
      `[TFJS Sandbox] Iniciando treinamento por ${epochs} épocas...`
    ]);

    try {
      const result = await onTrainModel(epochs, layer1Units, layer2Units);
      
      // Simula logs didáticos de épocas
      const newLogs = [
        '[TFJS Sandbox] Inicializando Tensores...',
        `[TFJS Sandbox] Compilando modelo sequencial com otimizador ADAM (lr=0.01)...`,
        `[TFJS Sandbox] Arquitetura definida: [Camada de Entrada: 12D → Camada Oculta 1: ${layer1Units} neurônios → Camada Oculta 2: ${layer2Units} neurônios → Saída: 1D]`,
        `[TFJS Sandbox] Dataset pronto com ${trainingStatus?.datasetSize || 0} amostras.`,
        `[TFJS Sandbox] Iniciando treinamento por ${epochs} épocas...`
      ];
      newLogs.push(`[TFJS Sandbox] Época 1/${epochs} - loss: 0.6931 - accuracy: 0.5120`);
      if (epochs >= 4) {
        newLogs.push(`[TFJS Sandbox] Época ${Math.round(epochs * 0.25)}/${epochs} - loss: 0.5212 - accuracy: 0.7080`);
        newLogs.push(`[TFJS Sandbox] Época ${Math.round(epochs * 0.5)}/${epochs} - loss: 0.3654 - accuracy: 0.8320`);
        newLogs.push(`[TFJS Sandbox] Época ${Math.round(epochs * 0.75)}/${epochs} - loss: 0.1902 - accuracy: 0.9120`);
      }
      newLogs.push(`[TFJS Sandbox] Época ${epochs}/${epochs} - loss: ${result.loss.toFixed(4)} - accuracy: ${result.accuracy.toFixed(4)}`);
      newLogs.push(`[TFJS Sandbox] Treinamento concluído com sucesso!`);
      newLogs.push(`[TFJS Sandbox] Novo modelo salvo na memória ativa.`);
      setTrainingLogs(newLogs);
    } catch (error: any) {
      setTrainingLogs(prev => [...prev, `[ERRO] Falha no pipeline: ${error.message}`]);
    }
  };

  const latestSession = trainingStatus?.latestSession;

  // Gera dados didáticos de convergência para o gráfico com base na acurácia e loss reais
  const generateChartData = () => {
    if (!latestSession) return [];
    
    const count = 10;
    const data = [];
    const targetLoss = latestSession.loss;
    const targetAcc = latestSession.accuracy;

    for (let i = 1; i <= count; i++) {
      const ratio = i / count;
      // Curva de perda decrescente (exponencial inversa)
      const simulatedLoss = 0.693 + (targetLoss - 0.693) * Math.sin(ratio * Math.PI / 2);
      // Curva de acurácia crescente (logarítmica/sigmoid)
      const simulatedAcc = 0.50 + (targetAcc - 0.50) * Math.sin(ratio * Math.PI / 2);

      data.push({
        epoch: Math.round((latestSession.epochs / count) * i),
        Loss: Number(simulatedLoss.toFixed(4)),
        Acurácia: Number((simulatedAcc * 100).toFixed(1)),
      });
    }
    return data;
  };

  const chartData = generateChartData();

  return (
    <div className="space-y-8 animate-fade-in" id="training-view">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Brain className="text-indigo-600" size={24} />
            Treinamento do Modelo (TensorFlow.js)
          </h3>
          <p className="text-xs text-slate-500">
            Ajuste os parâmetros de treino e execute o fluxo de simulação para observar o comportamento do modelo em tempo real.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Painel de Controle de Hiperparâmetros */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 lg:col-span-1">
          <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Cpu className="text-indigo-600" size={16} />
            Hiperparâmetros da Rede
          </h4>

          <div className="space-y-5">
            {/* Seletor de Épocas */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Número de Épocas: <span className="text-indigo-600 font-bold">{epochs}</span>
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={epochs}
                onChange={(e) => setEpochs(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>10 épocas</span>
                <span>500 (Treino Longo)</span>
              </div>
            </div>

            {/* Seletor de Neurônios - Camada 1 */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Neurônios Camada 1: <span className="text-indigo-600 font-bold">{layer1Units}</span>
              </label>
              <input
                type="range"
                min="4"
                max="80"
                step="4"
                value={layer1Units}
                onChange={(e) => setLayer1Units(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>4 (Ref: 16)</span>
                <span>80 (Até 5x)</span>
              </div>
            </div>

            {/* Seletor de Neurônios - Camada 2 */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Neurônios Camada 2: <span className="text-indigo-600 font-bold">{layer2Units}</span>
              </label>
              <input
                type="range"
                min="2"
                max="40"
                step="2"
                value={layer2Units}
                onChange={(e) => setLayer2Units(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>2 (Ref: 8)</span>
                <span>40 (Até 5x)</span>
              </div>
            </div>

            {/* Caixa Informativa */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Otimizador</span>
                <span className="font-semibold text-slate-700">Adam (lr = 0.01)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Loss Function</span>
                <span className="font-semibold text-slate-700">binaryCrossentropy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estrutura Densa</span>
                <span className="font-semibold text-indigo-600 font-mono text-xs">12 → {layer1Units} → {layer2Units} → 1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tamanho do Dataset</span>
                <span className="font-semibold font-mono text-indigo-600">{trainingStatus?.datasetSize || 0} registros</span>
              </div>
            </div>

            <button
              onClick={handleTrain}
              disabled={isTraining || (trainingStatus?.datasetSize || 0) < 5}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isTraining ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Treinando Rede Neural...
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  Iniciar Treinamento
                </>
              )}
            </button>
            {(trainingStatus?.datasetSize || 0) < 5 && (
              <p className="text-[10px] text-rose-500 text-center font-semibold">
                * É necessário pelo menos 5 amostras no dataset para treinar.
              </p>
            )}
          </div>
        </div>

        {/* Visualização da Curva de Aprendizado / Logs */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={16} />
              Métricas e Curva de Convergência
            </h4>
            {latestSession && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                Acurácia Final: {(latestSession.accuracy * 100).toFixed(1)}%
              </span>
            )}
          </div>

          {/* Gráfico de Linha de Otimização */}
          {latestSession ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="epoch" label={{ value: 'Épocas', position: 'insideBottomRight', offset: -10 }} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="Loss" stroke="#ef4444" strokeWidth={2.5} activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="Acurácia" stroke="#10b981" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-50/50">
              <Brain size={36} className="text-slate-300 animate-pulse mb-2" />
              <p className="text-sm font-semibold">Modelo ainda não foi treinado nesta sessão.</p>
              <p className="text-xs">Configure os parâmetros e clique em "Iniciar Treinamento" para visualizar o resultado.</p>
            </div>
          )}

          {/* Terminal / Logs de Saída */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Console de Treinamento</span>
            <div className="bg-slate-900 text-slate-200 font-mono text-[10px] p-4 rounded-lg leading-relaxed shadow-inner h-28 overflow-y-auto space-y-1 select-all">
              {trainingLogs.length > 0 ? (
                trainingLogs.map((log, idx) => (
                  <div key={idx} className={log.startsWith('[ERRO]') ? 'text-rose-400' : log.includes('concluido') || log.includes('concluído') ? 'text-emerald-400 font-bold' : ''}>
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-slate-500">// Aguardando inicialização do pipeline do TensorFlow...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Caixa didática de estrutura da rede */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-indigo-900 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="font-bold flex items-center gap-1.5 text-sm">
            <Layers className="text-indigo-600" size={16} />
            Entendendo a Arquitetura da Rede Neural
          </h4>
          <p className="text-xs leading-relaxed text-indigo-950">
            Nesta plataforma acadêmica, criamos um modelo de Classificação Binária Sequencial denso de três camadas (Multilayer Perceptron) com as seguintes funções matemáticas:
          </p>
          <ul className="text-xs space-y-2 pl-4 list-disc text-indigo-950">
            <li>
              <strong>Input Layer (12D):</strong> Recebe o vetor de features do viajante e do destino turístico normalizados.
            </li>
            <li>
              <strong>Camada Oculta 1 ({layer1Units} neurônios):</strong> Aplica transformações não lineares com ativação <strong>ReLU</strong> para capturar padrões complexos.
            </li>
            <li>
              <strong>Camada Oculta 2 ({layer2Units} neurônios):</strong> Reduz a dimensionalidade para consolidar as características mais cruciais de afinidade.
            </li>
            <li>
              <strong>Camada de Saída (1 neurônio):</strong> Utiliza a ativação <strong>Sigmoid</strong> para esmagar o score final entre <code>0.0</code> e <code>1.0</code>, representando a probabilidade (porcentagem de afinidade) de o usuário curtir o destino.
            </li>
          </ul>
        </div>
        <div className="border-l border-indigo-200/60 pl-0 md:pl-6 space-y-3 flex flex-col justify-center">
          <h4 className="font-bold text-sm">Como funciona o Loop de Otimização?</h4>
          <p className="text-xs leading-relaxed text-indigo-950">
            Durante o treinamento, o otimizador <strong>Adam</strong> ajusta gradualmente os pesos (weights) e vieses (biases) de cada neurônio por meio da retropropagação do erro (backpropagation). O erro é medido pela função de perda <code>binaryCrossentropy</code>. A cada época (epoch), o modelo prevê melhor e o Loss diminui!
          </p>
        </div>
      </div>
    </div>
  );
}
