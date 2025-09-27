document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM Elements for Navigation (using specific IDs for reliability) =====
  const loginBtnDesktop = document.getElementById("loginBtnDesktop");
  const loginBtnMobile = document.getElementById("loginBtnMobile");
  const profileBtnDesktop = document.getElementById("profileBtnDesktop");
  const profileBtnMobile = document.getElementById("profileBtnMobile");
  const onlinePapersBtnDesktop = document.getElementById("onlinePapersBtnDesktop");
  const onlinePapersBtnMobile = document.getElementById("onlinePapersBtnMobile");

  // ===== Update UI based on login status =====
  function updateNav() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      // --- SHOW profile & protected links ---
      if (profileBtnDesktop) profileBtnDesktop.classList.remove("hidden");
      if (profileBtnMobile) profileBtnMobile.classList.remove("hidden");
      if (onlinePapersBtnDesktop) onlinePapersBtnDesktop.classList.remove("hidden");
      if (onlinePapersBtnMobile) onlinePapersBtnMobile.classList.remove("hidden");

      // --- HIDE login/signup links ---
      if (loginBtnDesktop) loginBtnDesktop.classList.add("hidden");
      if (loginBtnMobile) loginBtnMobile.classList.add("hidden");
    } else {
      // --- HIDE profile & protected links ---
      if (profileBtnDesktop) profileBtnDesktop.classList.add("hidden");
      if (profileBtnMobile) profileBtnMobile.classList.add("hidden");
      if (onlinePapersBtnDesktop) onlinePapersBtnDesktop.classList.add("hidden");
      if (onlinePapersBtnMobile) onlinePapersBtnMobile.classList.add("hidden");

      // --- SHOW login/signup links ---
      if (loginBtnDesktop) loginBtnDesktop.classList.remove("hidden");
      if (loginBtnMobile) loginBtnMobile.classList.remove("hidden");
    }
  }

  // ===== Mobile Menu Toggle Logic (CORRECTED) =====
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      // **THE FIX IS HERE:** Toggle all three classes responsible for visibility and animation.
      mobileMenu.classList.toggle("hidden");
      mobileMenu.classList.toggle("scale-y-0");
      mobileMenu.classList.toggle("opacity-0");
      
      const isNowHidden = mobileMenu.classList.contains("hidden");
      const icon = menuBtn.querySelector("i");
      icon.setAttribute("data-lucide", isNowHidden ? "menu" : "x");
      lucide.createIcons();
    });
  }

  // ===== Initial Execution =====
  // Run the function to set the correct nav state as soon as the page loads
  updateNav();

  // Add a listener to update the nav if the login status changes in another browser tab
  window.addEventListener("storage", updateNav);
});