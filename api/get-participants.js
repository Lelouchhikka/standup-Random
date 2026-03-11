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
    // Получаем конфигурацию JSONBin из переменных окружения Vercel
    const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
    const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;

    // Проверяем наличие необходимых переменных
    if (!JSONBIN_BIN_ID || !JSONBIN_API_KEY) {
      console.error('JSONBin configuration not found in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error. Please set JSONBIN_BIN_ID and JSONBIN_API_KEY in Vercel environment variables.' 
      });
    }

    // Получаем данные из JSONBin
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`,
      {
        method: 'GET',
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
          'X-Bin-Meta': 'false'
        },
      }
    );

    if (response.ok) {
      const content = await response.json();
      
      console.log(`Successfully loaded ${content.participants?.length || 0} participants from JSONBin`);
      
      return res.status(200).json({
        success: true,
        participants: content.participants || [],
        lastUpdated: content.lastUpdated,
        totalParticipants: content.participants?.length || 0
      });
    } else if (response.status === 404) {
      // Bin не найден, возвращаем пустой список
      console.log('JSONBin not found, returning empty list');
      
      return res.status(200).json({
        success: true,
        participants: [],
        lastUpdated: null,
        totalParticipants: 0
      });
    } else {
      const errorData = await response.text();
      console.error('JSONBin API Error:', errorData);
      
      return res.status(500).json({ 
        error: `Failed to get data: ${response.statusText}`,
        details: errorData
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 