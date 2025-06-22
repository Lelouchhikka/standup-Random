# Stand-up Randomizer

Современное веб-приложение для генерации случайного порядка выступлений на стендап-встречах с интеграцией GitHub API через Vercel.

## 🚀 Особенности

- ✅ **Современный дизайн** с неоморфическим стилем и темной темой
- ✅ **Безопасная интеграция** с GitHub через Vercel API
- ✅ **Коллективное редактирование** - все пользователи видят изменения в реальном времени
- ✅ **Автоматическое сохранение** в репозитории GitHub
- ✅ **Экспорт/импорт** JSON файлов
- ✅ **Адаптивный дизайн** для всех устройств

## 🏗️ Архитектура

```
GitHub Pages (Frontend) → Vercel API → GitHub API → Repository
```

1. **Frontend** (GitHub Pages) - пользовательский интерфейс
2. **Vercel API** - безопасный прокси для работы с GitHub API
3. **GitHub API** - обновление файла participants.json
4. **Repository** - хранение данных

## 📋 Быстрый старт

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/your-username/standup-randomizer.git
cd standup-randomizer
```

### 2. Настройте Vercel API

1. Перейдите на [vercel.com](https://vercel.com) и создайте аккаунт
2. Импортируйте этот репозиторий в Vercel
3. Добавьте переменную окружения:
   - `GITHUB_TOKEN` = ваш Personal Access Token

### 3. Обновите конфигурацию

В файле `script.js` замените URL на ваш Vercel домен:

```javascript
const API_CONFIG = {
    baseUrl: 'https://your-project.vercel.app', // Ваш Vercel URL
    endpoint: '/api/update-participants'
};
```

### 4. Настройте GitHub репозиторий

В файле `script.js` обновите настройки репозитория:

```javascript
const GITHUB_CONFIG = {
    owner: 'your-username', // Ваше имя пользователя
    repo: 'your-repo',      // Имя репозитория
    path: 'participants.json',
    branch: 'main'
};
```

### 5. Включите GitHub Pages

1. В настройках репозитория → Pages
2. Выберите ветку `main` и папку `/ (root)`
3. Сохраните настройки

## 🔧 Настройка GitHub Token

### Создание Personal Access Token

1. Перейдите в [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Нажмите **"Generate new token (classic)"**
3. Выберите права:
   - ✅ `repo` (полный доступ к репозиториям)
4. Скопируйте токен

### Добавление токена в Vercel

1. В настройках проекта на Vercel → **Settings → Environment Variables**
2. Добавьте переменную:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: ваш токен
   - **Environment**: Production, Preview, Development

## 📁 Структура проекта

```
standup-randomizer/
├── api/
│   └── update-participants.js    # Vercel serverless function
├── index.html                    # Главная страница
├── style.css                     # Стили
├── script.js                     # Frontend логика
├── participants.json             # Данные участников
├── package.json                  # Конфигурация npm
├── vercel.json                   # Конфигурация Vercel
└── README.md                     # Документация
```

## 🎯 Использование

1. **Откройте сайт** на GitHub Pages
2. **Добавьте участников** через веб-интерфейс
3. **Сгенерируйте очередь** для стендапа
4. **Изменения автоматически сохраняются** в репозитории

## 🔒 Безопасность

- ✅ **Токен хранится только на сервере** (Vercel)
- ✅ **Frontend не имеет доступа к секретам**
- ✅ **CORS настроен для безопасных запросов**
- ✅ **Валидация данных на сервере**

## 🛠️ Разработка

### Локальная разработка

```bash
# Установите Vercel CLI
npm i -g vercel

# Запустите локальный сервер
vercel dev
```

### Переменные окружения для разработки

Создайте файл `.env.local`:

```env
GITHUB_TOKEN=your_token_here
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo
GITHUB_BRANCH=main
```

## 🚀 Деплой

### Автоматический деплой

При пуше в репозиторий Vercel автоматически деплоит изменения.

### Ручной деплой

```bash
vercel --prod
```

## 🐛 Устранение неполадок

### Ошибка "Server configuration error"
- Проверьте, что `GITHUB_TOKEN` добавлен в переменные окружения Vercel
- Убедитесь, что токен имеет права на запись в репозиторий

### Ошибка "Failed to update file"
- Проверьте правильность `owner` и `repo` в настройках
- Убедитесь, что репозиторий существует и доступен

### CORS ошибки
- Проверьте настройки CORS в `vercel.json`
- Убедитесь, что домен GitHub Pages добавлен в разрешенные источники

## 📝 Лицензия

MIT License - см. файл LICENSE для подробностей.

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
- Создайте Issue в репозитории
- Опишите проблему подробно
- Приложите скриншоты если нужно

---

**Готово!** Теперь ваш Stand-up Randomizer работает безопасно через Vercel API! 🚀 