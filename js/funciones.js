// ==========================
// Variables globales
// ==========================
let currentUser = null;
let currentLevel = 1;
let currentExerciseIndex = 0;
let currentStep = 1;
let selectedQuizOption = -1;
let currentQuizIndex = 0;

// ==========================
// Ejercicios
// ==========================
const exercises = {
  1: [
    { problem: "6x²+12x", answer: "6x(x+2)", hint: "Saca el factor común 6x" },
    { problem: "8a³+12a²", answer: "4a²(2a+3)", hint: "El factor común es 4a²" },
    { problem: "10y³+15y²", answer: "5y²(2y+3)", hint: "Saca 5y²" },
    { problem: "14x⁴+21x³", answer: "7x³(2x+3)", hint: "Factoriza 7x³" },
    { problem: "9m²+12m", answer: "3m(3m+4)", hint: "El factor común es 3m" },
    { problem: "25p²+30p", answer: "5p(5p+6)", hint: "Factor común: 5p" },
    { problem: "18x³+24x²", answer: "6x²(3x+4)", hint: "El factor común es 6x²" },
    { problem: "20a²+30a", answer: "10a(2a+3)", hint: "Saca 10a" },
    { problem: "12b³+16b²", answer: "4b²(3b+4)", hint: "Factor común 4b²" },
    { problem: "15c²+25c", answer: "5c(3c+5)", hint: "Saca 5c" }
  ],
  2: [
    { problem: "x²-9", answer: "(x+3)(x-3)", hint: "a²-b²=(a+b)(a-b)" },
    { problem: "4x²-25", answer: "(2x+5)(2x-5)", hint: "Es (2x)² - 5²" },
    { problem: "y²-49", answer: "(y+7)(y-7)", hint: "Es diferencia de cuadrados" },
    { problem: "9a²-16", answer: "(3a+4)(3a-4)", hint: "a=3a, b=4" },
    { problem: "25m²-36", answer: "(5m+6)(5m-6)", hint: "Es (5m)² - 6²" },
    { problem: "49p²-81q²", answer: "(7p+9q)(7p-9q)", hint: "a=7p, b=9q" },
    { problem: "x²-121", answer: "(x+11)(x-11)", hint: "a=x, b=11" },
    { problem: "16a²-1", answer: "(4a+1)(4a-1)", hint: "Es (4a)² - 1²" },
    { problem: "100y²-64", answer: "(10y+8)(10y-8)", hint: "Es (10y)² - 8²" },
    { problem: "36x²-49", answer: "(6x+7)(6x-7)", hint: "Es (6x)² - 7²" }
  ]
};

// ==========================
// Funciones de ejercicios
// =================F=========

// Inicia nivel
function startLevel(level) {
  currentLevel = level;
  currentExerciseIndex = 0;
  currentStep = 1;

  document.getElementById('niveles').style.display = 'none';
  document.getElementById('exerciseSection').style.display = 'flex';

  // Generar pasos dinámicamente
  const stepsContainer = document.querySelector('.step-indicator');
  stepsContainer.innerHTML = '';
  exercises[level].forEach((_, i) => {
    const step = document.createElement('div');
    step.classList.add('step');
    if (i === 0) step.classList.add('active');
    step.textContent = i + 1;
    stepsContainer.appendChild(step);
  });

  loadExercise();
  updateProgress();
}

// Cargar ejercicio actual
function loadExercise() {
  const ex = exercises[currentLevel][currentExerciseIndex];
  document.getElementById('exerciseProblem').textContent = `Factoriza: ${ex.problem}`;
  document.getElementById('studentAnswer').value = '';
  updateVisualBlocks(ex.problem);
  document.getElementById('feedbackArea').innerHTML = '';
}

// Visual blocks
function updateVisualBlocks(problem) {
  const container = document.getElementById('visualBlocks');
  container.innerHTML = '';
  problem.split(/([+-])/).filter(Boolean).forEach(token => {
    const block = document.createElement('div');
    block.className = 'block';
    block.textContent = token;
    container.appendChild(block);
  });
  const eq = document.createElement('div');
  eq.className = 'block';
  eq.textContent = '=';
  container.appendChild(eq);
  const qm = document.createElement('div');
  qm.className = 'block';
  qm.textContent = '?';
  container.appendChild(qm);
}

// Verificar respuesta
function checkAnswer() {
  const answer = document.getElementById('studentAnswer').value.trim();
  const exercise = exercises[currentLevel][currentExerciseIndex];
  const feedback = document.getElementById('feedbackArea');

  if (answer.replace(/\s+/g, '') === exercise.answer.replace(/\s+/g, '')) {
    feedback.innerHTML = '<div class="feedback success"><span class="feedback-icon">✅</span> ¡Correcto!</div>';
    recordResult({ type: 'exercise', correct: true });
    setTimeout(nextStep, 1000);
  } else {
    feedback.innerHTML = `<div class="feedback error"><span class="feedback-icon">❌</span> Incorrecto. Respuesta correcta: ${exercise.answer}</div>`;
    recordResult({ type: 'exercise', correct: false });
  }
}

// Pista
function getHint() {
  const ex = exercises[currentLevel][currentExerciseIndex];
  document.getElementById('feedbackArea').innerHTML =
    `<div class="feedback info"><span class="feedback-icon">💡</span> Pista: ${ex.hint}</div>`;
}

// Siguiente ejercicio
function nextStep() {
  if (currentExerciseIndex < exercises[currentLevel].length - 1) {
    currentExerciseIndex++;
    currentStep++;
    loadExercise();
    updateProgress();
  } else {
    alert("¡Nivel completado! 🎉");
    document.getElementById('exerciseSection').style.display = 'none';
    document.getElementById('niveles').style.display = 'flex';
  }
}

// Retroceder
function previousStep() {
  if (currentExerciseIndex > 0) {
    currentExerciseIndex--;
    currentStep--;
    loadExercise();
    updateProgress();
  }
}

// Barra de progreso
function updateProgress() {
  const total = exercises[currentLevel].length;
  const percent = (currentStep / total) * 100;
  document.getElementById('progressFill').style.width = percent + '%';

  document.querySelectorAll('.step').forEach((el, i) => {
    el.classList.toggle('completed', i < currentStep - 1);
    el.classList.toggle('active', i === currentStep - 1);
  });
}

// Guardar resultados
function recordResult(entry) {
  const userData = JSON.parse(localStorage.getItem('currentUser'));
  if (!userData || !userData.uid) return;

  const userRef = db.collection("usuarios").doc(userData.uid);

  userRef.get().then(doc => {
    if (!doc.exists) return;

    let progreso = doc.data().progreso || { correctas: 0 };

    // 🔹 Solo sumamos si está correcto
    if (entry.correct) {
      progreso.correctas += 1;
    }

    // 🔹 El total siempre es fijo (20)
    progreso.total = 20;

    console.log("🔥 Guardando progreso:", progreso);

    return userRef.update({ progreso });
  }).catch(err => {
    console.error("❌ Error al guardar progreso:", err);
  });
}
// Insertar símbolo
function insertSymbol(symbol) {
  const input = document.getElementById('studentAnswer');
  const start = input.selectionStart;
  const end = input.selectionEnd;
  input.setRangeText(symbol, start, end, 'end');
  input.focus();
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('currentUser');
  window.location.href = '../index.html';
}
