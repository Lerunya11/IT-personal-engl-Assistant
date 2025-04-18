// ===== СЛОВО ДНЯ =====
async function loadWord() {
  const res = await fetch("data/words.json");
  const words = await res.json();
  const index = Math.floor(Math.random() * words.length);
  const word = words[index];

  document.getElementById("word").innerText = word.word;
  document.getElementById(
    "translation"
  ).innerText = `Перевод: ${word.translation}`;
  document.getElementById("example").innerText = `Пример: ${word.example}`;
}

function speakWord() {
  const word = document.getElementById("word").innerText;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

function nextWord() {
  loadWord();
}

// ===== ФРАЗА ДНЯ =====
async function loadPhrase() {
  const res = await fetch("data/phrases.json");
  const phrases = await res.json();
  const index = Math.floor(Math.random() * phrases.length);
  const phrase = phrases[index];

  document.getElementById("phrase").innerText = phrase.phrase;
  document.getElementById(
    "translation"
  ).innerText = `Перевод: ${phrase.translation}`;
  document.getElementById("example").innerText = `Пример: ${phrase.example}`;
}

function speakPhrase() {
  const phrase = document.getElementById("phrase").innerText;
  const utterance = new SpeechSynthesisUtterance(phrase);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

function nextPhrase() {
  loadPhrase();
}

// ===== ТЕМЫ =====
async function showTopics() {
  const level = document.getElementById("levelSelect").value;
  const topicList = document.getElementById("topicList");
  const topicContent = document.getElementById("topicContent");

  topicList.innerHTML = "";
  topicContent.innerHTML = "";

  if (!level) return;

  const res = await fetch("data/topics.json");
  const data = await res.json();

  const topics = data[level];
  if (!topics) {
    topicList.innerText = "Тем нет.";
    return;
  }

  for (let key in topics) {
    const btn = document.createElement("button");
    btn.innerText = topics[key].title;
    btn.className = "menu-button";
    btn.onclick = () => showTopicContent(topics[key]);
    topicList.appendChild(btn);
  }
}

function showTopicContent(topic) {
  const topicContent = document.getElementById("topicContent");
  topicContent.innerHTML = `
    <h2>${topic.title}</h2>
    <h3>🧠 Слова:</h3>
    <ul>${topic.vocab.map((v) => `<li>${v.en} — ${v.ru}</li>`).join("")}</ul>
    <h3>💬 Фразы:</h3>
    <ul>${topic.phrases.map((p) => `<li>${p.en} — ${p.ru}</li>`).join("")}</ul>
    <h3>📃 Примеры:</h3>
    <ul>${topic.examples.map((e) => `<li>💬 ${e}</li>`).join("")}</ul>
    <h3>📝 Задание:</h3>
    <p>${topic.task}</p>
  `;
}

// ===== КАРТОЧКИ =====
let flashcards = [];
let currentFlashcardIndex = 0;

async function loadFlashcards() {
  const res = await fetch("data/flashcards.json");
  flashcards = await res.json();
  currentFlashcardIndex = Math.floor(Math.random() * flashcards.length);
  showFlashcard();
}

function showFlashcard() {
  document.getElementById("front").style.display = "block";
  document.getElementById("back").style.display = "none";

  const card = flashcards[currentFlashcardIndex];
  document.getElementById("frontText").innerText = card.word;
  document.getElementById(
    "backText"
  ).innerText = `${card.translation}\n\n💬 ${card.example}`;
}

function flipCard() {
  document.getElementById("front").style.display = "none";
  document.getElementById("back").style.display = "block";
}

function nextFlashcard() {
  currentFlashcardIndex = (currentFlashcardIndex + 1) % flashcards.length;

  let c = parseInt(localStorage.getItem("flashcardCount") || 0);
  localStorage.setItem("flashcardCount", c + 1);

  showFlashcard();
}

function speakFlashcard() {
  const card = flashcards[currentFlashcardIndex];
  const utterance = new SpeechSynthesisUtterance(card.word);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

// ===== МИНИ-ТЕСТ =====
let quizCards = [];
let currentQuiz = {};

async function loadQuizCards() {
  const res = await fetch("data/flashcards.json");
  quizCards = await res.json();
  nextQuiz();
}

function nextQuiz() {
  const quizWordElement = document.getElementById("quizWord");
  const quizOptionsElement = document.getElementById("quizOptions");
  const quizResult = document.getElementById("quizResult");

  quizResult.innerText = "";
  quizOptionsElement.innerHTML = "";

  const correctIndex = Math.floor(Math.random() * quizCards.length);
  currentQuiz = quizCards[correctIndex];

  const options = [currentQuiz.translation];
  while (options.length < 3) {
    const random =
      quizCards[Math.floor(Math.random() * quizCards.length)].translation;
    if (!options.includes(random)) options.push(random);
  }

  options.sort(() => Math.random() - 0.5);

  quizWordElement.innerText = `Как переводится: ${currentQuiz.word}?`;

  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "menu-button";
    btn.innerText = option;
    btn.onclick = () => {
      if (option === currentQuiz.translation) {
        quizResult.innerText = "✅ Правильно!";
        quizResult.style.color = "lightgreen";
      } else {
        quizResult.innerText = `❌ Неправильно. Правильно: ${currentQuiz.translation}`;
        quizResult.style.color = "#ff8080";
      }
    };
    quizOptionsElement.appendChild(btn);
  });
}

// ===== ПРОГРЕСС =====
function updateProgress() {
  const flash = localStorage.getItem("flashcardCount") || 0;
  const words = localStorage.getItem("wordsCount") || 0;
  const phrases = localStorage.getItem("phrasesCount") || 0;

  document.getElementById("flashcardsCount").innerText = flash;
  document.getElementById("wordsCount").innerText = words;
  document.getElementById("phrasesCount").innerText = phrases;

  const total = parseInt(flash) + parseInt(words) + parseInt(phrases);
  const mot = document.getElementById("motivation");
  if (total >= 50) mot.innerText = "🔥 Ты — машина! Продолжай!";
  else if (total >= 20) mot.innerText = "🚀 Уже отличный прогресс!";
  else if (total >= 5) mot.innerText = "👍 Хорошее начало!";
  else mot.innerText = "Начни с первого шага — ты сможешь 💜";
}

function resetProgress() {
  localStorage.removeItem("flashcardCount");
  localStorage.removeItem("wordsCount");
  localStorage.removeItem("phrasesCount");
  updateProgress();
}

// ===== АВТО-ЗАПУСК НА СТРАНИЦАХ =====
if (window.location.pathname.includes("word.html")) {
  loadWord();
  let c = parseInt(localStorage.getItem("wordsCount") || 0);
  localStorage.setItem("wordsCount", c + 1);
}

if (window.location.pathname.includes("phrase.html")) {
  loadPhrase();
  let c = parseInt(localStorage.getItem("phrasesCount") || 0);
  localStorage.setItem("phrasesCount", c + 1);
}

if (window.location.pathname.includes("flashcards.html")) {
  loadFlashcards();
}

if (window.location.pathname.includes("quiz.html")) {
  loadQuizCards();
}

if (window.location.pathname.includes("progress.html")) {
  updateProgress();
}
