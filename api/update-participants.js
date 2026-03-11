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

    // Формируем новый JSON
    const data = {
      participants: participants,
      lastUpdated: new Date().toISOString(),
      totalParticipants: participants.length,
      updatedBy: 'Vercel API'
    };

    // Обновляем bin через JSONBin API
    const updateResponse = await fetch(
      `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY
        },
        body: JSON.stringify(data)
      }
    );

    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log(`Successfully updated JSONBin with ${participants.length} participants`);
      
      return res.status(200).json({ 
        success: true,
        message: `Successfully updated ${participants.length} participants`,
        updatedAt: data.lastUpdated
      });
    } else {
      const errorData = await updateResponse.text();
      console.error('JSONBin API Error:', errorData);
      
      return res.status(500).json({ 
        error: `Failed to update data: ${updateResponse.statusText}`,
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