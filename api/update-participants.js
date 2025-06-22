export default async function handler(req, res) {
  // Настройка CORS для работы с GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

    // Получаем SHA текущего файла
    const getResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Standup-Randomizer-API/1.0'
        },
      }
    );

    let sha = null;
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    } else if (getResponse.status !== 404) {
      // Если это не 404 ошибка, что-то пошло не так
      const errorData = await getResponse.json();
      console.error('Error getting file info:', errorData);
      return res.status(500).json({ 
        error: `Failed to get file info: ${errorData.message || getResponse.statusText}` 
      });
    }

    // Формируем новый JSON
    const data = {
      participants: participants,
      lastUpdated: new Date().toISOString(),
      totalParticipants: participants.length,
      updatedBy: 'Vercel API'
    };

    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    // Обновляем файл через GitHub API
    const updateResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Standup-Randomizer-API/1.0'
        },
        body: JSON.stringify({
          message: `Update participants list via API - ${participants.length} participants`,
          content: content,
          sha: sha,
          branch: BRANCH
        }),
      }
    );

    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log(`Successfully updated participants.json. Commit: ${result.commit.sha}`);
      
      return res.status(200).json({ 
        success: true,
        message: `Successfully updated ${participants.length} participants`,
        commitSha: result.commit.sha,
        updatedAt: data.lastUpdated
      });
    } else {
      const errorData = await updateResponse.json();
      console.error('GitHub API Error:', errorData);
      
      return res.status(500).json({ 
        error: `Failed to update file: ${errorData.message || updateResponse.statusText}`,
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