// document.addEventListener("DOMContentLoaded", () => {
//   const studentData = localStorage.getItem("edunishStudentData");
//   if (!studentData) {
//     window.location.href = "registration.html";
//   }
// });


// ===== State =====
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let quizKey = "";
let userAnswers = []; 

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
  userAnswers = [];

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
    // ✅ Save the user’s selected answer
    userAnswers[currentIndex] = selectedIndex;

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

  // ✅ Build detailed answers array
  const answers = currentQuestions.map((q, i) => ({
    question: q.question,
    options: q.options,
    correctAnswer: q.answer,
    userAnswer: userAnswers[i] ?? null
  }));

  const record = { 
    score, 
    total, 
    percent, 
    completedAt: new Date().toISOString(),
    answers // ✅ store answers
  };

  localStorage.setItem(quizKey, JSON.stringify(record));

  quizContainer.classList.add("hidden");
  resultContainer.classList.remove("hidden");

  // ✅ Added Review button
  resultContainer.innerHTML = `
    <div class="p-6 bg-white rounded-xl shadow text-center">
      <h2 class="text-xl font-bold mb-2">Quiz Finished!</h2>
      <p class="mb-4">You scored ${score} / ${total} (${percent}%).</p>
      <p class="text-green-600 font-semibold mb-4">🎉 Great effort, keep practicing!</p>
      <button id="retry-btn" class="bg-blue-600 text-white px-6 py-2 rounded-lg mr-2">Retry</button>
      <button id="review-btn" class="bg-purple-600 text-white px-6 py-2 rounded-lg mr-2">Review Answers</button>
      <button id="back-btn" class="bg-gray-600 text-white px-6 py-2 rounded-lg">Choose Another</button>
    </div>
  `;

  document.getElementById("retry-btn").addEventListener("click", () => {
    startQuiz([...currentQuestions], quizKey);
  });

  document.getElementById("review-btn").addEventListener("click", () => {
    showReview(record); // ✅ call review function
  });

  document.getElementById("back-btn").addEventListener("click", () => {
    clearInterval(timerInterval);
    resultContainer.classList.add("hidden");
    quizContainer.classList.add("hidden");
    mediumSelect.parentElement.parentElement.classList.remove("hidden");
    seriesSection.classList.add("hidden");
    lessonSelect.parentElement.classList.add("hidden");
    gradeSelect.parentElement.classList.add("hidden");
    mediumSelect.value = "";
    gradeSelect.value = "";
    lessonSelect.innerHTML = `<option value="">--Choose Lesson--</option>`;
  });

  renderProgressOverview();
}

// ===== Render Progress Overview =====
// ===== COMPLETE ENHANCED PROGRESS OVERVIEW CODE =====

// ===== Interactive Effects =====
function createRipple(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const ripple = document.createElement('span');
  
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');
  
  card.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
}

function generateConfetti() {
  let confetti = '';
  for (let i = 0; i < 6; i++) {
    const left = Math.random() * 100;
    const delay = Math.random() * 2;
    confetti += `<div class="confetti" style="left: ${left}%; animation-delay: ${delay}s;"></div>`;
  }
  return confetti;
}

function generateSparkles() {
  let sparkles = '';
  for (let i = 0; i < 4; i++) {
    const left = Math.random() * 80 + 10;
    const top = Math.random() * 80 + 10;
    const delay = Math.random() * 3;
    sparkles += `<div class="sparkle" style="left: ${left}%; top: ${top}%; animation-delay: ${delay}s;"></div>`;
  }
  return sparkles;
}

function addFloatingParticles(card) {
  const createParticle = () => {
    const particle = document.createElement('div');
    particle.className = 'progress-particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 2 + 's';
    card.appendChild(particle);
    
    setTimeout(() => particle.remove(), 3000);
  };
  
  // Create particles periodically
  const particleInterval = setInterval(createParticle, window.innerWidth < 768 ? 2000 : 800);
  
  // Stop after 10 seconds
  setTimeout(() => clearInterval(particleInterval), window.innerWidth < 768 ? 5000 : 10000);
}

