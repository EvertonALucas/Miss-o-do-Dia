// Configurações globais
const ADMIN_PASSWORD = 'pais123'; // Senha simples para área administrativa
const CELEBRATION_EMOJIS = ['🎉', '⭐', '🌟', '✨', '🎊', '🏆', '👏', '💫'];

// Estrutura de dados inicial
const initialData = {
    manuela: {
        points: 0,
        tasks: []
    },
    heloisa: {
        points: 0,
        tasks: []
    }
};

// Funções de navegação
function goToPage(page) {
    window.location.href = page;
}

function goToAdmin() {
    const password = prompt('Digite a senha dos pais:');
    if (password === ADMIN_PASSWORD) {
        goToPage('admin.html');
    } else if (password !== null) {
        alert('Senha incorreta! 🔒');
    }
}

// Funções de localStorage
function loadData() {
    const data = localStorage.getItem('tarefasMagicas');
    if (data) {
        return JSON.parse(data);
    }
    return initialData;
}

function saveData(data) {
    localStorage.setItem('tarefasMagicas', JSON.stringify(data));
}

function generateTaskId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Funções de gerenciamento de tarefas
function addTask(user, taskName, points) {
    const data = loadData();
    const task = {
        id: generateTaskId(),
        name: taskName,
        points: parseInt(points),
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    if (user === 'both') {
        data.manuela.tasks.push({...task, id: generateTaskId()});
        data.heloisa.tasks.push({...task, id: generateTaskId()});
    } else {
        data[user].tasks.push(task);
    }
    
    saveData(data);
    return task;
}

function completeTask(user, taskId) {
    const data = loadData();
    const task = data[user].tasks.find(t => t.id === taskId);
    
    if (task && !task.completed) {
        task.completed = true;
        task.completedAt = new Date().toISOString();
        data[user].points += task.points;
        saveData(data);
        
        // Mostrar animação de celebração
        showCelebrationAnimation(task.points);
        
        // Reproduzir som de celebração (se disponível)
        playCelebrationSound();
        
        return true;
    }
    return false;
}

function editTask(user, taskId, newName, newPoints) {
    const data = loadData();
    const task = data[user].tasks.find(t => t.id === taskId);
    
    if (task) {
        task.name = newName;
        task.points = parseInt(newPoints);
        saveData(data);
        return true;
    }
    return false;
}

function deleteTask(user, taskId) {
    const data = loadData();
    data[user].tasks = data[user].tasks.filter(t => t.id !== taskId);
    saveData(data);
}

function resetPoints(user) {
    if (confirm(`Tem certeza que deseja resetar os pontos ${user === 'manuela' ? 'da Manuela' : 'da Heloisa'}?`)) {
        const data = loadData();
        data[user].points = 0;
        saveData(data);
        loadAdminData();
        alert('Pontos resetados com sucesso! ✅');
    }
}

function resetAllTasks() {
    if (confirm('Tem certeza que deseja remover TODAS as tarefas? Esta ação não pode ser desfeita!')) {
        const data = loadData();
        data.manuela.tasks = [];
        data.heloisa.tasks = [];
        saveData(data);
        loadAdminData();
        alert('Todas as tarefas foram removidas! ✅');
    }
}

// Funções de exibição
function loadUserTasks(user) {
    const data = loadData();
    const tasksContainer = document.getElementById(`${user}-tasks`);
    const emptyState = document.getElementById(`${user}-empty`);
    
    if (!tasksContainer) return;
    
    const incompleteTasks = data[user].tasks.filter(task => !task.completed);
    
    if (incompleteTasks.length === 0) {
        tasksContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    tasksContainer.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    
    tasksContainer.innerHTML = incompleteTasks.map(task => `
        <div class="task-item" id="task-${task.id}">
            <div class="task-checkbox" onclick="handleTaskComplete('${user}', '${task.id}')"></div>
            <div class="task-content">
                <div class="task-name">${task.name}</div>
                <div class="task-points">
                    Vale <span class="task-points-value">${task.points} pontos</span>
                </div>
            </div>
        </div>
    `).join('');
}

function updatePointsDisplay(user) {
    const data = loadData();
    const pointsElement = document.getElementById(`${user}-points`);
    if (pointsElement) {
        pointsElement.textContent = data[user].points;
    }
}

function handleTaskComplete(user, taskId) {
    const success = completeTask(user, taskId);
    if (success) {
        // Animar a tarefa sendo completada
        const taskElement = document.getElementById(`task-${taskId}`);
        if (taskElement) {
            taskElement.classList.add('completed');
            const checkbox = taskElement.querySelector('.task-checkbox');
            checkbox.classList.add('checked');
            
            setTimeout(() => {
                loadUserTasks(user);
                updatePointsDisplay(user);
            }, 1000);
        }
    }
}

// Funções de animação
function showCelebrationAnimation(points) {
    const animationContainer = document.getElementById('celebration-animation');
    if (!animationContainer) return;
    
    const emoji = CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)];
    
    animationContainer.innerHTML = `
        <div class="task-completed-animation">
            ${emoji}<br>
            <span style="font-size: 2rem;">+${points} pontos!</span>
        </div>
    `;
    
    setTimeout(() => {
        animationContainer.innerHTML = '';
    }, 1000);
}

