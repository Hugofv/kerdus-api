// src/crons/runAllCrons.ts
import { fetchFixtures } from './fetchFixtures';
import { fetchEvents } from './fetchEvents';
import { fetchPredictions } from './fetchPredictions';
import { fetchStandings } from './fetchStandings';

(async () => {
  try {
    console.log('🔄 Iniciando cron fixtures...');
    await fetchFixtures();

    console.log('🔄 Iniciando cron events...');
    await fetchEvents();

    console.log('🔄 Iniciando cron predictions...');
    await fetchPredictions();

    console.log('🔄 Iniciando cron standings...');
    await fetchStandings();

    console.log('✅ Todos os crons executados com sucesso.');
  } catch (err) {
    console.error('❌ Erro durante execução dos crons:', err);
  }
})();
