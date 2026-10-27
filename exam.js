// js/exam.js - CBT Examination Engine

let examData = null;
let currentQuestionIndex = 0;
let userResponses = {}; // { qIndex: { selectedOption: number|null, markedForReview: bool, visited: bool } }
let examLang = localStorage.getItem('nb_lang') || 'en';
let timerSeconds = 60 * 60; // 60 minutes
let timerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const examKey = urlParams.get('exam') || 'railway_alp';

  // Load questions
  examData = generateMockQuestions(examKey);
  document.getElementById('exam-banner-title').textContent = examData.title;

  // Initialize response state
  for (let i = 0; i < examData.questions.length; i++) {
    userResponses[i] = {
      selectedOption: null,
      markedForReview: false,
      visited: false
    };
  }

  buildPalette();
  loadQuestion(0);
  startTimer();
});

function toggleExamLanguage() {
  examLang = examLang === 'en' ? 'hi' : 'en';
  loadQuestion(currentQuestionIndex);
}

function startTimer() {
  const display = document.getElementById('timer-display');
  timerInterval = setInterval(() => {
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      alert(examLang === 'hi' ? '??? ??????! ???? ????? ????? ???? ?? ??? ???' : 'Time up! Your test is being auto-submitted.');
      submitTest();
      return;
    }
    timerSeconds--;
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, 1000);
}

function buildPalette() {
  const paletteContainer = document.getElementById('palette-container');
  paletteContainer.innerHTML = '';

  for (let i = 0; i < examData.questions.length; i++) {
    const btn = document.createElement('button');
    btn.className = 'palette-btn status-not-visited';
    btn.id = `palette-btn-${i}`;
    btn.textContent = i + 1;
    btn.onclick = () => jumpToQuestion(i);
    paletteContainer.appendChild(btn);
  }
}

function updatePaletteButton(idx) {
  const btn = document.getElementById(`palette-btn-${idx}`);
  if (!btn) return;
  const state = userResponses[idx];

  btn.className = 'palette-btn';

  if (state.markedForReview && state.selectedOption !== null) {
    btn.classList.add('status-answered-review');
  } else if (state.markedForReview) {
    btn.classList.add('status-review');
  } else if (state.selectedOption !== null) {
    btn.classList.add('status-answered');
  } else if (state.visited) {
    btn.classList.add('status-unanswered');
  } else {
    btn.classList.add('status-not-visited');
  }
}

function loadQuestion(idx) {
  currentQuestionIndex = idx;
  const q = examData.questions[idx];
  userResponses[idx].visited = true;

  document.getElementById('current-q-label').textContent = 
    examLang === 'hi' ? `?????? ${idx + 1} / ${examData.questions.length}` : `Question ${idx + 1} of ${examData.questions.length}`;

  const qText = examLang === 'hi' ? q.hi : q.en;
  document.getElementById('question-text').textContent = qText;

  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';

  const options = examLang === 'hi' ? q.optionsHi : q.optionsEn;

  options.forEach((optText, optIdx) => {
    const label = document.createElement('label');
    label.className = 'option-item';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `question_${idx}`;
    radio.value = optIdx;
    radio.checked = userResponses[idx].selectedOption === optIdx;

    radio.onchange = () => {
      userResponses[idx].selectedOption = optIdx;
      updatePaletteButton(idx);
    };

    const span = document.createElement('span');
    span.textContent = optText;

    label.appendChild(radio);
    label.appendChild(span);
    optionsContainer.appendChild(label);
  });

  document.getElementById('btn-prev').disabled = idx === 0;
  updatePaletteButton(idx);
}

function nextQuestion() {
  if (currentQuestionIndex < examData.questions.length - 1) {
    loadQuestion(currentQuestionIndex + 1);
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    loadQuestion(currentQuestionIndex - 1);
  }
}

function jumpToQuestion(idx) {
  loadQuestion(idx);
}

function clearResponse() {
  userResponses[currentQuestionIndex].selectedOption = null;
  loadQuestion(currentQuestionIndex);
  updatePaletteButton(currentQuestionIndex);
}

function markForReview() {
  userResponses[currentQuestionIndex].markedForReview = !userResponses[currentQuestionIndex].markedForReview;
  updatePaletteButton(currentQuestionIndex);
  nextQuestion();
}

function confirmSubmitTest() {
  const confirmed = confirm(
    examLang === 'hi'
      ? '???? ?? ??????? ??? ?? ???? ????? ????? ???? ????? ????'
      : 'Are you sure you want to submit your examination?'
  );
  if (confirmed) {
    submitTest();
  }
}

function submitTest() {
  clearInterval(timerInterval);

  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  examData.questions.forEach((q, idx) => {
    const selected = userResponses[idx].selectedOption;
    if (selected === null) {
      unanswered++;
    } else if (selected === q.correctIndex) {
      correct++;
    } else {
      incorrect++;
    }
  });

  const total = examData.questions.length;
  // Standard negative marking: +1 for correct, -0.33 for incorrect
  const rawScore = (correct * 1.0) - (incorrect * 0.33);
  const netScore = Math.max(0, rawScore).toFixed(2);
  const attempted = correct + incorrect;
  const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : '0';

  document.getElementById('res-total').textContent = total;
  document.getElementById('res-correct').textContent = correct;
  document.getElementById('res-incorrect').textContent = incorrect;
  document.getElementById('res-unanswered').textContent = unanswered;
  document.getElementById('res-score').textContent = netScore;
  document.getElementById('res-accuracy').textContent = `${accuracy}%`;

  document.getElementById('result-modal').classList.add('active');
}