function playCelebrationSound() {
    // Criar um som simples usando Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Som não disponível:', error);
    }
}

// Funções administrativas
function loadAdminData() {
    const data = loadData();
    
    // Atualizar pontuação
    const manuelaPointsElement = document.getElementById('admin-manuela-points');
    const heloisaPointsElement = document.getElementById('admin-heloisa-points');
    
    if (manuelaPointsElement) manuelaPointsElement.textContent = data.manuela.points;
    if (heloisaPointsElement) heloisaPointsElement.textContent = data.heloisa.points;
    
    // Carregar tarefas
    loadAdminTasks('manuela');
    loadAdminTasks('heloisa');
}

function loadAdminTasks(user) {
    const data = loadData();
    const tasksContainer = document.getElementById(`admin-${user}-tasks`);
    
    if (!tasksContainer) return;
    
    if (data[user].tasks.length === 0) {
        tasksContainer.innerHTML = '<p style="color: #666; font-style: italic;">Nenhuma tarefa cadastrada</p>';
        return;
    }
    
    tasksContainer.innerHTML = data[user].tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" style="margin-bottom: 10px;">
            <div class="task-content">
                <div class="task-name">
                    ${task.name} 
                    ${task.completed ? '✅' : '⏳'}
                </div>
                <div class="task-points">
                    <span class="task-points-value">${task.points} pontos</span>
                    ${task.completed ? `<span style="color: #32CD32; margin-left: 10px;">Concluída em ${new Date(task.completedAt).toLocaleDateString()}</span>` : ''}
                </div>
            </div>
            <div style="display: flex; gap: 5px; margin-left: auto;">
                ${!task.completed ? `<button class="btn" style="padding: 5px 10px; font-size: 0.8rem; background: linear-gradient(135deg, #87CEEB, #4682B4);" 
                        onclick="startEditTask('${user}', '${task.id}')">
                    ✏️ Editar
                </button>` : ''}
                <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.8rem;" 
                        onclick="deleteTaskAdmin('${user}', '${task.id}')">
                    🗑️ Remover
                </button>
            </div>
        </div>
    `).join('');
}

function addNewTask() {
    const taskName = document.getElementById('task-name').value.trim();
    const taskPoints = document.getElementById('task-points').value;
    const taskUser = document.getElementById('task-user').value;
    
    if (!taskName || !taskPoints || !taskUser) {
        alert('Por favor, preencha todos os campos! 📝');
        return;
    }
    
    if (taskPoints < 1 || taskPoints > 100) {
        alert('Os pontos devem estar entre 1 e 100! ⚠️');
        return;
    }
    
    addTask(taskUser, taskName, taskPoints);
    
    // Limpar formulário
    document.getElementById('add-task-form').reset();
    
    // Recarregar dados administrativos
    loadAdminData();
    
    alert(`Tarefa "${taskName}" adicionada com sucesso! ✅`);
}

function deleteTaskAdmin(user, taskId) {
    if (confirm('Tem certeza que deseja remover esta tarefa?')) {
        deleteTask(user, taskId);
        loadAdminData();
    }
}

function startEditTask(user, taskId) {
    const data = loadData();
    const task = data[user].tasks.find(t => t.id === taskId);
    
    if (task) {
        // Preencher formulário de edição
        document.getElementById('edit-task-id').value = taskId;
        document.getElementById('edit-task-user').value = user;
        document.getElementById('edit-task-name').value = task.name;
        document.getElementById('edit-task-points').value = task.points;
        
        // Mostrar seção de edição
        document.getElementById('edit-task-section').style.display = 'block';
        
        // Rolar para a seção de edição
        document.getElementById('edit-task-section').scrollIntoView({ behavior: 'smooth' });
    }
}

function saveEditTask() {
    const taskId = document.getElementById('edit-task-id').value;
    const user = document.getElementById('edit-task-user').value;
    const taskName = document.getElementById('edit-task-name').value.trim();
    const taskPoints = document.getElementById('edit-task-points').value;
    
    if (!taskName || !taskPoints) {
        alert('Por favor, preencha todos os campos! 📝');
        return;
    }
    
    if (taskPoints < 1 || taskPoints > 100) {
        alert('Os pontos devem estar entre 1 e 100! ⚠️');
        return;
    }
    
    const success = editTask(user, taskId, taskName, taskPoints);
    
    if (success) {
        // Esconder seção de edição
        document.getElementById('edit-task-section').style.display = 'none';
        
        // Recarregar dados administrativos
        loadAdminData();
        
        alert(`Tarefa "${taskName}" editada com sucesso! ✅`);
    } else {
        alert('Erro ao editar tarefa! ❌');
    }
}

function cancelEditTask() {
    // Esconder seção de edição
    document.getElementById('edit-task-section').style.display = 'none';
    
    // Limpar formulário
    document.getElementById('edit-task-form').reset();
}

function exportData() {
    const data = loadData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `tarefas-magicas-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('Dados exportados com sucesso! 💾');
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se é a primeira vez e criar dados iniciais se necessário
    const data = loadData();
    if (!data.manuela || !data.heloisa) {
        saveData(initialData);
    }
    
    // Adicionar algumas tarefas de exemplo na primeira execução
    if (data.manuela.tasks.length === 0 && data.heloisa.tasks.length === 0) {
        // Tarefas de exemplo para Manuela
        addTask('manuela', 'Arrumar a cama', 10);
        addTask('manuela', 'Guardar os brinquedos', 15);
        addTask('manuela', 'Escovar os dentes', 5);
        
        // Tarefas de exemplo para Heloisa
        addTask('heloisa', 'Arrumar a cama', 10);
        addTask('heloisa', 'Guardar os brinquedos', 15);
        addTask('heloisa', 'Ajudar a pôr a mesa', 20);
    }
});

// Funções utilitárias
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Adicionar efeitos visuais extras
function addSparkleEffect(element) {
    const sparkle = document.createElement('div');
    sparkle.innerHTML = '✨';
    sparkle.style.position = 'absolute';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.fontSize = '1.5rem';
    sparkle.style.animation = 'sparkleFloat 1s ease-out forwards';
    
    const rect = element.getBoundingClientRect();
    sparkle.style.left = rect.left + Math.random() * rect.width + 'px';
    sparkle.style.top = rect.top + Math.random() * rect.height + 'px';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        document.body.removeChild(sparkle);
    }, 1000);
}

// CSS para efeito de sparkle
const sparkleCSS = `
@keyframes sparkleFloat {
    0% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateY(-50px) scale(0.5);
    }
}
`;

// Adicionar CSS dinamicamente
const style = document.createElement('style');
style.textContent = sparkleCSS;
document.head.appendChild(style);

