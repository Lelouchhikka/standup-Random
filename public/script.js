document.addEventListener('DOMContentLoaded', () => {
    const participantInput = document.getElementById('participant-input');
    const addBtn = document.getElementById('add-btn');
    const participantsList = document.getElementById('participants-list');
    const generateBtn = document.getElementById('generate-btn');
    const queueResult = document.getElementById('queue-result');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const fileInput = document.getElementById('file-input');

    let participants = [];

    // Vercel API Configuration
    const API_CONFIG = {
        // Замените на ваш URL после деплоя на Vercel
        baseUrl: 'https://standup-randomizer-api-2024.vercel.app',
        endpoint: '/api/update-participants'
    };

    // Load participants from Vercel API
    async function loadParticipantsFromAPI() {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}/api/get-participants`);
            const result = await response.json();

            if (response.ok && result.success) {
                participants = result.participants || [];
                console.log(`Загружено ${participants.length} участников из API`);
                showNotification(`Загружено ${participants.length} участников из репозитория`);
            } else {
                throw new Error(result.error || 'Failed to load participants');
            }
        } catch (error) {
            console.error('Ошибка загрузки участников:', error);
            
            // Fallback: загружаем из localStorage
            const savedParticipants = localStorage.getItem('standup-participants');
            if (savedParticipants) {
                participants = JSON.parse(savedParticipants);
                console.log(`Загружено ${participants.length} участников из localStorage (fallback)`);
                showNotification(`Загружено ${participants.length} участников из локального хранилища (fallback)`);
            } else {
                participants = [];
                console.log('Начинаем с пустого списка участников');
            }
        }
        
        renderParticipants();
    }

    // Save participants via Vercel API
    async function saveParticipantsToAPI() {
        try {
            showNotification('Отправка изменений...', 'warning');
            
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participants: participants
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('Участники успешно обновлены через Vercel API');
                showNotification(`Список участников обновлен! (${participants.length} участников)`);
                
                // Сохраняем в localStorage как backup
                localStorage.setItem('standup-participants', JSON.stringify(participants));
            } else {
                throw new Error(result.error || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Ошибка отправки через Vercel API:', error);
            showNotification('Ошибка отправки изменений: ' + error.message, 'error');
            
            // Fallback: сохраняем в localStorage
            localStorage.setItem('standup-participants', JSON.stringify(participants));
            showNotification('Изменения сохранены локально', 'warning');
        }
    }

    function renderParticipants() {
        participantsList.innerHTML = '';
        participants.forEach((participant, index) => {
            const li = document.createElement('li');
            li.textContent = participant;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.setAttribute('data-index', index);
            
            // SVG icon for delete button
            removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
            
            li.appendChild(removeBtn);
            participantsList.appendChild(li);
        });
    }

    async function addParticipant() {
        const name = participantInput.value.trim();
        if (name) {
            participants.push(name);
            participantInput.value = '';
            await saveParticipantsToAPI();
            renderParticipants();
            showNotification(`Участник "${name}" добавлен`);
        }
    }

    async function removeParticipant(index) {
        const removedName = participants[index];
        participants.splice(index, 1);
        await saveParticipantsToAPI();
        renderParticipants();
        showNotification(`Участник "${removedName}" удален`);
    }

    function generateQueue() {
        if (participants.length === 0) {
            showNotification('Добавьте участников для генерации очереди', 'warning');
            return;
        }

        const shuffledParticipants = [...participants];
        
        // Fisher-Yates Shuffle
        for (let i = shuffledParticipants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledParticipants[i], shuffledParticipants[j]] = [shuffledParticipants[j], shuffledParticipants[i]];
        }

        queueResult.innerHTML = '';
        shuffledParticipants.forEach(participant => {
            const li = document.createElement('li');
            li.textContent = participant;
            queueResult.appendChild(li);
        });

        showNotification('Очередь сгенерирована!');
    }

    function exportToJSON() {
        if (participants.length === 0) {
            showNotification('Нет участников для экспорта', 'warning');
            return;
        }

        const data = {
            participants: participants,
            exportDate: new Date().toISOString(),
            totalParticipants: participants.length
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `standup-participants-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Список участников экспортирован в JSON файл');
    }

    function importFromJSON(file) {
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.participants && Array.isArray(data.participants)) {
                    // Ask user if they want to replace or merge
                    const action = confirm(
                        `Найдено ${data.participants.length} участников.\n` +
                        `Нажмите "OK" чтобы заменить текущий список,\n` +
                        `или "Отмена" чтобы добавить к существующему списку.`
                    );
                    
                    if (action) {
                        // Replace current list
                        participants = [...data.participants];
                    } else {
                        // Merge with current list
                        const newParticipants = data.participants.filter(p => !participants.includes(p));
                        participants = [...participants, ...newParticipants];
                    }
                    
                    await saveParticipantsToAPI();
                    renderParticipants();
                    
                    showNotification(`Успешно импортировано ${data.participants.length} участников!`);
                } else {
                    throw new Error('Неверный формат файла');
                }
            } catch (error) {
                showNotification('Ошибка при импорте файла: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                importFromJSON(file);
            } else {
                showNotification('Пожалуйста, выберите JSON файл', 'error');
            }
        }
        // Reset file input
        event.target.value = '';
    }

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        const colors = {
            success: 'var(--success-color)',
            warning: '#f59e0b',
            error: 'var(--danger-color)'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Event listeners
    addBtn.addEventListener('click', addParticipant);

    participantInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addParticipant();
        }
    });

    participantsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-btn') || event.target.closest('.remove-btn')) {
            const removeBtn = event.target.classList.contains('remove-btn') ? event.target : event.target.closest('.remove-btn');
            const index = parseInt(removeBtn.getAttribute('data-index'), 10);
            removeParticipant(index);
        }
    });

    generateBtn.addEventListener('click', generateQueue);
    
    exportBtn.addEventListener('click', exportToJSON);
    
    importBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileSelect);

    // Initial load from API
    loadParticipantsFromAPI();
}); 