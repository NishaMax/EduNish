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
    storageBucket: "edunish-211d0.appspot.com",   // ✅ Correct now
    messagingSenderId: "1002400429038",
    appId: "1:1002400429038:web:12ee9a586de10e518694ff",
    measurementId: "G-7ZSDMMKFQ0"
  };




const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM =====
  const loginBtnDesktop = document.getElementById("loginBtnDesktop");
  const logoutBtnDesktop = document.getElementById("logoutBtnDesktop");
  const loginBtnMobile = document.getElementById("loginBtnMobile");
  const logoutBtnMobile = document.getElementById("logoutBtnMobile");
  const profileBtnDesktop = document.getElementById("profileBtnDesktop");
  const profileBtnMobile = document.getElementById("profileBtnMobile");
  const authModal = document.getElementById("authModal");
  const authTitle = document.getElementById("authTitle");
  const authForm = document.getElementById("authForm");
  const authMessage = document.getElementById("authMessage");
  const toggleAuthMode = document.getElementById("toggleAuthMode");
  const quickRegForm = document.getElementById("quickRegForm");

  let isLogin = true;

  // ===== Highlight Active Nav Link =====
  const currentPath = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });

  // ===== Mobile Menu Toggle + Auto-Close + Click Outside =====
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");

      if (!mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.remove("scale-y-0", "opacity-0");
        mobileMenu.classList.add("scale-y-100", "opacity-100");
      } else {
        mobileMenu.classList.add("scale-y-0", "opacity-0");
        mobileMenu.classList.remove("scale-y-100", "opacity-100");
      }

      const icon = menuBtn.querySelector("i");
      if (mobileMenu.classList.contains("hidden")) {
        icon.setAttribute("data-lucide", "menu");
      } else {
        icon.setAttribute("data-lucide", "x");
      }
      lucide.createIcons();
    });

    // Auto-close when clicking a link inside mobile menu
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        const icon = menuBtn.querySelector("i");
        icon.setAttribute("data-lucide", "menu");
        lucide.createIcons();
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!mobileMenu.classList.contains("hidden")) {
        const isClickInsideMenu = mobileMenu.contains(e.target);
        const isClickOnButton = menuBtn.contains(e.target);
        if (!isClickInsideMenu && !isClickOnButton) {
          mobileMenu.classList.add("hidden");
          const icon = menuBtn.querySelector("i");
          icon.setAttribute("data-lucide", "menu");
          lucide.createIcons();
        }
      }
    });
  }

  // ===== Helpers for student storage =====
  function saveByEmail(record) {
    const key = (record.email || "").toLowerCase();
    if (!key) return false;

    const map = JSON.parse(localStorage.getItem("edunishStudentsByEmail") || "{}");
    map[key] = record;
    localStorage.setItem("edunishStudentsByEmail", JSON.stringify(map));
    localStorage.setItem("edunishStudentData", JSON.stringify(record)); // set as active
    return true;
  }

  function getByEmail(email) {
    if (!email) return null;
    const map = JSON.parse(localStorage.getItem("edunishStudentsByEmail") || "{}");
    return map[email.toLowerCase()] || null;
  }

  function hasStudentForEmail(email) {
    const r = getByEmail(email);
    return !!(r && r.studentId);
  }

  // ===== Toast =====
  function toast(message, type = "info") {
    const colors = { success: "bg-green-600", error: "bg-red-600", warning: "bg-yellow-600", info: "bg-blue-600" };
    const div = document.createElement("div");
    div.className = `fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow z-50`;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3500);
  }

  // ===== Login Modal =====
  if (loginBtnDesktop) {
    loginBtnDesktop.addEventListener("click", () => {
      if (authModal) {
        authModal.classList.remove("hidden");
        isLogin = true;
        authTitle.textContent = "Login";
        authMessage.textContent = "";
      }
    });
  }
  // Add this for mobile login button
