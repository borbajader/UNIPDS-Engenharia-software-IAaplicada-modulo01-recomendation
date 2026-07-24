# Arquitetura e Guia do Modelo de Rede Neural - Vibe3p AI

Este documento detalha toda a estrutura de diretórios do **Vibe3p AI** e serve como um guia didático passo a passo de como fazer modificações nos hiperparâmetros da rede neural, do pré-processamento de dados e do treinamento utilizando o **TensorFlow.js**.

---

## 🗺️ Mapa da Estrutura do Projeto

O código do projeto foi modularizado para separar as responsabilidades e garantir que os dados fluam de forma limpa desde o banco de dados relacional até a rede neural:

```text
├── .env.example                # Molde de variáveis de ambiente do PostgreSQL e App
├── Dockerfile                  # Configuração de build multi-stage para container da aplicação
├── Dockerfile.txt              # Réplica de segurança em formato texto do Dockerfile
├── docker-compose.yml          # Orquestração dos containers (App Web + PostgreSQL)
├── docker-compose.yml.txt      # Réplica de segurança do docker-compose.yml
├── .dockerignore               # Lista de exclusões do contexto Docker (node_modules, dist)
├── .dockerignore.txt           # Réplica de segurança do .dockerignore
├── package.json                # Gerenciador de scripts (dev, build, db:seed, etc) e dependências
├── server.ts                   # Ponto de entrada do servidor full-stack (Express + Vite Middleware)
├── metadata.json               # Configurações gerais de metadados da aplicação
├── src/
│   ├── main.tsx                # Inicializador cliente do React 19
│   ├── App.tsx                 # Container principal da interface gráfica
│   ├── types.ts                # Definição global de interfaces TypeScript (User, Destination, etc)
│   ├── constants.ts            # Mapeamento fixo de categorias e climas compartilhado entre Front e Back
│   ├── components/             # Views e componentes de interface gráfica (Tailwind CSS)
│   │   ├── DashboardView.tsx   # Dashboard de resumo métrico do sistema
│   │   ├── UsersView.tsx       # Gerenciador de perfis e troca de viajantes ativos
│   │   ├── DestinationsView.tsx # Formulário e listagem do catálogo de locais turísticos
│   │   ├── DatasetView.tsx     # Painel com a visualização dos tensores convertidos (Features X e Label Y)
│   │   ├── TrainingView.tsx    # Controle de hiperparâmetros (épocas/neurônios) e gráficos
│   │   └── InferenceView.tsx   # Exibição do ranking das predições da rede neural
│   ├── controllers/            # Controladores da API Express (traduzem HTTP para chamadas de Serviços)
│   │   └── controllers.ts
│   ├── db/                     # Banco de dados e ORM
│   │   ├── index.ts            # Inicialização do pool de conexões com Drizzle ORM
│   │   ├── schema.ts           # Definição das tabelas relacionais do PostgreSQL (Drizzle schema)
│   │   └── seed.ts             # Script autônomo CLI para popular o banco sem dependência de internet
│   ├── middleware/             # Middlewares de interceptação e autenticação simulada
│   │   └── auth.ts
│   ├── repositories/           # Repositórios SQL (consultas diretas utilizando Drizzle ORM)
│   │   └── ModelsRepository.ts
│   ├── routes/                 # Definição de rotas da API REST (/api/*)
│   │   └── routes.ts
│   └── services/               # Motores de Regras de Negócio e de Machine Learning
│       ├── DatasetService.ts   # Conversão de registros SQL em tensores de treino (X/Y)
│       ├── TrainingService.ts  # Construção, compilação e fit do modelo TensorFlow.js
│       └── PredictionService.ts# Motor de inferência que roda o predict e gera as recomendações
```

---

## 🧠 Como Funciona o Pré-processamento e o Vetor $X$ (12D)

O TensorFlow.js requer que todas as entradas sejam numéricas e idealmente estejam em escalas semelhantes para uma convergência estável. 

No arquivo `src/services/DatasetService.ts`, as informações são processadas no método `generateDataset()` para gerar um vetor de **12 dimensões** para cada par (Viajante, Destino):

1. **Idade do Usuário** (1D): Dividida por 100 para ficar no intervalo de `[0.0, 1.0]`. Ex: 22 anos vira `0.22`.
2. **Categoria do Destino** (5D - One-Hot Encoding): Há 5 categorias possíveis (*Praia, Montanha, Histórico, Urbano, Natureza*). Mapeamos na forma de array binário:
   - Se for *Praia*: `[1, 0, 0, 0, 0]`
   - Se for *Montanha*: `[0, 1, 0, 0, 0]`
3. **Nível de Custo** (1D): O nível de preço do local (1 a 4) é dividido por 4. Ex: Nível 3 vira `0.75`.
4. **Clima do Destino** (3D - One-Hot Encoding): Há 3 climas cadastrados (*Quente, Frio, Temperado*):
   - Se for *Quente*: `[1, 0, 0]`
   - Se for *Frio*: `[0, 1, 0]`
