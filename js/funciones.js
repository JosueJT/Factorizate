// Variables globales
let currentUser = null;
let currentLevel = 1;
let currentExerciseIndex = 0;
let currentStep = 1;
let currentProgress = 0;
let selectedQuizOption = -1;
let currentQuizIndex = 0;

// Datos de ejercicios
const exercises = {
    1: [
        { problem: "6x²+12x", answer: "6x(x+2)", hint: "Busca el factor común" },
        { problem: "8a³+12a²", answer: "4a²(2a+3)", hint: "El factor común es 4a²" }
    ],
    2: [
        { problem: "x²-9", answer: "(x+3)(x-3)", hint: "a²-b²=(a+b)(a-b)" },
        { problem: "4x²-25", answer: "(2x+5)(2x-5)", hint: "Recuerda la fórmula" }
    ]
};

// Preguntas de quiz
const quizQuestions = [
    { question: "¿Cuál es el factor común de 8x³+12x²?", options: ["2x", "4x²", "4x", "8x"], correct: 1 },
    { question: "¿Cómo se factoriza x²-16?", options: ["(x+4)(x-4)", "(x+2)(x-8)", "(x+8)(x-2)", "(x+16)(x-1)"], correct: 0 }
];

// Gestión de usuarios en localStorage
function getStoredUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Registro de usuario
function registerUser() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const userType = document.getElementById('regUserType').value;

    // Validación básica
    if (!username || !password || !userType) {
        showFeedback('Todos los campos son obligatorios', 'error');
        return;
    }

    if (password.length < 6) {
        showFeedback('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    let users = getStoredUsers();
    
    // Verifica si el usuario ya existe
    if (users.some(user => user.username === username)) {
        showFeedback('El usuario ya existe', 'error');
        return;
    }

    // Registra el nuevo usuario
    users.push({ username, password, userType });
    saveUsers(users);
    
    showFeedback('¡Registro exitoso! Redirigiendo...', 'success');
    
    // Limpia el formulario
    document.getElementById('regUsername').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regUserType').value = '';

    // Redirige después de 2 segundos
    setTimeout(() => {
        showSection('login', document.getElementById('loginTab'));
    }, 2000);
}
// Inicio de sesión
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const selectedUserType = document.getElementById('userType').value;

    // Validación de campos
    if (!username || !password || !selectedUserType) {
        showFeedback('❌ Todos los campos son obligatorios', 'error');
        return;
    }

    const users = getStoredUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        showFeedback('🔍 Usuario no encontrado', 'error');
        return;
    }

    if (user.password !== password) {
        showFeedback('🔒 Contraseña incorrecta', 'error');
        return;
    }

    if (user.userType !== selectedUserType) {
        const correctType = user.userType === 'student' ? 'ESTUDIANTE' : 'DOCENTE';
        showFeedback(`👤 Error: Debes seleccionar tipo ${correctType}`, 'error');
        return;
    }

    // Login exitoso
    currentUser = user;
    showFeedback(`✅ ¡Bienvenid@ ${username}!`, 'success');

    // 1. Resetear todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // 2. Resetear todas las pestañas
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('hidden');
    });

    // 3. Mostrar solo la pestaña correspondiente
    const targetTab = document.getElementById(`${user.userType}Tab`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
        targetTab.classList.add('active');
    }

    // 4. Mostrar la sección correspondiente
    const targetSection = document.getElementById(user.userType);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // 5. Limpiar formulario de login
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('userType').selectedIndex = 0;
}

// Registro de resultados
function recordResult(entry) {
    const results = JSON.parse(localStorage.getItem('results') || '[]');
    results.push({ ...entry, user: currentUser.username, date: new Date().toISOString() });
    localStorage.setItem('results', JSON.stringify(results));
}

// Enviar recomendación
function sendRecommendation(studentName) {
    const message = prompt(`Recomendación para ${studentName}:`);
    if (!message) return;
    const recs = JSON.parse(localStorage.getItem('recs') || '[]');
    recs.push({ teacher: currentUser.username, student: studentName, message, date: new Date().toISOString() });
    localStorage.setItem('recs', JSON.stringify(recs));
    showFeedback('Recomendación enviada', 'success');
}

