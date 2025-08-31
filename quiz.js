document.addEventListener("DOMContentLoaded", () => {
  const studentData = localStorage.getItem("edunishStudentData");
  if (!studentData) {
    window.location.href = "registration.html";
  }
});


// ===== State =====
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let quizKey = "";

// Timer (20 minutes = 1200 seconds)
let timerInterval = null;
let timeLeft = 20 * 60; // 20 minutes in seconds

// ===== DOM =====
const mediumSelect = document.getElementById("medium-select");
const gradeSelect = document.getElementById("grade-select");
const lessonSelect = document.getElementById("lesson-select");
const seriesSection = document.getElementById("series-section");
const seriesCards = document.getElementById("series-cards");

const quizContainer = document.getElementById("quiz-container");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const nextBtn = document.getElementById("next-btn");
const progressBar = document.getElementById("progress-bar");

const resultContainer = document.getElementById("result-container");
const progressList = document.getElementById("progress-list");
const timerEl = document.getElementById("timer");

// ===== Helpers =====
function showSeriesError(message) {
  seriesCards.innerHTML = `
    <div class="col-span-2 p-4 rounded-xl border border-red-300 bg-red-50 text-red-700">
      <div class="font-semibold mb-1">Couldn’t load this lesson.</div>
      <div class="text-sm">${message}</div>
      <div class="text-xs mt-2 opacity-80">
        Tip: Make sure the JSON has quoted keys (e.g. "question": "...") or run the page via a local server (not file://).
      </div>
    </div>
  `;
  seriesSection.classList.remove("hidden");
}