if (loginBtnMobile) {
  loginBtnMobile.addEventListener("click", () => {
    if (authModal) {
      authModal.classList.remove("hidden");
      isLogin = true;
      authTitle.textContent = "Login";
      authMessage.textContent = "";
    }
  });
}

  if (toggleAuthMode) {
    toggleAuthMode.addEventListener("click", () => {
      isLogin = !isLogin;
      authTitle.textContent = isLogin ? "Login" : "Sign Up";
      toggleAuthMode.textContent = isLogin ? "Don't have an account? Sign up" : "Already have an account? Login";
      authMessage.textContent = "";
    });
  }

  // ===== Auth Form =====
  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("authEmail").value.trim();
      const password = document.getElementById("authPassword").value;

      try {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
          authMessage.textContent = "✅ Logged in successfully!";
          authMessage.classList.remove("text-red-600");
          authMessage.classList.add("text-green-600");
          toast("Welcome back!", "success");
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
          authMessage.textContent = "✅ Account created!";
          authMessage.classList.remove("text-red-600");
          authMessage.classList.add("text-green-600");
          toast("Account created successfully!", "success");
        }
        setTimeout(() => authModal.classList.add("hidden"), 800);
      } catch (err) {
        let message = "";
        if (err.code === "auth/user-not-found") {
          message = "⚠️ No account found. Please sign up first before logging in.";
        } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
          message = "❌ Incorrect email or password. Please try again OR if you are first time login use sign up option";
        } else if (err.code === "auth/email-already-in-use") {
          message = "⚠️ This email is already registered. Please login instead.";
        } else {
          message = "⚠️ " + err.message;
        }
        authMessage.textContent = message;
        authMessage.classList.remove("text-green-600");
        authMessage.classList.add("text-red-600");
        toast(message, "error");
      }
    });
  }

  // ===== Logout =====
  if (logoutBtnDesktop) {
    logoutBtnDesktop.addEventListener("click", async () => {
      await signOut(auth);
      toast("Logged out", "info");
    });
  }
  if (logoutBtnMobile) {
  logoutBtnMobile.addEventListener("click", async () => {
    await signOut(auth);
    toast("Logged out", "info");
  });
}

  // ===== Auth state → keep active record in sync =====
 onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtnDesktop?.classList.add("hidden");
    logoutBtnDesktop?.classList.remove("hidden");

    loginBtnMobile?.classList.add("hidden");
    logoutBtnMobile?.classList.remove("hidden");

    const rec = getByEmail(user.email);

    if (rec && rec.studentId) {
      localStorage.setItem("edunishStudentData", JSON.stringify(rec));
      // ✅ Show profile buttons
      profileBtnDesktop?.classList.remove("hidden");
      profileBtnMobile?.classList.remove("hidden");
    } else {
      localStorage.removeItem("edunishStudentData");
      // ❌ Hide profile buttons if no ID
      profileBtnDesktop?.classList.add("hidden");
      profileBtnMobile?.classList.add("hidden");
    }
  } else {
    loginBtnDesktop?.classList.remove("hidden");
    logoutBtnDesktop?.classList.add("hidden");

    loginBtnMobile?.classList.remove("hidden");
    logoutBtnMobile?.classList.add("hidden");

    localStorage.removeItem("edunishStudentData");
    profileBtnDesktop?.classList.add("hidden");
    profileBtnMobile?.classList.add("hidden");
  }
});


  // ===== Quick registration on Home (optional shortcut) =====
  if (quickRegForm) {
    quickRegForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullName = document.getElementById("fullName").value.trim();
      const grade = document.getElementById("grade").value;
      const email = (document.getElementById("email").value || "").trim().toLowerCase();
      if (!fullName || !grade) return toast("Please fill all fields", "warning");

      // Generate ID
      const ts = Date.now().toString().slice(-6);
      const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
      const studentId = `EDU${ts}${rnd}`;

      const record = {
        studentId,
        fullName,
        grade,
        email,
        createdAt: new Date().toISOString(),
        medium: "english",
      };

      // Save by email (if email provided)
      if (email) saveByEmail(record);
      else localStorage.setItem("edunishStudentData", JSON.stringify(record));

      toast(`🎉 Student ID created: ${studentId}`, "success");
      quickRegForm.reset();
    });
  }

  // ===== Open Quiz flow =====
  window.openQuiz = function () {
  const user = auth.currentUser;
  if (!user) {
    authModal?.classList.remove("hidden");
    return;
  }

  const email = (user.email || "").toLowerCase();
  let rec = getByEmail(email); // looks in edunishStudentsByEmail

  // Fallback: if we have a single active record that matches this email, index it.
  if (!rec) {
    const active = JSON.parse(localStorage.getItem("edunishStudentData") || "null");
    if (active && active.email && active.email.toLowerCase() === email) {
      const map = JSON.parse(localStorage.getItem("edunishStudentsByEmail") || "{}");
      map[email] = active;
      localStorage.setItem("edunishStudentsByEmail", JSON.stringify(map));
      rec = active;
    }
  }

  if (!rec || !rec.studentId) {
    // No StudentID for this email → go to registration
    window.location.href = `registration.html?email=${encodeURIComponent(email)}`;
    return;
  }

  // Have StudentID → set as active and go to quiz
  localStorage.setItem("edunishStudentData", JSON.stringify(rec));
  window.location.href = "quiz.html";
};

});