// Dashboard del docente
function buildTeacherDashboard() {
    const dash = document.getElementById('teacherDashboard');
    dash.innerHTML = '';
    const students = getStoredUsers().filter(u => u.userType === 'student');
    const results = JSON.parse(localStorage.getItem('results') || '[]');
    students.forEach(s => {
        const userRes = results.filter(r => r.user === s.username);
        const total = userRes.length;
        const correct = userRes.filter(r => r.correct).length;
        const pct = total ? Math.round(correct / total * 100) : 0;
        const card = document.createElement('div');
        card.className = 'card student-card';
        card.innerHTML = `
                <h4>${s.username}</h4>
                <p><strong>Progreso:</strong> ${pct}% | <strong>Ejercicios:</strong> ${total}</p>
                <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
                <button class="btn btn-secondary" onclick="sendRecommendation('${s.username}')">📤 Enviar Recomendación</button>
            `;
        dash.appendChild(card);
    });
}

// Navegación de secciones
function showFeedback(message, type) {
    // Eliminar feedback existente
    const existingFeedback = document.getElementById('feedbackArea');
    if (existingFeedback) existingFeedback.remove();

    // Crear nuevo elemento de feedback
    const feedback = document.createElement('div');
    feedback.id = 'feedbackArea';
    feedback.className = `feedback ${type}`;
    
    // Iconos personalizados por tipo
    const icons = {
        error: '⚠️',
        success: '✅',
        info: 'ℹ️'
    };
    
    feedback.innerHTML = `
        <div class="feedback-content">
            <span class="feedback-icon">${icons[type] || '•'}</span>
            <span class="feedback-message">${message}</span>
        </div>
    `;

    // Insertar en el formulario activo o en el body
    const activeCard = document.querySelector('.content-section.active .card') || document.body;
    activeCard.appendChild(feedback);

    // Auto-eliminación después de 4 segundos
    setTimeout(() => {
        if (feedback.parentNode) feedback.remove();
    }, 4000);
}

// Flujo de ejercicios y quiz
function startLevel(level) {
    currentLevel = level;
    currentExerciseIndex = 0;
    currentStep = 1;
    currentProgress = 0;
    document.getElementById('exerciseArea').classList.remove('hidden');
    loadExercise();
    updateProgress();
}
function loadExercise() {
    const ex = exercises[currentLevel][currentExerciseIndex];
    document.getElementById('exerciseProblem').textContent = `Factoriza: ${ex.problem}`;
    document.getElementById('studentAnswer').value = '';
    updateVisualBlocks(ex.problem);
    document.getElementById('feedbackArea').innerHTML = '';
}
function updateVisualBlocks(problem) {
    const container = document.querySelector('.visual-blocks');
    container.innerHTML = '';
    // Separa términos y operadores para mostrarlos en bloques
    problem.split(/([+-])/).filter(Boolean).forEach(token => {
        const block = document.createElement('div');
        block.className = 'block';
        block.textContent = token;
        container.appendChild(block);
    });
    // Agrega signo = y ?
    const eq = document.createElement('div');
    eq.className = 'block';
    eq.textContent = '=';
    container.appendChild(eq);

    const qm = document.createElement('div');
    qm.className = 'block';
    qm.textContent = '?';
    container.appendChild(qm);
}

// Verificar respuesta del estudiante
function checkAnswer() {
    const answer = document.getElementById('studentAnswer').value.trim();
    const correct = exercises[currentLevel][currentExerciseIndex].answer;
    if (answer.toLowerCase() === correct.toLowerCase()) {
        showFeedback('¡Correcto! 🎉', 'success');
        recordResult({ type: 'exercise', correct: true });
        currentProgress += 25;
        updateProgress();
        setTimeout(nextStep, 1000);
    } else {
        showFeedback(`Incorrecto. La respuesta es: ${correct}`, 'error');
        recordResult({ type: 'exercise', correct: false });
    }
}

