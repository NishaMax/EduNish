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

    // ===============================================
    // =========== Chatbot Logic =====================
    // ===============================================

    // 1. Select DOM elements first
    const chatbox = document.getElementById('chatbox');
    const userInput = document.getElementById('userInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');

    if (!chatbox || !userInput || !sendMessageBtn) {
        console.warn("Chatbot elements not found on this page. Chatbot will not initialize.");
    } else {
        // 2. Define the UI helper function
        function addMessage(message, sender) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message', `${sender}-message`);

            const p = document.createElement('p');
            p.textContent = message;
            messageElement.appendChild(p);

            chatbox.appendChild(messageElement);
            chatbox.scrollTop = chatbox.scrollHeight;
        }

        // 3. Define the send logic
        async function sendMessage() {
            const message = userInput.value.trim();
            if (message === '') return;

            // Add user message to UI
            addMessage(message, 'user');

            // Clear input and disable controls
            userInput.value = '';
            userInput.disabled = true;
            sendMessageBtn.disabled = true;

            try {
                // Initialize Firebase Function
                if (typeof firebase === 'undefined') {
                    throw new Error("Firebase SDK not loaded");
                }

                const functions = firebase.functions();
                // Use the 'asia-south1' region if that's where you deploy, or default (us-central1)
                // const askGemini = functions.region('asia-south1').httpsCallable('askGemini');
                const askGemini = functions.httpsCallable('askGemini');

                const result = await askGemini({ message: message });

                if (result && result.data && result.data.response) {
                    addMessage(result.data.response, 'ai');
                } else {
                    addMessage("I received an empty response. Please try again.", 'ai');
                }
            } catch (error) {
                console.error("Error calling Chatbot API:", error);
                let errorMsg = "Sorry, I'm having trouble connecting to the server.";

                // Enhanced error reporting for debugging
                if (error.code) {
                    errorMsg += ` (Error Code: ${error.code})`;
                }
                if (error.message) {
                    errorMsg += `\nDetails: ${error.message}`;
                }

                if (error.message && error.message.includes("Firebase SDK not loaded")) {
                    errorMsg = "Firebase is not loaded. Please check your internet connection.";
                }
                addMessage(errorMsg, 'ai');
            } finally {
                // Re-enable controls
                userInput.disabled = false;
                sendMessageBtn.disabled = false;
                userInput.focus();
            }
        }

        // 4. Attach Event Listeners (ALWAYS)
        sendMessageBtn.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }
}); // <-- This is the correct final closing brace