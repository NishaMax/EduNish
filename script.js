// =================== Firebase Imports ===================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// =================== Firebase Config ===================
const firebaseConfig = {
  apiKey: "AIzaSyCeqwvVFwmOxIoSWI9qk64t9lnjwxYtrOs",
  authDomain: "edunish-211d0.firebaseapp.com",
  projectId: "edunish-211d0",
  storageBucket: "edunish-211d0.appspot.com",
  messagingSenderId: "1002400429038",
  appId: "1:1002400429038:web:12ee9a586de10e518694ff",
  measurementId: "G-7ZSDMMKFQ0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM =====
  const profileBtnDesktop = document.getElementById("profileBtnDesktop");
  const profileBtnMobile = document.getElementById("profileBtnMobile");
  const loginBtnDesktop = document.querySelector('a[href="landing.html"]');
  const loginBtnMobile = document.querySelector('#mobile-menu a[href="landing.html"]');
  
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
      const icon = menuBtn.querySelector("i");
      if (mobileMenu.classList.contains("hidden")) {
        icon.setAttribute("data-lucide", "menu");
      } else {
        icon.setAttribute("data-lucide", "x");
      }
      lucide.createIcons();
    });
  
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        const icon = menuBtn.querySelector("i");
        icon.setAttribute("data-lucide", "menu");
        lucide.createIcons();
      });
    });
  
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

  // ===== Update UI based on login status =====
  function updateNav() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      if (loginBtnDesktop) loginBtnDesktop.classList.add("hidden");
      if (loginBtnMobile) loginBtnMobile.classList.add("hidden");
      if (profileBtnDesktop) profileBtnDesktop.classList.remove("hidden");
      if (profileBtnMobile) profileBtnMobile.classList.remove("hidden");
    } else {
      if (loginBtnDesktop) loginBtnDesktop.classList.remove("hidden");
      if (loginBtnMobile) loginBtnMobile.classList.remove("hidden");
      if (profileBtnDesktop) profileBtnDesktop.classList.add("hidden");
      if (profileBtnMobile) profileBtnMobile.classList.add("hidden");
    }
  }

  updateNav();
  window.addEventListener("storage", updateNav);
});