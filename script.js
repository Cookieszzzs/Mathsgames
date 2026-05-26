let selectedLevel = null;
let currentLevel = 1;
let score = 0;
let lives = 3;
const targetScore = 5; 
let currentAnswer = 0;
let completedLevels = [];

// BUGGFIX-SPÄRR: Motverkar spam av Enter-tangenten
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
        isTransitioning = false; 
        answerInput.disabled = false;
        submitBtn.disabled = false;
        return;
    }

    if (userAnswer === currentAnswer) {
        score++;
        updateProgressBar();
        feedbackElement.textContent = "Helt rätt! ✨";
        feedbackElement.className = "feedback correct";
        
        gameCard.classList.add('success-pop');
        setTimeout(() => gameCard.classList.remove('success-pop'), 400);
        
        if (score >= targetScore) {
            if (!completedLevels.includes(currentLevel)) {
                completedLevels.push(currentLevel);
            }
            updateMenuButtons();
            setTimeout(() => {
                document.getElementById('victory-text').textContent = `Du klarade utmaningen på Nivå ${currentLevel}!`;
                goToScreen('victory-screen');
            }, 500);
        } else {
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

function handleInputSubmit() {
    if (isTransitioning) return; 
    isTransitioning = true;
    answerInput.disabled = true;
    submitBtn.disabled = true;
    checkAnswer();
}

submitBtn.addEventListener('click', handleInputSubmit);
answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleInputSubmit();
    }
});


// =========================================
//  TEMA-SWITCHARE LOGIK (Cyber ⇄ Dungeon)
// =========================================
const themeToggleBtn = document.getElementById('theme-toggle');
let currentTheme = localStorage.getItem('mathgame-theme') || 'cyber';

// Körs direkt vid start för att applicera rätt stil
applyTheme(currentTheme);

themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'cyber' ? 'dungeon' : 'cyber';
    applyTheme(currentTheme);
    localStorage.setItem('mathgame-theme', currentTheme); // Kommer ihåg valet!
});

function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    
    const logoSub = document.getElementById('logo-sub');
    const subtitle = document.getElementById('menu-subtitle');
    const enterBtn = document.getElementById('enter-btn');
    const guideBtn = document.getElementById('guide-btn');
    const helpTitle = document.getElementById('help-title');
    const mapTitle = document.getElementById('map-title');
    const submitBtnEl = document.getElementById('submit-btn');
    const vicTitle = document.getElementById('victory-title');
    const vicIcon = document.getElementById('victory-icon');
    const failTitle = document.getElementById('fail-title');
    const failText = document.getElementById('fail-text');
    const failIcon = document.getElementById('fail-icon');

    if (theme === 'cyber') {
        themeToggleBtn.textContent = '🏰'; 
        if(logoSub) logoSub.textContent = 'CYBER';
        if(subtitle) subtitle.textContent = 'Överlista systemet. Knäck koden. Vinn racet.';
        if(enterBtn) enterBtn.textContent = 'Gå in i systemet';
        if(guideBtn) guideBtn.textContent = 'Regler & Manual';
        if(helpTitle) helpTitle.textContent = 'Spelmanual';
        if(mapTitle) mapTitle.textContent = 'Välj Utmaning';
        if(submitBtnEl) submitBtnEl.textContent = 'Skicka Svar';
        if(vicTitle) vicTitle.textContent = 'Utmaningen avklarad!';
        if(vicIcon) vicIcon.textContent = '🏆';
        if(failTitle) failTitle.textContent = 'Systemfel...';
        if(failText) failText.textContent = 'Dina liv tog slut.';
        if(failIcon) failIcon.textContent = '💥';
    } else {
        themeToggleBtn.textContent = '🚀'; 
        if(logoSub) logoSub.textContent = 'DUNGEONS';
        if(subtitle) subtitle.textContent = 'Överlev grottorna. Knäck koden. Erövra skatten.';
        if(enterBtn) enterBtn.textContent = 'Gå in i grottan';
        if(guideBtn) guideBtn.textContent = 'Äventyrarens guide';
        if(helpTitle) helpTitle.textContent = 'Äventyrarens Guide';
        if(mapTitle) mapTitle.textContent = 'Kartan';
        if(submitBtnEl) submitBtnEl.textContent = 'Kasta Besvärjelse';
        if(vicTitle) vicTitle.textContent = 'Skatten är din!';
        if(vicIcon) vicIcon.textContent = '💎';
        if(failTitle) failTitle.textContent = 'Äventyret slutar här...';
        if(failText) failText.textContent = 'Du föll i mörkret.';
        if(failIcon) failIcon.textContent = '💀';
    }
}