5. **Duração Desejada da Viagem** (1D): O número de dias é dividido pelo máximo aproximado de 30 dias. Ex: 6 dias vira `0.20`.
6. **Orçamento Planejado** (1D): O valor total estimado em R$ é normalizado dividindo-o por 10.000. Ex: R$ 4.500 vira `0.45`.

Ao somar todas essas dimensões, temos:
$$\text{Vetor de Features (X)} = [Age] + [Category (5D)] + [PriceLevel] + [Climate (3D)] + [Days] + [Cost] = 12\text{ dimensões}$$

---

## 🛠️ Como Fazer Alterações nos Números da Rede Neural

O cérebro da inteligência artificial fica inteiramente dentro do arquivo `src/services/TrainingService.ts`. É nele que criamos, compilamos e treinamos o modelo. Abaixo está o guia prático de como alterar as características da rede:

### 1. Alterando o Número de Neurônios ou Camadas Ocultas
O modelo atual é um **Multilayer Perceptron** estruturado assim:
```ts
// src/services/TrainingService.ts (Método createModel)

const model = tf.sequential();

// Camada 1: Camada de entrada e primeira camada oculta com 16 neurônios
model.add(tf.layers.dense({
  units: 16,            // Modifique este número para alterar os neurônios da primeira camada
  activation: 'relu',   // Função de ativação
  inputShape: [12],     // DEVE bater com o tamanho do vetor X (12 dimensões)
}));

// Camada 2: Segunda camada oculta com 8 neurônios
model.add(tf.layers.dense({
  units: 8,             // Modifique este número para alterar os neurônios da segunda camada
  activation: 'relu',
}));

// Camada 3: Camada de saída (1 neurônio para gerar score probabilístico entre 0.0 e 1.0)
model.add(tf.layers.dense({
  units: 1,
  activation: 'sigmoid',
}));
```

* **Dica de modificação**: Para fazer uma rede mais profunda, você pode adicionar uma terceira camada densa simplesmente inserindo uma nova chamada antes da camada de saída:
  ```ts
  model.add(tf.layers.dense({
    units: 4,
    activation: 'relu'
  }));
  ```

---

### 2. Alterando as Funções de Ativação
As ativações adicionam não-linearidade à rede neural.
- A ativação **`relu`** (Rectified Linear Unit) é usada por padrão nas camadas ocultas para evitar o desaparecimento do gradiente. Você pode testar outras como **`tanh`** (Tangente Hiperbólica) ou **`sigmoid`**.
- A camada de saída **deve** permanecer com **`sigmoid`**, pois nossa tarefa de recomendação é uma classificação binária (Gosta/Não gosta), e a sigmoide garante que a saída esteja sempre entre `0.0` e `1.0` (convertido em 0% a 100% de afinidade no frontend).

---

### 3. Alterando a Taxa de Aprendizado (Learning Rate) e o Otimizador
O otimizador atual é o **Adam**, muito conhecido pela sua velocidade de convergência devido à adaptação dinâmica das taxas por recurso.
```ts
// src/services/TrainingService.ts

model.compile({
  optimizer: tf.train.adam(0.01), // Modifique o número 0.01
  loss: 'binaryCrossentropy',
  metrics: ['accuracy'],
});
```
- **Se o modelo convergir muito rápido** ou der passos erráticos, diminua a taxa de aprendizado para `0.001` ou `0.005`.
- **Se estiver muito lento**, aumente para `0.05` ou `0.10`.
- Você também pode alterar o otimizador para SGD (Gradient Descent Estocástico):
  ```ts
  optimizer: tf.train.sgd(0.05)
  ```

---

### 4. Configurando Parâmetros de Divisão de Validação e Treino
Durante a execução de `model.fit()`, podemos configurar como as amostras se comportam:
```ts
// src/services/TrainingService.ts

const history = await model.fit(xs, ys, {
  epochs,
  shuffle: true,
  validationSplit: 0.1, // Reserva 10% do dataset para validação cruzada
  verbose: 0,
});
```
- **`validationSplit`**: Altere `0.1` (10%) para `0.2` (20%) se quiser usar um conjunto maior para validar o sobreajuste (*overfitting*).
- **`shuffle`**: Deixar como `true` é vital para que a rede não aprenda a ordem sequencial em que os dados foram cadastrados no banco de dados.

---

## 🔬 Como Validar Suas Mudanças

Toda vez que você alterar o arquivo `src/services/TrainingService.ts` e quiser ver os efeitos:
1. Certifique-se de que a aplicação está rodando (`npm run dev`).
2. Acesse a aba **Treinamento (TFJS)** na interface gráfica.
3. Escolha o número de épocas e clique em **Iniciar Treinamento**.
4. O gráfico exibido mostrará em tempo real como o erro (Loss) diminui e a acurácia (Accuracy) se comporta durante o treinamento com os novos números configurados!