// Pista para el ejercicio
function getHint() {
    const hint = exercises[currentLevel][currentExerciseIndex].hint;
    showFeedback(`💡 Pista: ${hint}`, 'info');
}

// Actualizar barra de progreso y pasos
function updateProgress() {
    document.getElementById('progressFill').style.width = currentProgress + '%';
    document.querySelectorAll('.step').forEach((el, i) => {
        el.classList.toggle('completed', i < currentStep - 1);
        el.classList.toggle('active', i === currentStep - 1);
    });
}

// Pasar al siguiente paso (ejercicio o quiz)
function nextStep() {
    if (currentStep < 4) {
        currentStep++;
        if (currentStep === 2 && currentExerciseIndex < exercises[currentLevel].length - 1) {
            currentExerciseIndex++;
            loadExercise();
        }
        if (currentStep === 4) {
            // Mostrar quiz
            document.getElementById('exerciseArea').classList.add('hidden');
            document.getElementById('quizArea').classList.remove('hidden');
            loadQuiz();
        }
        updateProgress();
    }
}

// Volver al paso anterior
function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        if (currentStep < 4) {
            document.getElementById('quizArea').classList.add('hidden');
            document.getElementById('exerciseArea').classList.remove('hidden');
        }
        updateProgress();
    }
}

// Cargar pregunta de quiz
function loadQuiz() {
    const q = quizQuestions[currentQuizIndex];
    document.getElementById('quizQuestion').textContent = q.question;
    document.querySelectorAll('.quiz-option').forEach((el, i) => {
        el.textContent = q.options[i];
        el.className = 'quiz-option';
    });
    selectedQuizOption = -1;
}

// Seleccionar opción de quiz
function selectOption(idx) {
    selectedQuizOption = idx;
    document.querySelectorAll('.quiz-option').forEach((el, i) => {
        el.classList.toggle('selected', i === idx);
    });
}

// Enviar respuesta de quiz
function submitQuiz() {
    const q = quizQuestions[currentQuizIndex];
    const isCorrect = selectedQuizOption === q.correct;
    showFeedback(isCorrect ? '¡Respuesta correcta! 🎉' : `Incorrecto. Era ${q.options[q.correct]}`, isCorrect ? 'success' : 'error');
    recordResult({ type: 'quiz', correct: isCorrect });
    setTimeout(() => {
        currentQuizIndex++;
        if (currentQuizIndex < quizQuestions.length) {
            loadQuiz();
        } else {
            // Quiz terminado: volver al inicio de estudiante
            document.getElementById('quizArea').classList.add('hidden');
            document.getElementById('exerciseArea').classList.add('hidden');
            showSection('student', document.querySelectorAll('.nav-tab')[1]);
        }
    }, 1000);
}

function logout() {
    // 1. Restablece todas las variables de sesión
    currentUser = null;
    currentLevel = 1;
    currentExerciseIndex = 0;
    currentStep = 1;
    currentProgress = 0;
    currentQuizIndex = 0;

    // 2. Oculta todas las secciones excepto login
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // 3. Muestra solo la sección de login
    const loginSection = document.getElementById('login');
    if (loginSection) {
        loginSection.classList.add('active');
    }

    // 4. Restablece las pestañas de navegación
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('hidden');
    });
    
    // 5. Activa solo la pestaña de login
    const loginTab = document.getElementById('loginTab');
    if (loginTab) {
        loginTab.classList.remove('hidden');
        loginTab.classList.add('active');
    }

    // 6. Muestra confirmación y scroll al inicio
    showFeedback('Sesión cerrada correctamente', 'success');
    window.scrollTo(0, 0);

    // 7. Limpia los campos del formulario de login
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('userType').selectedIndex = 0;
}

function showSection(sectionId, tabElement) {
    // 1. Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // 2. Mostrar la sección solicitada
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    // 3. Manejar pestañas activas
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    if (tabElement) {
        tabElement.classList.add('active');
    }

    // 4. Casos especiales
    if (sectionId === 'teacher') {
        buildTeacherDashboard();
    }
}