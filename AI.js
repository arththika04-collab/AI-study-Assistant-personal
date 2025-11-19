/* ===============================
   DARK MODE TOGGLE
================================*/
const toggleBtn = document.getElementById("themeToggle");

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    if (document.body.classList.contains("light-theme")) {
      toggleBtn.textContent = "☀️";
    } else {
      toggleBtn.textContent = "🌙";
    }
  });
}

/* Light Theme Variables Override */
document.body.classList.add("dark-theme");

/* ===============================
   FAQ PAGE LOGIC
================================*/
const faqBoxes = document.querySelectorAll(".faq-box");

faqBoxes.forEach(box => {
  box.addEventListener("click", () => {
    const answer = box.querySelector(".faq-answer");

    if (answer.style.display === "block") {
      answer.style.display = "none";
    } else {
      answer.style.display = "block";
    }
  });
});

/* ===============================
   FLASHCARD VIEWER LOGIC
================================*/

// Example flashcards (you can replace with real AI output)
let flashcards = [
  { question: "What is AI?", answer: "AI is Artificial Intelligence." },
  { question: "What is a summary?", answer: "A short version of a long text." },
  { question: "What is a flashcard?", answer: "A memory tool with Q&A." }
];

let currentIndex = 0;
let showingAnswer = false;

const cardBox = document.querySelector(".flashcard-box");
const cardContent = document.getElementById("flashcardContent");
const nextBtn = document.getElementById("nextCard");
const prevBtn = document.getElementById("prevCard");
const flipBtn = document.getElementById("flipCard");

// Load first card
function loadCard() {
  if (!cardContent) return;
  showingAnswer = false;
  cardContent.textContent = flashcards[currentIndex].question;
}

if (cardContent) loadCard();

// Next card
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % flashcards.length;
    loadCard();
  });
}

// Previous card
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    loadCard();
  });
}

// Flip card
if (flipBtn) {
  flipBtn.addEventListener("click", () => {
    if (!showingAnswer) {
      cardContent.textContent = flashcards[currentIndex].answer;
      showingAnswer = true;
    } else {
      cardContent.textContent = flashcards[currentIndex].question;
      showingAnswer = false;
    }
  });
}

/* ===============================
   AI INPUT PAGE – PROCESS BUTTON
================================*/
const processBtn = document.getElementById("processAI");
const aiText = document.getElementById("aiText");
const outputBox = document.getElementById("aiOutput");

if (processBtn) {
  processBtn.addEventListener("click", () => {
    let text = aiText.value.trim();

    if (text === "") {
      outputBox.innerHTML = "<p style='color:#4cc9f0;'>Please enter some text!</p>";
      return;
    }

    outputBox.innerHTML = `
      <p><strong>✔ AI Summary (Demo):</strong><br>
      This is an example summary. Real AI output can be connected later.</p>
      
      <p><strong>✔ Flashcards (Demo):</strong><br>
      - Point 1 from your text<br>
      - Point 2 from your text<br>
      - Point 3 from your text
      </p>
    `;
  });
}

/* ===============================
   NAV ACTIVE LINK HIGHLIGHT
================================*/
const navLinks = document.querySelectorAll(".navbar nav a");
const currentPage = location.pathname.split("/").pop();

navLinks.forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.style.color = "#4cc9f0";
    link.style.textShadow = "0 0 10px #4cc9f0";
  }
});
