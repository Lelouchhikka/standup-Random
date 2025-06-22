export default async function handler(req, res) {
  // Настройка CORS для работы с GitHub Pages
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
    // Получаем секреты из переменных окружения Vercel
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = process.env.GITHUB_OWNER || 'Lelouchhikka';
    const REPO = process.env.GITHUB_REPO || 'standup-Random';
    const PATH = 'participants.json';
    const BRANCH = process.env.GITHUB_BRANCH || 'main';

    // Проверяем наличие токена
    if (!GITHUB_TOKEN) {
      console.error('GITHUB_TOKEN not found in environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error. Please contact administrator.' 
      });
    }

    // Получаем файл из GitHub
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Standup-Randomizer-API/1.0'
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const content = JSON.parse(atob(data.content));
      
      console.log(`Successfully loaded ${content.participants?.length || 0} participants from GitHub`);
      
      return res.status(200).json({
        success: true,
        participants: content.participants || [],
        lastUpdated: content.lastUpdated,
        totalParticipants: content.participants?.length || 0
      });
    } else if (response.status === 404) {
      // Файл не найден, возвращаем пустой список
      console.log('File participants.json not found in repository, returning empty list');
      
      return res.status(200).json({
        success: true,
        participants: [],
        lastUpdated: null,
        totalParticipants: 0
      });
    } else {
      const errorData = await response.json();
      console.error('GitHub API Error:', errorData);
      
      return res.status(500).json({ 
        error: `Failed to get file: ${errorData.message || response.statusText}`,
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