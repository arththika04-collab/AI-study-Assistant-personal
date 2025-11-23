/* =====================================================================
   DARK / LIGHT MODE
===================================================================== */
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        themeToggle.checked = true;
    }

    themeToggle.addEventListener("change", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem(
            "theme",
            document.body.classList.contains("dark") ? "dark" : "light"
        );
    });
}

/* =====================================================================
   GEMINI API SETUP — PUT YOUR API KEY HERE
===================================================================== */
const GEMINI_API_KEY = "AIzaSyCP4RNj6QvaeMaDFpKzWAqNCcQg44Ptrw8";
const GEMINI_MODEL = "gemini-2.5-flash";

/* =====================================================================
   UNIVERSAL GEMINI API CALL FUNCTION
===================================================================== */
async function callGemini(prompt) {
    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/` +
        `${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
        contents: [
            {
                parts: [{ text: prompt }]
            }
        ]
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    try {
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        throw new Error("Invalid response from Gemini");
    }
}

/* =====================================================================
   LOADING + ERROR HANDLERS
===================================================================== */
function showLoading() {
    document.getElementById("loading").classList.remove("hidden");
}
function hideLoading() {
    document.getElementById("loading").classList.add("hidden");
}

function showError(msg) {
    const errorBox = document.getElementById("errorMessage");
    errorBox.innerText = msg;
    errorBox.classList.remove("hidden");
    setTimeout(() => errorBox.classList.add("hidden"), 4000);
}

/* =====================================================================
   AI TYPING EFFECT
===================================================================== */
function typeWriterEffect(element, text) {
    element.innerHTML = "";
    let i = 0;

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 8);
        }
    }
    type();
}

/* =====================================================================
   SUMMARY GENERATION + AUTO-SAVE
===================================================================== */
async function generateSummary() {
    const input = document.getElementById("lessonInput").value.trim();
    const summaryText = document.getElementById("summaryText");
    const summarySection = document.getElementById("summarySection");

    if (!input) {
        showError("Please enter some lesson text first!");
        return;
    }

    showLoading();

    const prompt = `
You are an expert study tutor. Convert the following lesson into a
CLEAR, SIMPLE, EASY summary with bullet points. Avoid unnecessary words.
Be concise but helpful.

Lesson:
${input}
`;

    try {
        const aiResponse = await callGemini(prompt);

        summarySection.classList.remove("hidden");
        typeWriterEffect(summaryText, aiResponse);
        // Do NOT auto-save here; only save on button click
    } catch (error) {
        showError("AI error. Please check your internet or API key.");
    }
    hideLoading();
}

/* =====================================================================
   LOCAL STORAGE — SAVE SUMMARIES
===================================================================== */
function saveToLocal(summary) {
    let saved = JSON.parse(localStorage.getItem("summaries") || "[]");
    saved.push(summary);

    localStorage.setItem("summaries", JSON.stringify(saved));
    loadSavedSummaries();
}

function loadSavedSummaries() {
    const container = document.getElementById("savedSummaries");
    const list = document.getElementById("savedList");
    list.innerHTML = "";

    let saved = JSON.parse(localStorage.getItem("summaries") || "[]");

    if (saved.length === 0) {
        container.classList.add("hidden");
        return;
    }

    container.classList.remove("hidden");

    saved.forEach((s, i) => {
        const li = document.createElement("li");
        li.innerText = `Summary ${i + 1}: ${s.substring(0, 80)}...`;
        list.appendChild(li);
    });
}

// Clear saved summaries on page load/refresh so they do not persist after a reload
// (per user request: after refresh the page, all saved summaries should be deleted)
localStorage.removeItem("summaries");

loadSavedSummaries();

// Save summary when button is clicked (top-level)
function saveSummary() {
    const summaryTextEl = document.getElementById("summaryText");
    if (!summaryTextEl) {
        showError("No summary to save!");
        return;
    }
    const summaryText = summaryTextEl.innerText.trim();
    if (!summaryText) {
        showError("No summary to save!");
        return;
    }
    saveToLocal(summaryText);
    showError("Summary saved!");
}

/* =====================================================================
   FLASHCARD SYSTEM WITH FLIP ANIMATION
===================================================================== */
let flashcards = [];
let flashcardIndex = 0;

function flipFlashcard() {
    document.getElementById("flipCard").classList.toggle("flip");
}

