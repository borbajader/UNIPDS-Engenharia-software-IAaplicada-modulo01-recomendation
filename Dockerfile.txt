# Dockerfile para Vibe3p - Plataforma de Recomendação com IA

# 1. Estágio de Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de manifesto de dependências
COPY package*.json ./

# Instala todas as dependências
RUN npm ci || npm install

# Copia o código fonte completo
COPY . .

# Executa o build da aplicação (Vite + esbuild server.ts -> dist/server.cjs)
RUN npm run build

# 2. Estágio de Execução (Production)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copia os manifestos de dependências
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --omit=dev || npm install --only=production

# Copia os artefatos compilados do estágio de build
COPY --from=builder /app/dist ./dist

# Expõe a porta de acesso
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
