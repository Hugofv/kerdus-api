import cron from 'node-cron';
import { fetchFixtures } from '../crons/fetchFixtures';
import { fetchPredictions } from '../crons/fetchPredictions';
import { fetchEvents } from '../crons/fetchEvents';
import { fetchStandings } from '../crons/fetchStandings';
import { fetchStats } from '../crons/fetchStats';
import { classifyMatches } from '../crons/classifyMatches';
import { log } from '../utils/logger';

// ⏰ Fixtures (jogos do dia) — 3x por dia
cron.schedule('0 5,11,17 * * *', async () => {
  console.log('⏳ Atualizando fixtures...');
  try {
    await fetchFixtures();
    log('✅ Fixtures atualizados');
  } catch (err) {
    log('❌ Erro ao atualizar fixtures: ' + err.message, 'error');
  }
});

// ⏰ Predictions — 3x por dia
cron.schedule('0 6,12,18 * * *', async () => {
  console.log('⏳ Atualizando predictions...');
  try {
    await fetchPredictions();
    log('✅ Predictions atualizados');
  } catch (err) {
    log('❌ Erro ao atualizar Predictions: ' + err.message, 'error');
  }

  console.log('✅ Predictions atualizados');
});

// ⏰ Events — a cada hora
cron.schedule('0 * * * *', async () => {
  console.log('⏳ Atualizando eventos...');
  try {
    await fetchEvents();
    log('✅ Events atualizados');
  } catch (err) {
    log('❌ Erro ao atualizar Events: ' + err.message, 'error');
  }
  console.log('✅ Eventos atualizados');
});

// ⏰ Stats — a cada 2 horas
cron.schedule('0 */2 * * *', async () => {
  console.log('⏳ Atualizando estatísticas...');
  try {
    await fetchStats();
    console.log('✅ Estatísticas atualizadas');
  } catch (err) {
    console.error('❌ Erro ao atualizar estatísticas:', err);
  }
});

// ⏰ Standings — a cada 2 hora
cron.schedule('0 */2 * * *', async () => {
  console.log('⏳ Atualizando standings...');
  try {
    await fetchStandings();
    log('✅ Standings atualizados');
  } catch (err) {
    log('❌ Erro ao atualizar Standings: ' + err.message, 'error');
  }
  console.log('✅ Standings atualizados');
});

// ⏰ Classificação de partidas — 3x por dia
cron.schedule('0 6,8,17,20 * * *', async () => {
  console.log('⏳ Atualizando destaque partidas...');
  try {
    await classifyMatches();
    log('✅ destaque partidas atualizados');
  } catch (err) {
    log('❌ Erro ao atualizar destaque partidas: ' + err.message, 'error');
  }
  console.log('✅ destaque partidas atualizados');
});