// ===== Progress Card Click Handler =====
function handleProgressCardClick(key, data) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-xl p-8 max-w-md mx-4 text-center relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <h3 class="text-xl font-bold mb-4 text-gray-500">
        ${key.replace(/_/g, ' ')}
      </h3>
      <div class="space-y-3 mb-6 text-gray-700">
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <p class="text-lg"><strong>Score:</strong> ${data.score} out of ${data.total}</p>
          <p class="text-lg"><strong>Percentage:</strong> ${data.percent}%</p>
          ${data.completedAt ? `<p class="text-sm opacity-75"><strong>Completed:</strong> ${new Date(data.completedAt).toLocaleDateString()}</p>` : ''}
        </div>
      </div>
      <div class="flex justify-center space-x-4">
        <button class="close-modal bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
          Close
        </button>
        <button class="retry-quiz bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors" data-quiz-key="${key}">
          Retry Quiz
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
  modal.querySelector('.retry-quiz').addEventListener('click', (e) => {
    retryQuiz(e.target.dataset.quizKey);
    modal.remove();
  });
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// ===== Retry Quiz from Progress Card =====
function retryQuiz(quizKey) {
  const parts = quizKey.split('_');
  if (parts.length >= 4) {
    const medium = parts[0];
    const grade = parts[1];
    const lesson = parts[2];
    const series = parts.slice(3).join('_');
    
    mediumSelect.value = medium;
    gradeSelect.value = grade;
    
    gradeSelect.dispatchEvent(new Event('change'));
    
    setTimeout(() => {
      lessonSelect.value = lesson.replace('L', '');
      lessonSelect.dispatchEvent(new Event('change'));
      
      setTimeout(() => {
        const seriesCard = Array.from(seriesCards.children)
          .find(card => card.textContent.trim() === series);
        if (seriesCard) {
          seriesCard.click();
        }
      }, 500);
    }, 300);
  }
}

// ===== Enhanced Progress Statistics =====
function calculateOverallStats() {
  const allProgress = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes("Series")) {
      const data = JSON.parse(localStorage.getItem(key));
      allProgress.push(data);
    }
  }
  
  if (allProgress.length === 0) return null;
  
  const totalQuizzes = allProgress.length;
  const totalQuestions = allProgress.reduce((sum, p) => sum + p.total, 0);
  const totalCorrect = allProgress.reduce((sum, p) => sum + p.score, 0);
  const averagePercent = Math.round(allProgress.reduce((sum, p) => sum + p.percent, 0) / totalQuizzes);
  const perfectScores = allProgress.filter(p => p.percent === 100).length;
  
  return {
    totalQuizzes,
    totalQuestions,
    totalCorrect,
    averagePercent,
    perfectScores
  };
}

// ===== Overall Stats Display =====
function renderOverallStats() {
  const stats = calculateOverallStats();
  if (!stats) return;
  
  const statsCard = document.createElement('div');
  statsCard.className = 'col-span-full mb-6 p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl text-white relative overflow-hidden';
  statsCard.innerHTML = `
    <div class="relative z-10">
      <h3 class="text-xl font-bold mb-4 text-center">🎯 Overall Performance</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div class="stat-item">
          <div class="stat-number text-2xl font-black">${stats.totalQuizzes}</div>
          <div class="stat-label text-sm opacity-90">Quizzes</div>
        </div>
        <div class="stat-item">
          <div class="stat-number text-2xl font-black">${stats.totalQuestions}</div>
          <div class="stat-label text-sm opacity-90">Questions</div>
        </div>
        <div class="stat-item">
          <div class="stat-number text-2xl font-black">${stats.totalCorrect}</div>
          <div class="stat-label text-sm opacity-90">Correct</div>
        </div>
        <div class="stat-item">
          <div class="stat-number text-2xl font-black">${stats.averagePercent}%</div>
          <div class="stat-label text-sm opacity-90">Average</div>
        </div>
        <div class="stat-item">
          <div class="stat-number text-2xl font-black">${stats.perfectScores}</div>
          <div class="stat-label text-sm opacity-90">Perfect</div>
        </div>
      </div>
    </div>
    
    <div class="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
      <div class="absolute top-4 left-4 text-4xl animate-spin">⚡</div>
      <div class="absolute top-4 right-4 text-3xl animate-bounce">🚀</div>
      <div class="absolute bottom-4 left-8 text-2xl animate-pulse">💎</div>
      <div class="absolute bottom-4 right-8 text-3xl animate-ping">🌟</div>
    </div>
  `;
  
  progressList.insertBefore(statsCard, progressList.firstChild);
}

