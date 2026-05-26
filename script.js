let selectedLevel = null;
let currentLevel = 1;
let score = 0;
let lives = 3;
const targetScore = 5; 
let currentAnswer = 0;
let completedLevels = [];

// VÅR COLLISION-SPÄRR
let isTransitioning = false;

const answerInput = document.getElementById('answer-input');
const questionElement = document.getElementById('question');
const feedbackElement = document.getElementById('feedback');
const levelIndicator = document.getElementById('level-indicator');
const livesIndicator = document.getElementById('lives-indicator');
const startGameBtn = document.getElementById('start-game-btn');
const submitBtn = document.getElementById('submit-btn');
const progressBar = document.getElementById('progress-bar');
const gameCard = document.getElementById('game-card');

function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function selectLevel(levelNumber) {
    selectedLevel = levelNumber;
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById(`lvl-btn-${levelNumber}`).classList.add('selected');
    
    if (completedLevels.includes(levelNumber)) {
        startGameBtn.textContent = "Gör om utmaningen";
    } else {
        startGameBtn.textContent = "Börja Utmaningen";
    }
    
    startGameBtn.disabled = false;
}

function startGame() {
    if (selectedLevel === null) return;
    currentLevel = selectedLevel;
    score = 0;
    lives = 3;
    isTransitioning = false; 
    updateProgressBar();
    updateLivesUI();
    levelIndicator.textContent = `Nivå ${currentLevel}`;
    goToScreen('game-screen');
    generateQuestion();
}

function retryCurrentLevel() {
    score = 0;
    lives = 3;
    isTransitioning = false; 
    updateProgressBar();
    updateLivesUI();
    goToScreen('game-screen');
    generateQuestion();
}

function updateLivesUI() {
    livesIndicator.textContent = "❤️".repeat(lives);
}

function updateProgressBar() {
    const percentage = (score / targetScore) * 100;
    progressBar.style.width = `${percentage}%`;
}

function generateQuestion() {
    let num1, num2;
    feedbackElement.textContent = "";
    answerInput.value = "";
    
    // VIKTIGT: Aktivera fältet och lås upp spärren HÄR när nästa fråga är helt redo
    answerInput.disabled = false;
    submitBtn.disabled = false;
    isTransitioning = false; 
    
    answerInput.focus();

    switch(currentLevel) {
        case 1: 
            num1 = Math.floor(Math.random() * (10 + score * 6)) + 2; 
            num2 = Math.floor(Math.random() * (10 + score * 6)) + 2;
            currentAnswer = num1 + num2;
            questionElement.textContent = `${num1} + ${num2}`;
            break;
        case 2: 
            num1 = Math.floor(Math.random() * (20 + score * 10)) + 15;
            num2 = Math.floor(Math.random() * (10 + score * 4)) + 2;
            currentAnswer = num1 - num2;
            questionElement.textContent = `${num1} - ${num2}`;
            break;
        case 3: 
            const maxTable = 5 + score; 
            num1 = Math.floor(Math.random() * (maxTable - 2 + 1)) + 2;
            num2 = Math.floor(Math.random() * 8) + 2;
            currentAnswer = num1 * num2;
            questionElement.textContent = `${num1} × ${num2}`;
            break;
        case 4: 
            num2 = Math.floor(Math.random() * 5) + 2 + Math.floor(score/2); 
            currentAnswer = Math.floor(Math.random() * 5) + 2 + Math.floor(score/2);
            num1 = num2 * currentAnswer; 
            questionElement.textContent = `${num1} ÷ ${num2}`;
            break;
        case 5: 
            num1 = Math.floor(Math.random() * 5) + 2 + score; 
            currentAnswer = num1 * num1;
            questionElement.textContent = `${num1}²`;
            break;
        case 6: 
            const modes = ['+', '-', '×'];
            const randomMode = modes[Math.floor(Math.random() * modes.length)];
            num1 = Math.floor(Math.random() * (30 + score * 12)) + 5;
            num2 = Math.floor(Math.random() * (15 + score * 6)) + 2;
            if (randomMode === '+') currentAnswer = num1 + num2;
            if (randomMode === '-') currentAnswer = num1 - num2;
            if (randomMode === '×') { num1 = Math.floor(num1/3) + 2; num2 = Math.floor(num2/2) + 2; currentAnswer = num1 * num2; }
            questionElement.textContent = `${num1} ${randomMode} ${num2}`;
            break;
    }
}

function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    if (isNaN(userAnswer)) {
        isTransitioning = false; // Lås upp om de tryckte Enter utan att skriva något
        return;
    }

    if (userAnswer === currentAnswer) {
        score++;
        updateProgressBar();
        feedbackElement.textContent = "Helt rätt! ⚡";
        feedbackElement.className = "feedback correct";
        
        gameCard.classList.add('success-pop');
        setTimeout(() => gameCard.classList.remove('success-pop'), 400);
        
        if (score >= targetScore) {
            if (!completedLevels.includes(currentLevel)) {
                completedLevels.push(currentLevel);
            }
            updateMenuButtons();
            setTimeout(() => {
                document.getElementById('victory-text').textContent = `Du krossade utmaningen på Nivå ${currentLevel}!`;
                goToScreen('victory-screen');
            }, 500);
        } else {
            // Vänta med att ladda nästa fråga (spärren är aktiv under tiden)
            setTimeout(generateQuestion, 600);
        }
    } else {
        lives--;
        updateLivesUI();
        
        feedbackElement.textContent = `Fel svar!`;
        feedbackElement.className = "feedback wrong";
        
        gameCard.classList.add('shake');
        setTimeout(() => gameCard.classList.remove('shake'), 400);

        if (lives <= 0) {
            setTimeout(() => {
                goToScreen('game-over-screen');
            }, 500);
        } else {
            // Om de svarade fel, lås upp efter 400ms så de kan korrigera sitt svar
            setTimeout(() => {
                answerInput.disabled = false;
                submitBtn.disabled = false;
                isTransitioning = false;
                answerInput.value = "";
                answerInput.focus();
            }, 400);
        }
    }
}

function updateMenuButtons() {
    completedLevels.forEach(levelNum => {
        const btn = document.getElementById(`lvl-btn-${levelNum}`);
        if (btn) btn.classList.add('completed');
    });
}

function resetAndGoBack() {
    selectedLevel = null;
    startGameBtn.disabled = true;
    startGameBtn.textContent = "Börja Utmaningen";
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('selected'));
    updateMenuButtons();
    goToScreen('level-screen');
}

// --- DET HÄR ÄR DEN NYA ULTRA-SÄKRA LYSSNAREN ---

function handleInputSubmit() {
    // Om spärren är aktiv, TVÄRNEKA alla vidare tryck direkt här
    if (isTransitioning) return; 
    
    // Annars, lås dörren OMEDELBART
    isTransitioning = true;
    answerInput.disabled = true;
    submitBtn.disabled = true;
    
    // Kör logiken
    checkAnswer();
}

submitBtn.addEventListener('click', handleInputSubmit);

answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        // Förhindra webbläsarens standardbeteende så att inget skickas dubbelt
        e.preventDefault(); 
        handleInputSubmit();
    }
});
