// This single event listener waits for the entire page to load
// before running any of the JavaScript inside it.
document.addEventListener("DOMContentLoaded", () => {

    // ===============================================
    // ===== EduNish Theme & Navigation Logic ========
    // ===============================================

    const menuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener("click", () => {
            const isOpen = !mobileMenu.classList.contains('opacity-0');
            const icon = menuBtn.querySelector("i");

            if (isOpen) {
                mobileMenu.classList.add("scale-y-0", "opacity-0", "pointer-events-none");
                icon.setAttribute("data-lucide", "menu");
            } else {
                mobileMenu.classList.remove("scale-y-0", "opacity-0", "pointer-events-none");
                icon.setAttribute("data-lucide", "x");
            }
            if (window.lucide) {
                lucide.createIcons();
            }
        });
    }

    // Function to update UI based on login status
    function updateNav() {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const loginBtnDesktop = document.getElementById("loginBtnDesktop");
        const loginBtnMobile = document.getElementById("loginBtnMobile");
        const profileBtnDesktop = document.getElementById("profileBtnDesktop");
        const profileBtnMobile = document.getElementById("profileBtnMobile");
        const onlinePapersBtnDesktop = document.getElementById("onlinePapersBtnDesktop");
        const onlinePapersBtnMobile = document.getElementById("onlinePapersBtnMobile");

        if (isLoggedIn) {
            if (profileBtnDesktop) profileBtnDesktop.classList.remove("hidden");
            if (profileBtnMobile) profileBtnMobile.classList.remove("hidden");
            if (onlinePapersBtnDesktop) onlinePapersBtnDesktop.classList.remove("hidden");
            if (onlinePapersBtnMobile) onlinePapersBtnMobile.classList.remove("hidden");
            if (loginBtnDesktop) loginBtnDesktop.classList.add("hidden");
            if (loginBtnMobile) loginBtnMobile.classList.add("hidden");
        } else {
            if (profileBtnDesktop) profileBtnDesktop.classList.add("hidden");
            if (profileBtnMobile) profileBtnMobile.classList.add("hidden");
            if (onlinePapersBtnDesktop) onlinePapersBtnDesktop.classList.add("hidden");
            if (onlinePapersBtnMobile) onlinePapersBtnMobile.classList.add("hidden");
            if (loginBtnDesktop) loginBtnDesktop.classList.remove("hidden");
            if (loginBtnMobile) loginBtnMobile.classList.remove("hidden");
        }
    }

    updateNav();
    window.addEventListener("storage", updateNav);

    if (window.lucide) {
        lucide.createIcons();
    }

});