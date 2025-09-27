// EduNish Theme JavaScript

document.addEventListener("DOMContentLoaded", () => {

    // ===== Mobile Menu Toggle Logic for Top Navbar =====
    const menuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
  
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", () => {
            const isOpen = !mobileMenu.classList.contains('opacity-0');
            const icon = menuBtn.querySelector("i");

            if (isOpen) {
                // It's open, so close it
                mobileMenu.classList.add("scale-y-0", "opacity-0", "pointer-events-none");
                icon.setAttribute("data-lucide", "menu");
            } else {
                // It's closed, so open it
                mobileMenu.classList.remove("scale-y-0", "opacity-0", "pointer-events-none");
                icon.setAttribute("data-lucide", "x");
            }
            // Tell Lucide to re-render the new icon
            if(window.lucide) {
                lucide.createIcons();
            }
        });
    }

    // ===== Update UI based on login status =====
    function updateNav() {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const loginBtnDesktop = document.getElementById("loginBtnDesktop");
        const loginBtnMobile = document.getElementById("loginBtnMobile");
        const profileBtnDesktop = document.getElementById("profileBtnDesktop");
        const profileBtnMobile = document.getElementById("profileBtnMobile");
        const onlinePapersBtnDesktop = document.getElementById("onlinePapersBtnDesktop");
        const onlinePapersBtnMobile = document.getElementById("onlinePapersBtnMobile");

        if (isLoggedIn) {
            // SHOW profile & protected links
            if (profileBtnDesktop) profileBtnDesktop.classList.remove("hidden");
            if (profileBtnMobile) profileBtnMobile.classList.remove("hidden");
            if (onlinePapersBtnDesktop) onlinePapersBtnDesktop.classList.remove("hidden");
            if (onlinePapersBtnMobile) onlinePapersBtnMobile.classList.remove("hidden");
            // HIDE login/signup links
            if (loginBtnDesktop) loginBtnDesktop.classList.add("hidden");
            if (loginBtnMobile) loginBtnMobile.classList.add("hidden");
        } else {
            // HIDE profile & protected links
            if (profileBtnDesktop) profileBtnDesktop.classList.add("hidden");
            if (profileBtnMobile) profileBtnMobile.classList.add("hidden");
            if (onlinePapersBtnDesktop) onlinePapersBtnDesktop.classList.add("hidden");
            if (onlinePapersBtnMobile) onlinePapersBtnMobile.classList.add("hidden");
            // SHOW login/signup links
            if (loginBtnDesktop) loginBtnDesktop.classList.remove("hidden");
            if (loginBtnMobile) loginBtnMobile.classList.remove("hidden");
        }
    }

    // Run the function to set the correct nav state as soon as the page loads
    updateNav();

    // Add a listener to update the nav if the login status changes in another browser tab
    window.addEventListener("storage", updateNav);

    // Initial call to render Lucide icons
    if(window.lucide) {
        lucide.createIcons();
    }
});