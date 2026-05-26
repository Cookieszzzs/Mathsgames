let selectedLevel = null; // Sparar vilken nivå spelaren klickat på
let currentLevel = 1;     // Den aktiva nivån i spelet
let score = 0;
let currentAnswer = 0;

const answerInput = document.getElementById('answer-input');
const questionElement = document.getElementById('question');
const scoreElement = document.getElementById('score');
const feedbackElement = document.getElementById('feedback');
const levelIndicator = document.getElementById('level-indicator');
const startGameBtn = document.getElementById('start-game-btn');

function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// 1. Kallas när spelaren klickar på en nivåknapp
function selectLevel(levelNumber) {
    selectedLevel = levelNumber;

    // Nollställ grafik på alla nivåknappar
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Markera den valda knappen som aktiv
    document.getElementById(`lvl-btn-${levelNumber}`).classList.add('selected');

    // Lås upp "Börja spela"-knappen
    startGameBtn.disabled = false;
}

// 2. Kallas när spelaren klickar på "Börja Spela"-knappen
function startGame() {
    if (selectedLevel === null) return; // Säkerhetsspärr

    currentLevel = selectedLevel;
    score = 0;
    scoreElement.textContent = score;
    levelIndicator.textContent = `Nivå ${currentLevel}`;
    
    goToScreen('game-screen');
    generateQuestion();
}

function generateQuestion() {
    let num1, num2;
    feedbackElement.textContent = "";
    answerInput.value = "";
    answerInput.focus();

    if (currentLevel === 1) {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        currentAnswer = num1 + num2;
        questionElement.textContent = `${num1} + ${num2}`;
    } else if (currentLevel === 2) {
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * 10) + 1;
        currentAnswer = num1 - num2;
        questionElement.textContent = `${num1} - ${num2}`;
    } else if (currentLevel === 3) {
        num1 = Math.floor(Math.random() * 8) + 2;
        num2 = Math.floor(Math.random() * 8) + 2;
        currentAnswer = num1 * num2;
        questionElement.textContent = `${num1} × ${num2}`;
    }
}

function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    if (isNaN(userAnswer)) return;

    if (userAnswer === currentAnswer) {
        score++;
        scoreElement.textContent = score;
        feedbackElement.textContent = "Snyggt! Rätt svar. ✨";
        feedbackElement.className = "feedback correct";
        
        if (score >= 5) {
            setTimeout(() => {
                alert(`Grymt jobbat! Du klarade Nivå ${currentLevel}! 🎉`);
                resetAndGoBack();
            }, 500);
        } else {
            setTimeout(generateQuestion, 1000);
        }
    } else {
        feedbackElement.textContent = "Försök igen! ❌";
        feedbackElement.className = "feedback wrong";
        answerInput.value = "";
        answerInput.focus();
    }
}

// Återställer valen när man går tillbaka till menyerna
function resetAndGoBack() {
    selectedLevel = null;
    startGameBtn.disabled = true;
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    goToScreen('level-screen');
}

document.getElementById('submit-btn').addEventListener('click', checkAnswer);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});
