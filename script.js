// =================== Firebase Imports ===================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// =================== Firebase Config ===================
const firebaseConfig = {
  apiKey: "AIzaSyCeqwvVFwmOxIoSWI9qk64t9lnjwxYtrOs",
  authDomain: "edunish-211d0.firebaseapp.com",
  projectId: "edunish-211d0",
  storageBucket: "edunish-211d0.firebasestorage.app",
  messagingSenderId: "1002400429038",
  appId: "1:1002400429038:web:12ee9a586de10e518694ff",
  measurementId: "G-7ZSDMMKFQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// =================== DOM Elements ===================
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authModal = document.getElementById("authModal");
const authTitle = document.getElementById("authTitle");
const authForm = document.getElementById("authForm");
const authMessage = document.getElementById("authMessage");
const toggleAuthMode = document.getElementById("toggleAuthMode");

// =================== Auth Mode ===================
let isLogin = true;

// =================== Open Login Modal ===================
loginBtn.addEventListener("click", () => {
  authModal.classList.remove("hidden");
  isLogin = true;
  authTitle.textContent = "Login";
  authMessage.textContent = "";
});

// =================== Toggle Login / Signup ===================
toggleAuthMode.addEventListener("click", () => {
  isLogin = !isLogin;
  authTitle.textContent = isLogin ? "Login" : "Sign Up";
  toggleAuthMode.textContent = isLogin ? "Don't have an account? Sign up" : "Already have an account? Login";
  authMessage.textContent = "";
});

// =================== Handle Form Submit ===================
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("authEmail").value;
  const password = document.getElementById("authPassword").value;

  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, password);
      authMessage.textContent = "✅ Logged in successfully!";
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
      authMessage.textContent = "✅ Account created!";
    }
    authMessage.classList.remove("text-red-600");
    authMessage.classList.add("text-green-600");

    // Hide modal after short delay
    setTimeout(() => authModal.classList.add("hidden"), 1000);
  } catch (err) {
    authMessage.textContent = "❌ " + err.message;
    authMessage.classList.remove("text-green-600");
    authMessage.classList.add("text-red-600");
  }
});

// =================== Logout ===================
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// =================== Auth State Listener ===================
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.classList.add("hidden");
    logoutBtn.classList.remove("hidden");

    quizContent.innerHTML = `
      <p class="text-white text-lg mb-6">✅ Welcome, ${user.email}! You can now access quizzes.</p>
      <button class="bg-yellow-400 text-gray-900 px-8 py-3 rounded-full font-bold hover:shadow-xl">Start Quiz</button>
    `;
  } else {
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");

    quizContent.innerHTML = `
      <p class="text-white text-lg">❌ You must be logged in to access quizzes.</p>
    `;
  }
});
// =================== Quiz Access ===================
function openQuiz() {
  const studentData = JSON.parse(localStorage.getItem("studentData"));
  
  if (studentData && studentData.id) {
    // Student already registered → go to quiz page
    window.location.href = "quiz.html";
  } else {
    // Not registered yet → open registration popup
    window.open(
      "registration.html",
      "registration",
      "width=500,height=700,scrollbars=yes,resizable=yes"
    );
  }
}
// At the bottom of script.js
window.openQuiz = function () {
  const studentData = JSON.parse(localStorage.getItem("studentData"));
  
  if (studentData && studentData.id) {
    window.location.href = "quiz.html";
  } else {
    window.open(
      "registration.html",
      "registration",
      "width=500,height=700,scrollbars=yes,resizable=yes"
    );
  }
};
// =================== Mobile Menu Toggle ===================
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

mobileMenuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

