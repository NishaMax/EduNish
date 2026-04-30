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

async function loadLessonFile(filename, medium) {
    const folder = medium === "English" ? "data/english" : "data/sinhala";
    const res = await fetch(`./${folder}/${filename}`);
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
        const raw = await loadLessonFile(filename, medium);
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
                    `${medium}_${grade}_L${lesson}_${s}`
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

    mediumSelect.parentElement.parentElement.classList.add("hidden");

    clearInterval(timerInterval);
    timeLeft = 20 * 60;
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
}

// ===== Render Question =====
let selectedIndex = null;

function renderQuestion() {
    if (currentIndex >= currentQuestions.length) {
        finishQuiz();
        return;
    }

    const q = currentQuestions[currentIndex];
    quizQuestion.innerHTML = `<p>${q.question.replace(/\n/g, '<br>')}</p>`;

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
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;

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
        answers
    };

    localStorage.setItem(quizKey, JSON.stringify(record));

    quizContainer.classList.add("hidden");
    resultContainer.classList.remove("hidden");

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
        showReview(record);
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

/**
 * Renders the overview of all completed quizzes with a clean, modern design.
 */
function renderProgressOverview() {
    progressList.innerHTML = "";
    const progressData = [];

    // Collect all quiz progress from localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // A simple check to ensure we're only grabbing quiz data
        if (key.includes("English_") || key.includes("Sinhala_")) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && typeof data.percent !== 'undefined') {
                    progressData.push({ key, ...data });
                }
            } catch (e) {
                console.error(`Could not parse localStorage item: ${key}`, e);
            }
        }
    }

    // Sort by completion date, most recent first
    progressData.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    if (progressData.length === 0) {
        progressList.innerHTML = `<p class="text-center text-gray-500 col-span-full">Complete a quiz to see your progress here!</p>`;
        return;
    }

    progressData.forEach(data => {
        const card = document.createElement("div");

        // Determine card class for dynamic coloring based on percentage
        let scoreClass = 'score-low'; // Default to low score styles
        if (data.percent >= 75) {
            scoreClass = 'score-high';
        } else if (data.percent >= 50) {
            scoreClass = 'score-medium';
        }

        // Add all necessary classes to the card
        card.className = `quiz-result-card ${scoreClass}`;

        // Format the title and grade from the quiz key
        const keyParts = data.key.split('_');
        const grade = keyParts[1] || 'N/A';
        const title = `${keyParts[0]} L${keyParts[2].replace('L', '')} ${keyParts.slice(3).join(' ')}`.trim() || 'Quiz';

        card.innerHTML = `
      <div class="grade">Grade ${grade}</div>
      <div class="title">${title}</div>
      <div class="score">${data.percent}%</div>
      <div class="stats-summary">
        <span class="correct-total">${data.score} / ${data.total}</span> Correct
      </div>
      <div class="quiz-progress-container">
        <div class="quiz-progress-bar" style="--progress-width: ${data.percent}%;"></div>
      </div>
      <div class="completion-date">
        Completed: ${new Date(data.completedAt).toLocaleDateString()}
      </div>
    `;

        // Add click event to show more details or retry
        card.addEventListener('click', () => {
            // You can add a modal or detailed view here later
            console.log(`Clicked on quiz: ${data.key}`);
            // For now, let's just log it. A modal function could be called here.
        });

        progressList.appendChild(card);
    });
}


function showReview(record) {
    let reviewIndex = 0;

    function renderReviewCard() {
        const a = record.answers[reviewIndex];
        if (!a) return; // Exit if the answer doesn't exist
        
        const isCorrect = a.userAnswer === a.correctAnswer;

        resultContainer.innerHTML = `
      <div class="p-6 bg-white rounded-xl shadow text-gray-800 text-center">
        <h2 class="text-xl font-bold mb-4">Review Answers (${reviewIndex + 1}/${record.answers.length})</h2>
        
        <div class="p-4 border rounded-lg mb-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'} text-gray-800 text-left">
          <p class="font-semibold mb-2">Q${reviewIndex + 1}: ${a.question.replace(/\n/g, '<br>')}</p>
          <p>Your Answer: 
            <span class="font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}">
              ${a.userAnswer !== null ? a.options[a.userAnswer] : "Not answered"}
            </span>
            ${isCorrect ? ' ✔️' : ' ❌'}
          </p>
          ${!isCorrect ? `<p>Correct Answer: <span class="font-semibold text-green-600">${a.options[a.correctAnswer]}</span></p>` : ""}
        </div>

        <div class="flex justify-between">
          <button id="prev-review" class="bg-gray-600 text-white px-4 py-2 rounded-lg ${reviewIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}">Prev</button>
          <button id="next-review" class="bg-blue-600 text-white px-4 py-2 rounded-lg ${reviewIndex === record.answers.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}">Next</button>
        </div>
        
        <button id="back-to-results" class="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg">Back to Results</button>
      </div>
    `;

        // Event Listeners
        const prevBtn = document.getElementById("prev-review");
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                if (reviewIndex > 0) {
                    reviewIndex--;
                    renderReviewCard();
                }
            });
        }

        const nextBtn = document.getElementById("next-review");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                if (reviewIndex < record.answers.length - 1) {
                    reviewIndex++;
                    renderReviewCard();
                }
            });
        }

        const backBtn = document.getElementById("back-to-results");
        if(backBtn) {
           backBtn.addEventListener("click", finishQuiz); // Re-renders the main result card
        }
    }

    renderReviewCard(); // show first card
}

// ===== Initialize on page load =====
document.addEventListener("DOMContentLoaded", () => {
    renderProgressOverview();
});