import fs from 'fs';
import path from 'path';
import axios from 'axios';

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

export function log(msg: string, type: 'info' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${type.toUpperCase()}] ${msg}`;
  console.log(line);

  const logFile = path.resolve(
    logDir,
    `${type}-${timestamp.split('T')[0]}.log`
  );
  fs.appendFileSync(logFile, line + '\n');

  if (type === 'error') {
    notifyTelegram(`❌ ${msg}`).catch((err) => {
      console.warn('Falha ao enviar alerta para Telegram:', err.message);
    });
  }
}

async function notifyTelegram(message: string) {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: message,
    });
  } catch (err: any) {
    console.error('[Telegram]', err?.response?.data || err.message);
  }
}