// ===== Enhanced Progress Overview Renderer =====
function renderProgressOverview() {
  progressList.innerHTML = "";
  
  const progressData = [];
  
  // Collect all quiz progress from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes("Series")) {
      const data = JSON.parse(localStorage.getItem(key));
      progressData.push({ key, ...data });
    }
  }
  
  // Add overall stats if there's data
  if (progressData.length > 0) {
    renderOverallStats();
  }
  
  // Sort by percentage (highest first)
  progressData.sort((a, b) => b.percent - a.percent);
  
  progressData.forEach((data, index) => {
    const card = document.createElement("div");
    
    // Determine card class based on percentage
    let cardClass = "bg-red-500";
    let achievement = "try-again";
    
    if (data.percent >= 90) {
      cardClass = "bg-green-500";
      achievement = "perfect";
    } else if (data.percent >= 75) {
      cardClass = "bg-green-500";
      achievement = "high";
    } else if (data.percent >= 50) {
      cardClass = "bg-yellow-500";
      achievement = "good";
    }
    
    card.className = `relative p-6 rounded-xl shadow-lg text-white transform transition-all duration-500 cursor-pointer ${cardClass}`;
    card.setAttribute('data-percent', data.percent);
    card.setAttribute('data-achievement', achievement);
    
    // Format the series name
    const formattedName = data.key
      .replace(/_/g, " ")
      .replace(/Series/g, "")
      .trim();
    
    // Add grade indicator
    const gradeMatch = data.key.match(/(\d{1,2})/);
    const grade = gradeMatch ? gradeMatch[1] : "?";
    
    card.innerHTML = `
      <div class="grade-indicator">${grade}</div>
      
      ${data.percent === 100 ? '<div class="achievement-badge">🏆</div>' : ''}
      ${data.percent >= 75 && data.percent < 100 ? '<div class="achievement-badge">⭐</div>' : ''}
      ${data.percent >= 50 && data.percent < 75 ? '<div class="achievement-badge">👍</div>' : ''}
      
      <div class="relative z-10">
        <h3 class="font-bold text-lg mb-2 pr-16">${formattedName}</h3>
        
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-number">${data.score}</span>
            <span class="stat-label">Correct</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${data.total}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${data.percent}%</span>
            <span class="stat-label">Score</span>
          </div>
        </div>
        
        <div class="mini-progress">
          <div class="mini-progress-fill" style="width: ${data.percent}%"></div>
        </div>
        
        ${data.completedAt ? `<div class="text-xs opacity-75 mt-2">Completed: ${new Date(data.completedAt).toLocaleDateString()}</div>` : ''}
      </div>
      
      ${data.percent === 100 ? generateConfetti() : ''}
      ${data.percent >= 90 ? generateSparkles() : ''}
    `;
    
    // Add click events
    card.addEventListener('click', (e) => {
      createRipple(e);
      setTimeout(() => handleProgressCardClick(data.key, data), 100);
    });
    
    // Add floating particles for high scores
    if (data.percent >= 75) {
      setTimeout(() => addFloatingParticles(card), index * 200);
    }
    
    progressList.appendChild(card);
  });
}

// ===== Update the HTML structure for the progress section =====
function updateProgressSectionHTML() {
  const progressSection = progressList.parentElement;
  
  // Wrap in enhanced container if not already wrapped
  if (!progressSection.id || progressSection.id !== 'progress-section') {
    progressSection.id = 'progress-section';
    progressSection.className = 'w-full max-w-4xl mx-auto mt-8';
    
    const title = progressSection.querySelector('h2');
    if (title) {
      title.innerHTML = '📊 Your Learning Journey ✨';
    }
  }
}
// Initialize enhanced progress on page load
document.addEventListener("DOMContentLoaded", () => {
  updateProgressSectionHTML();
  renderProgressOverview();
});
function showReview(record) {
  let reviewIndex = 0;

  function renderReviewCard() {
    const a = record.answers[reviewIndex];
    const isCorrect = a.userAnswer === a.correctAnswer;

    resultContainer.innerHTML = `
      <div class="p-6 bg-white rounded-xl shadow text-gray-800 text-center">
        <h2 class="text-xl font-bold mb-4">Review Answers (${reviewIndex + 1}/${record.answers.length})</h2>
        
        <div class="p-4 border rounded-lg mb-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'} text-gray-800">
          <p class="font-semibold mb-2">Q${reviewIndex + 1}: ${a.question}</p>
          <p>Your Answer: 
            <span class="${isCorrect ? 'text-green-600' : 'text-red-600'}">
              ${a.userAnswer !== null ? a.options[a.userAnswer] : "Not answered"}
            </span>
          </p>
          ${!isCorrect ? `<p>Correct Answer: <span class="text-green-600">${a.options[a.correctAnswer]}</span></p>` : ""}
        </div>

        <div class="flex justify-between">
          <button id="prev-review" class="bg-gray-600 text-white px-4 py-2 rounded-lg ${reviewIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}">Prev</button>
          <button id="next-review" class="bg-blue-600 text-white px-4 py-2 rounded-lg ${reviewIndex === record.answers.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}">Next</button>
        </div>
        
        <button id="back-to-results" class="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg">Back to Results</button>
      </div>
    `;

    // Prev button
    document.getElementById("prev-review").addEventListener("click", () => {
      if (reviewIndex > 0) {
        reviewIndex--;
        renderReviewCard();
      }
    });

    // Next button
    document.getElementById("next-review").addEventListener("click", () => {
      if (reviewIndex < record.answers.length - 1) {
        reviewIndex++;
        renderReviewCard();
      }
    });

    // Back button
    document.getElementById("back-to-results").addEventListener("click", () => {
      finishQuiz(); 
    });
  }

  renderReviewCard(); // show first card
}