function renderFlashcard() {
    if (!flashcards.length) return;

    const front = document.getElementById("flashcardFront");
    const back = document.getElementById("flashcardBack");

    front.innerHTML = `<strong>Q:</strong> ${flashcards[flashcardIndex].question}`;
    back.innerHTML = `<strong>A:</strong> ${flashcards[flashcardIndex].answer}`;
}

function nextFlashcard() {
    if (!flashcards.length) return;
    flashcardIndex = (flashcardIndex + 1) % flashcards.length;
    renderFlashcard();
}
function prevFlashcard() {
    if (!flashcards.length) return;
    flashcardIndex =
        flashcardIndex === 0 ? flashcards.length - 1 : flashcardIndex - 1;
    renderFlashcard();
}

/* =====================================================================
   GENERATE FLASHCARDS (WITH CLEAN PROMPT TUNING)
===================================================================== */
async function generateFlashcards() {
    const input = document.getElementById("lessonInput").value.trim();
    const flashcardSection = document.getElementById("flashcardSection");

    if (!input) {
        showError("Enter your lesson text first!");
        return;
    }

    showLoading();

    const prompt = `
Create exactly 5 STUDY FLASHCARDS from this lesson.
Each flashcard must follow this EXACT format:

Q: (question)
A: (answer)

Keep questions short and answers simple.

Lesson:
${input}
`;

    try {
        const aiResponse = await callGemini(prompt);

        flashcards = [];
        flashcardIndex = 0;

        const lines = aiResponse.split("\n").map(l => l.trim());

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("Q:")) {
                let question = lines[i].replace("Q: ", "");
                let answer = lines[i + 1]?.replace("A: ", "") || "No answer.";

                flashcards.push({ question, answer });
            }
        }

        flashcardSection.classList.remove("hidden");
        renderFlashcard();

    } catch (error) {
        showError("AI error while generating flashcards.");
    }

    hideLoading();
}

/* ==========================================================
   CHATGPT-STYLE CHAT MODE
========================================================== */
async function sendChat() {
    const input = document.getElementById("chatInput");
    const msg = input.value.trim();
    if (!msg) return;

    const box = document.getElementById("chatBox");

    function appendMessage(text, sender) {
        const wrapper = document.createElement("div");
        wrapper.className = `chat-msg ${sender}-msg`;

        const content = document.createElement("div");
        content.className = "msg-content";
        content.textContent = text;

        const time = document.createElement("div");
        time.className = "msg-time";
        time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        wrapper.appendChild(content);
        wrapper.appendChild(time);
        box.appendChild(wrapper);
        box.scrollTop = box.scrollHeight;
    }

    // append user message
    appendMessage(msg, 'user');
    input.value = "";
    showLoading();

    const prompt = `
You are an AI study tutor. Provide short, friendly, accurate answers.
User: ${msg}
`;

    try {
        const aiResponse = await callGemini(prompt);
        appendMessage(aiResponse, 'bot');
    } catch (e) {
        showError("Chat error occurred.");
    }

    hideLoading();
}

/* ----------------------------------------------------
   AI CHAT TUTOR – Interactive Chat
----------------------------------------------------- */

const chatBoxEl = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");

function addMessage(text, sender) {
    if (!chatBoxEl) return;
    const wrapper = document.createElement("div");
    wrapper.className = sender === "user" ? "chat-msg user-msg" : "chat-msg bot-msg";

    const content = document.createElement("div");
    content.className = "msg-content";
    content.textContent = text;

    const time = document.createElement("div");
    time.className = "msg-time";
    time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    wrapper.appendChild(content);
    wrapper.appendChild(time);
    chatBoxEl.appendChild(wrapper);
    chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
}

// Typing animation
async function typeAnimation(element, text) {
    element.innerHTML = "";
    let i = 0;

    return new Promise(resolve => {
        const typing = setInterval(() => {
            element.innerHTML += text.charAt(i);
            i++;
            if (chatBoxEl) chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
            if (i >= text.length) {
                clearInterval(typing);
                resolve();
            }
        }, 20);
    });
}

// Send message handler (optional alternative UI)
if (chatSend) {
    chatSend.addEventListener("click", async () => {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        addMessage(userMessage, "user");
        chatInput.value = "";

        // Bot loading indicator
    const temp = document.createElement("div");
    temp.className = "chat-msg bot-msg typing";
        temp.innerHTML = "Thinking<span class='dots'>...</span>";
        if (chatBoxEl) chatBoxEl.appendChild(temp);

        const reply = await callGemini(userMessage);

        if (temp && temp.remove) temp.remove();

        addMessage(reply, "bot");
    });
}

