/* =====================================================
   DARK / LIGHT MODE
===================================================== */
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
    // Load saved theme
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

/* =====================================================
   FLASHCARD SYSTEM
===================================================== */
let flashcards = [];
let flashcardIndex = 0;

function showFlashcard() {
    const cardText = document.getElementById("flashcardContent");

    if (flashcards.length === 0) {
        cardText.innerText = "No flashcards yet.";
        return;
    }

    cardText.innerHTML = `
        <strong>Q:</strong> ${flashcards[flashcardIndex].question}<br><br>
        <strong>A:</strong> ${flashcards[flashcardIndex].answer}
    `;
}

function nextFlashcard() {
    if (flashcards.length === 0) return;
    flashcardIndex = (flashcardIndex + 1) % flashcards.length;
    showFlashcard();
}

function prevFlashcard() {
    if (flashcards.length === 0) return;
    flashcardIndex =
        flashcardIndex === 0 ? flashcards.length - 1 : flashcardsIndex - 1;
    showFlashcard();
}

/* =====================================================
   AI API CALL SYSTEM (OpenAI + Claude)
   THROUGH A SECURE PROXY SERVER
===================================================== */

const PROXY_URL = "https://YOUR-PROXY-URL-HERE/api";  
// Example after deployment: https://ai-study-guide-proxy.vercel.app/api

async function callAI(apiProvider, prompt) {
    const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            provider: apiProvider,
            prompt: prompt
        })
    });

    if (!response.ok) {
        throw new Error("Proxy server error.");
    }

    const data = await response.json();
    return data.result;
}

/* =====================================================
   GENERATE SUMMARY
===================================================== */
async function generateSummary() {
    const input = document.getElementById("lessonInput").value.trim();
    const loading = document.getElementById("loading");
    const summaryText = document.getElementById("summaryText");
    const summarySection = document.getElementById("summarySection");

    if (!input) {
        alert("Please enter some text.");
        return;
    }

    loading.classList.remove("hidden");

    const apiProvider = document.getElementById("apiSelector").value;

    const prompt = `
    Summarize the following content into simple, clear, short points:

    ${input}
    `;

    try {
        const aiResponse = await callAI(apiProvider, prompt);

        summaryText.innerText = aiResponse;
        summarySection.classList.remove("hidden");
    } catch (error) {
        summaryText.innerText =
            "AI server not connected. Showing dummy example summary:\n\n- This lesson explains key ideas.\n- It is simplified for learning.\n- Easy points for revision.";
        summarySection.classList.remove("hidden");
    }

    loading.classList.add("hidden");
}

/* =====================================================
   GENERATE FLASHCARDS
===================================================== */
async function generateFlashcards() {
    const input = document.getElementById("lessonInput").value.trim();
    const loading = document.getElementById("loading");
    const flashcardSection = document.getElementById("flashcardSection");

    if (!input) {
        alert("Please enter some text.");
        return;
    }

    loading.classList.remove("hidden");

    const apiProvider = document.getElementById("apiSelector").value;

    const prompt = `
    Create 5 flashcards from the following lesson.
    Format output EXACTLY like this:

    Q: ...
    A: ...
    Q: ...
    A: ...
    
    Lesson:
    ${input}
    `;

    try {
        const aiResponse = await callAI(apiProvider, prompt);

        flashcards = [];

        const lines = aiResponse.split("\n").map(l => l.trim());
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith("Q:")) {
                const question = lines[i].replace("Q: ", "");
                const answer = lines[i + 1]?.replace("A: ", "") || "";
                flashcards.push({ question, answer });
            }
        }

        flashcardIndex = 0;
        flashcardSection.classList.remove("hidden");
        showFlashcard();

    } catch (error) {
        flashcards = [
            { question: "What is AI?", answer: "A computer system that learns." },
            { question: "What is a summary?", answer: "Short version of content." },
            { question: "What is a flashcard?", answer: "Quick Q&A revision tool." }
        ];
        flashcardIndex = 0;
        flashcardSection.classList.remove("hidden");
        showFlashcard();
    }

    loading.classList.add("hidden");
}
