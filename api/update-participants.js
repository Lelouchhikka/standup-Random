import { createClient } from 'redis';

let redis = null;

async function getRedisClient() {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL
    });
    await redis.connect();
  }
  return redis;
}

export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Проверяем метод запроса
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed. Use POST method.' 
    });
  }

  try {
    // Проверяем наличие REDIS_URL
    if (!process.env.REDIS_URL) {
      console.error('REDIS_URL is not configured. Please create and connect a KV database.');
      return res.status(500).json({ 
        error: 'Vercel KV is not configured. Please follow the setup instructions in VERCEL_KV_SETUP.md',
        setupRequired: true
      });
    }

    const { participants } = req.body;
    
    // Валидация входных данных
    if (!Array.isArray(participants)) {
      return res.status(400).json({ 
        error: 'Invalid participants data. Expected array.' 
      });
    }

    // Проверяем, что все участники - строки
    if (!participants.every(p => typeof p === 'string' && p.trim())) {
      return res.status(400).json({ 
        error: 'All participants must be non-empty strings.' 
      });
    }

    // Формируем данные для сохранения
    const data = {
      participants: participants,
      lastUpdated: new Date().toISOString(),
      totalParticipants: participants.length,
      updatedBy: 'Vercel API'
    };

    // Сохраняем в Redis
    const client = await getRedisClient();
    await client.set('standup-participants', JSON.stringify(data));
    
    console.log(`Successfully updated Vercel KV with ${participants.length} participants`);
    
    return res.status(200).json({ 
      success: true,
      message: `Successfully updated ${participants.length} participants`,
      updatedAt: data.lastUpdated
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    console.error('Error details:', error.message, error.stack);
    return res.status(500).json({ 
      error: 'Internal server error. Please try again later.',
      message: error.message,
      hint: 'Make sure Vercel KV database is created and connected to this project'
    });
  }
} 