async function loadLessonFile(filename) {
  const res = await fetch(`./${filename}`);
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (_) {
    const fixed = text
      .replace(/(\{|,)\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1 "$2":')
      .replace(/'/g, '"');
    try {
      return JSON.parse(fixed);
    } catch (err2) {
      throw new Error("Invalid JSON format after auto-fix attempt.");
    }
  }
}

function normalizeQuestions(raw) {
  if (Array.isArray(raw)) {
    return raw.map(q => ({
      ...q,
      series: q.series || "Series"
    }));
  } else if (raw && typeof raw === "object") {
    return Object.entries(raw).flatMap(([seriesName, arr]) =>
      (arr || []).map(q => ({ ...q, series: seriesName }))
    );
  }
  return [];
}

// ===== Medium → Grade =====
mediumSelect.addEventListener("change", () => {
  if (mediumSelect.value) {
    gradeSelect.parentElement.classList.remove("hidden");
  } else {
    gradeSelect.parentElement.classList.add("hidden");
    lessonSelect.parentElement.classList.add("hidden");
    seriesSection.classList.add("hidden");
  }
});

// ===== Grade → Lesson =====
gradeSelect.addEventListener("change", () => {
  if (gradeSelect.value) {
    lessonSelect.parentElement.classList.remove("hidden");
    lessonSelect.innerHTML = `<option value="">--Choose Lesson--</option>`;

    const lessonCount = gradeSelect.value === "10" ? 9 : 6;
    for (let i = 1; i <= lessonCount; i++) {
      const option = document.createElement("option");
      option.value = i.toString().padStart(2, "0");
      option.textContent = `Lesson ${i.toString().padStart(2, "0")}`;
      lessonSelect.appendChild(option);
    }
  } else {
    lessonSelect.parentElement.classList.add("hidden");
    seriesSection.classList.add("hidden");
  }
});

// ===== Lesson → Series =====
lessonSelect.addEventListener("change", async () => {
  const medium = mediumSelect.value;
  const grade = gradeSelect.value;
  const lesson = lessonSelect.value;
  if (!medium || !grade || !lesson) return;

  const filename = `${medium}_${grade}_L${lesson}.json`;

  seriesCards.innerHTML = `
    <div class="col-span-2 p-3 text-sm text-gray-600">Loading series…</div>
  `;
  seriesSection.classList.remove("hidden");

  try {
    const raw = await loadLessonFile(filename);
    const data = normalizeQuestions(raw);

    if (!data.length) {
      showSeriesError("No questions found in this file.");
      return;
    }

    const seriesList = [...new Set(data.map(q => q.series))];
    seriesCards.innerHTML = "";
    seriesList.forEach(s => {
      const card = document.createElement("div");
      card.className =
        "p-4 bg-white rounded-xl shadow cursor-pointer hover:bg-gray-50";
      card.textContent = s;
      card.addEventListener("click", () => {
        startQuiz(
          data.filter(q => q.series === s),
          `${medium}_${grade}_${lesson}_${s}`
        );
      });
      seriesCards.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading lesson file:", err);
    showSeriesError(err.message || "Unknown error while loading the file.");
  }
});

// ===== Start Quiz =====
function startQuiz(questions, key) {
  currentQuestions = questions;
  currentIndex = 0;
  score = 0;
  quizKey = key;

  resultContainer.classList.add("hidden");
  quizContainer.classList.remove("hidden");
  seriesSection.classList.add("hidden");

  // 🔥 Hide the whole selection card after quiz starts
  mediumSelect.parentElement.parentElement.classList.add("hidden");

  // Reset & start 20-min timer
  clearInterval(timerInterval);
  timeLeft = 20 * 60; // reset to 20 minutes
  startTimer();

  renderQuestion();
  updateProgress();
}


// ===== Timer =====
function startTimer() {
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      finishQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  if (!timerEl) return;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const percent = (timeLeft / (20 * 60)) * 100;
  timerEl.style.setProperty("--progress", percent + "%");
}

// ===== Render Question =====
let selectedIndex = null;

function renderQuestion() {
  if (currentIndex >= currentQuestions.length) {
    finishQuiz();
    return;
  }

  const q = currentQuestions[currentIndex];
  const parts = q.question.split("\n");
  const sentence = parts.shift();
  const code = parts.join("\n");

  quizQuestion.innerHTML = `
    <div class="mb-2 font-semibold">${sentence}</div>
    <pre class="bg-gray-100 p-2 rounded text-sm">${code}</pre>
  `;

  quizOptions.innerHTML = "";
  selectedIndex = null;

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className =
      "block w-full text-left border px-3 py-2 rounded hover:bg-gray-100";
    btn.textContent = opt;

    btn.addEventListener("click", () => {
      [...quizOptions.children].forEach(b =>
        b.classList.remove("bg-blue-200")
      );
      btn.classList.add("bg-blue-200");
      selectedIndex = i;
      nextBtn.classList.remove("hidden");
    });

    quizOptions.appendChild(btn);
  });

  nextBtn.textContent =
    currentIndex === currentQuestions.length - 1 ? "Finish Quiz" : "Next";
}

// ===== Next Button =====
nextBtn.addEventListener("click", () => {
  if (selectedIndex !== null) {
    if (selectedIndex === currentQuestions[currentIndex].answer) {
      score++;
    }
  }
  currentIndex++;
  nextBtn.classList.add("hidden");
  renderQuestion();
  updateProgress();
});

// ===== Update Progress Bar =====
function updateProgress() {
  const percent = Math.round((currentIndex / currentQuestions.length) * 100);
  progressBar.style.width = percent + "%";
}

// ===== Finish Quiz =====
function finishQuiz() {
  clearInterval(timerInterval);

  const total = currentQuestions.length;
  const percent = Math.round((score / total) * 100);
  const record = { score, total, percent };

  localStorage.setItem(quizKey, JSON.stringify(record));

  quizContainer.classList.add("hidden");
  resultContainer.classList.remove("hidden");

  resultContainer.innerHTML = `
    <div class="p-6 bg-white rounded-xl shadow text-center">
      <h2 class="text-xl font-bold mb-2">Quiz Finished!</h2>
      <p class="mb-4">You scored ${score} / ${total} (${percent}%).</p>
      <p class="text-green-600 font-semibold mb-4">🎉 Great effort, keep practicing!</p>
      <button id="retry-btn" class="bg-blue-600 text-white px-6 py-2 rounded-lg mr-2">Retry</button>
      <button id="back-btn" class="bg-gray-600 text-white px-6 py-2 rounded-lg">Choose Another</button>
    </div>
  `;

  document.getElementById("retry-btn").addEventListener("click", () => {
    startQuiz([...currentQuestions], quizKey);
  });

  document.getElementById("back-btn").addEventListener("click", () => {
  // ✅ Stop the timer completely
  clearInterval(timerInterval);

  resultContainer.classList.add("hidden");
  quizContainer.classList.add("hidden");

  // ✅ Show the selection card again
  mediumSelect.parentElement.parentElement.classList.remove("hidden");

  seriesSection.classList.add("hidden");
  lessonSelect.parentElement.classList.add("hidden");
  gradeSelect.parentElement.classList.add("hidden");

  // Reset dropdowns
  mediumSelect.value = "";
  gradeSelect.value = "";
  lessonSelect.innerHTML = `<option value="">--Choose Lesson--</option>`;
});

  renderProgressOverview();
}

// ===== Render Progress Overview =====
function renderProgressOverview() {
  progressList.innerHTML = "";
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes("Series")) {
      const data = JSON.parse(localStorage.getItem(key));
      const card = document.createElement("div");
      card.className =
        "p-4 rounded-xl shadow-md text-white " +
        (data.percent >= 75
          ? "bg-green-500"
          : data.percent >= 50
          ? "bg-yellow-500"
          : "bg-red-500");
      card.innerHTML = `
        <h3 class="font-semibold">${key.replace(/_/g, " ")}</h3>
        <p>Score: ${data.score} / ${data.total} (${data.percent}%)</p>
      `;
      progressList.appendChild(card);
    }
  }
}

renderProgressOverview();
