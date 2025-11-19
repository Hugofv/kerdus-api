# 🏟 Futitec API + Crons

Este projeto contém uma API em Node.js + Express e um conjunto de crons para importar dados de partidas de futebol, estatísticas, eventos, standings e previsões usando a API-Football.

---

## 📦 Estrutura

```
/src
  /crons
    fetchFixtures.ts
    fetchEvents.ts
    fetchPredictions.ts
    fetchStandings.ts
    fetchStats.ts
  /routes
    matches.ts
  /utils
    syncLog.ts
    logger.ts
  index.ts          ← API Express (servidor)
  scheduler.ts      ← Agendador de crons (node-cron)
```

---

## 🚀 Deploy no Railway

### 1. Faça o fork deste repositório e configure seu `.env`

Crie um arquivo `.env` com:

```env
API_KEY=YOUR_API_FOOTBALL_KEY
TELEGRAM_TOKEN=YOUR_BOT_TOKEN
TELEGRAM_CHAT_ID=YOUR_CHAT_ID
DATABASE_URL=mysql://user:pass@host:port/db
```

---

### 2. Suba no Railway

- Acesse: https://railway.app
- Clique em: **"New Project" > Deploy from GitHub Repo"**
- Selecione seu repositório

---

### 3. Configure dois serviços:

#### ➤ API (Web)

- **Start command**: `ts-node src/index.ts`
- Porta: Railway detecta automaticamente (Express escuta `process.env.PORT`)

#### ➤ Crons (Worker)

- **Start command**: `ts-node src/scheduler.ts`
- Tipo: `Worker` (sem porta exposta)

---

## ✅ O que os crons fazem

| Cron              | Frequência      | Finalidade                             |
|-------------------|------------------|-----------------------------------------|
| fetchFixtures     | 3x ao dia        | Importa os jogos do dia                |
| fetchEvents       | A cada hora      | Atualiza eventos das partidas ao vivo |
| fetchPredictions  | 3x ao dia        | Previsões da API-Football              |
| fetchStandings    | 6x ao dia        | Atualiza classificação das ligas com jogos no dia |
| fetchStats        | A cada 2h        | Salva estatísticas dos jogos recentes |

---

## 📊 Logs

Todos os logs são salvos em `./logs/` e erros são enviados para o Telegram, se configurado.

---

## 🧪 Rodar localmente

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Para rodar apenas os crons:

```bash
ts-node src/scheduler.ts
```

---

## 🤖 Créditos

- API de dados: [API-Football](https://www.api-football.com/)
- Infraestrutura gratuita: [Railway](https://railway.app)
