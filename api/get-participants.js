import { kv } from '@vercel/kv';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed. Use GET method.' 
    });
  }

  try {
    // Проверяем наличие Vercel KV конфигурации
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.error('Vercel KV is not configured. Please create and connect a KV database.');
      return res.status(500).json({ 
        error: 'Vercel KV is not configured. Please follow the setup instructions in VERCEL_KV_SETUP.md',
        setupRequired: true
      });
    }

    // Получаем данные из Vercel KV (Redis)
    const data = await kv.get('standup-participants');
    
    if (data) {
      console.log(`Successfully loaded ${data.participants?.length || 0} participants from Vercel KV`);
      
      return res.status(200).json({
        success: true,
        participants: data.participants || [],
        lastUpdated: data.lastUpdated,
        totalParticipants: data.participants?.length || 0
      });
    } else {
      // Данных нет, возвращаем пустой список
      console.log('No data in Vercel KV, returning empty list');
      
      return res.status(200).json({
        success: true,
        participants: [],
        lastUpdated: null,
        totalParticipants: 0
      });
    }

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