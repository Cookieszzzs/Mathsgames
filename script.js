let selectedLevel = null;
let currentLevel = 1;
let score = 0;
let lives = 3;
const targetScore = 5; 
let currentAnswer = 0;

// Laddar sparad progress (vilka nivåer som avklarats samt vilket Nivåpack man kör)
let completedLevels = JSON.parse(localStorage.getItem('mathgame-progress')) || [];
let currentPack = parseInt(localStorage.getItem('mathgame-pack')) || 1; // Pack 1 = Normal, Pack 2 = Svår

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
const themeModal = document.getElementById('theme-modal');

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
    // Visar om det är Pack 2 man kör
    levelIndicator.textContent = currentPack === 2 ? `Nivå ${currentLevel} (Pack 2)` : `Nivå ${currentLevel}`;
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

    // Sätter en multiplikator. Om vi kör Pack 2 blir talen 2.5 gånger större!
    const difficultyMultiplier = currentPack === 2 ? 2.5 : 1;

    switch(currentLevel) {
        case 1:
            num1 = Math.floor((Math.random() * (10 + score * 6)) * difficultyMultiplier) + 2; 
            num2 = Math.floor((Math.random() * (10 + score * 6)) * difficultyMultiplier) + 2;
            currentAnswer = num1 + num2;
            questionElement.textContent = `${num1} + ${num2}`;
            break;
        case 2:
            num1 = Math.floor((Math.random() * (20 + score * 10)) * difficultyMultiplier) + 15;
            num2 = Math.floor((Math.random() * (10 + score * 4)) * difficultyMultiplier) + 2;
            // Förhindra negativa svar om det inte är Pack 2 med mening
            if (num1 < num2) { let temp = num1; num1 = num2; num2 = temp; }
            currentAnswer = num1 - num2;
            questionElement.textContent = `${num1} - ${num2}`;
            break;
        case 3:
            const maxTable = Math.floor((5 + score) * (currentPack === 2 ? 1.8 : 1)); 
            num1 = Math.floor(Math.random() * (maxTable - 2 + 1)) + 2;
            num2 = Math.floor(Math.random() * (currentPack === 2 ? 12 : 8)) + 2;
            currentAnswer = num1 * num2;
            questionElement.textContent = `${num1} × ${num2}`;
            break;
        case 4:
            num2 = Math.floor(Math.random() * 5) + 2 + Math.floor(score/2);
            if (currentPack === 2) num2 += 5; // Större nämnare på nivå 2
            currentAnswer = Math.floor(Math.random() * 5) + 2 + Math.floor(score/2);
            if (currentPack === 2) currentAnswer += 6; 
            num1 = num2 * currentAnswer; 
            questionElement.textContent = `${num1} ÷ ${num2}`;
            break;
        case 5:
            num1 = Math.floor(Math.random() * 5) + 2 + score; 
            if (currentPack === 2) num1 += 4; // Högre baser för potenser
            currentAnswer = num1 * num1;
            questionElement.textContent = `${num1}²`;
            break;
        case 6:
            const modes = ['+', '-', '×'];
            const randomMode = modes[Math.floor(Math.random() * modes.length)];
            num1 = Math.floor((Math.random() * (30 + score * 12)) * difficultyMultiplier) + 5;
            num2 = Math.floor((Math.random() * (15 + score * 6)) * difficultyMultiplier) + 2;
            if (randomMode === '+') currentAnswer = num1 + num2;
            if (randomMode === '-') { if (num1 < num2) { let t = num1; num1 = num2; num2 = t; } currentAnswer = num1 - num2; }
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
                localStorage.setItem('mathgame-progress', JSON.stringify(completedLevels));
            }
            updateMenuButtons();
            setTimeout(() => {
                document.getElementById('victory-lives-left').textContent = "❤️".repeat(lives);
                
                let humanText = "";
                // Om vi klarar en nivå i Pack 2 visar vi det ultimata meddelandet vid slutseger
                if (currentPack === 2 && completedLevels.length >= 6) {
                    humanText = "GRATTIS! DU HAR KOMMIT SÅ LÅNGT SOM MAN KAN KOMMA! MEN SE UPP!! Det kommer att komma helt nya nivåer i framtiden...";
                } else {
                    // Standardtexter
                    if (currentTheme === 'cyber') {
                        humanText = lives === 3 ? `Snyggt! Du fullkomligt krossade nivå ${currentLevel} utan att tappa ett enda liv.` : `Grymt kört! Du knäckte koderna och rensade nivå ${currentLevel}.`;
                    } else {
                        humanText = lives === 3 ? `Perfekt runda! Du stormade igenom nivå ${currentLevel} helt oskadd.` : `Riktigt bra kört! Du överlevde fällorna på nivå ${currentLevel}.`;
                    }
                }
                
                document.getElementById('victory-text').textContent = humanText;
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
            setTimeout(() => { goToScreen('game-over-screen'); }, 500);
        } else {
            setTimeout(() => {
                answerInput.disabled = false; submitBtn.disabled = false; isTransitioning = false;
                answerInput.value = ""; answerInput.focus();
            }, 400);
        }
    }
}

function updateMenuButtons() {
    // Rensar färger först så det uppdateras rätt vid pack-byte
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('completed'));
    
    completedLevels.forEach(levelNum => {
        const btn = document.getElementById(`lvl-btn-${levelNum}`);
        if (btn) btn.classList.add('completed');
    });

    checkGrandTrophy();
}

// NY/UPPDATERAD LOGIK: Hanterar pokaler, knappar och texter baserat på Pack 1 eller Pack 2
function checkGrandTrophy() {
    const mapTitle = document.getElementById('map-title');
    const cornerTrophy = document.getElementById('corner-trophy');
    const nextPackBtn = document.getElementById('next-pack-btn');
    if (!mapTitle) return;

    // Om alla 6 nivåer är avklarade i nuvarande pack
    if (completedLevels.length >= 6) {
        // Tänd den lilla pokalen i hörnet!
        if (cornerTrophy) cornerTrophy.classList.remove('hidden');
        
        if (currentPack === 1) {
            // Vi är klara med Pack 1. Visa troférubrik och framhäv "Nivå 2"-knappen mitt på skärmen!
            if (currentTheme === 'cyber') {
                mapTitle.innerHTML = "👑 SYSTEMET ÄR HACKAT! 👑<br><span style='font-size: 1.1rem; color: #00ffcc;'>Master Hacker-status uppnådd.</span>";
                if(nextPackBtn) { nextPackBtn.textContent = "⚡ Vågar du ta det till nästa nivå? (Pack 2) ⚡"; nextPackBtn.classList.remove('hidden'); }
            } else {
                mapTitle.innerHTML = "👑 GROTTAN ÄR ERÖVRAD! 👑<br><span style='font-size: 1.1rem; color: #ffe08a;'>Eviga Kungens Trofé är din!</span>";
                if(nextPackBtn) { nextPackBtn.textContent = "⚔️ Vågar du ta det till nästa nivå? (Pack 2) ⚔️"; nextPackBtn.classList.remove('hidden'); }
            }
        } else {
            // Spelaren har klarat hela Pack 2! Visar det absoluta slutet på kartan
            if (currentTheme === 'cyber') {
                mapTitle.innerHTML = "🌌 SYSTEMETS GUD 🌌<br><span style='font-size: 1rem; color: #00ffcc;'>DU HAR KOMMIT SÅ LÅNGT SOM MAN KAN KOMMA!<br>MEN SE UPP!! Nya koder laddas snart... 🛸</span>";
            } else {
                mapTitle.innerHTML = "🔱 GUDOMLIG HJÄLTE 🔱<br><span style='font-size: 1rem; color: #ffe08a;'>DU HAR KOMMIT SÅ LÅNGT SOM MAN KAN KOMMA!<br>MEN SE UPP!! Nya världar öppnas snart... 🎴</span>";
            }
            if(nextPackBtn) nextPackBtn.classList.add('hidden'); // Gömmer knappen eftersom det inte finns ett pack 3 än
        }
    } else {
        // Om man inte är klar med alla 6 nivåer
        if (cornerTrophy) cornerTrophy.classList.add('hidden');
        if (nextPackBtn) nextPackBtn.classList.add('hidden');
        
        if (currentPack === 2) {
            mapTitle.innerHTML = currentTheme === 'cyber' ? "Välj Utmaning <span style='color: #ef4444;'>[PACK 2]</span>" : "Kartan <span style='color: #ee0000;'>[PACK 2]</span>";
        } else {
            mapTitle.textContent = currentTheme === 'cyber' ? "Välj Utmaning" : "Kartan";
        }
    }
}

// NY FUNKTION: Körs när man klickar på "Vågar du ta det till nästa nivå?"
function activateNextPack() {
    currentPack = 2;
    completedLevels = []; // Nollställer nivåkorgen för det nya packet!
    localStorage.setItem('mathgame-pack', currentPack);
    localStorage.setItem('mathgame-progress', JSON.stringify(completedLevels));
    
    // Nollställer gränssnittet och uppdaterar skärmen
    selectedLevel = null;
    startGameBtn.disabled = true;
    startGameBtn.textContent = "Börja Utmaningen";
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('selected'));
    
    updateMenuButtons();
}

function resetAndGoBack() {
    const levelScreenVisible = !document.getElementById('level-screen').classList.contains('hidden');
    
    if (levelScreenVisible) {
        goToScreen('menu-screen');
    } else {
        selectedLevel = null;
        startGameBtn.disabled = true;
        startGameBtn.textContent = "Börja Utmaningen";
        document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('selected'));
        updateMenuButtons();
        goToScreen('level-screen');
    }
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
//  POP-UP LOGIK FÖR TEMABYTE
// =========================================
let currentTheme = localStorage.getItem('mathgame-theme') || 'cyber';

applyTheme(currentTheme);

function openThemeModal() { themeModal.classList.remove('hidden'); }
function closeThemeModal() { themeModal.classList.add('hidden'); }
function closeThemeModalOnOverlay(e) { if (e.target === themeModal) closeThemeModal(); }

function selectThemeViaModal(theme) {
    currentTheme = theme;
    applyTheme(theme);
    localStorage.setItem('mathgame-theme', theme); 
    closeThemeModal();
}

function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    
    const logoSub = document.getElementById('logo-sub');
    const subtitle = document.getElementById('menu-subtitle');
    const enterBtn = document.getElementById('enter-btn');
    const guideBtn = document.getElementById('guide-btn');
    const helpTitle = document.getElementById('help-title');
    const submitBtnEl = document.getElementById('submit-btn');
    const vicTitle = document.getElementById('victory-title');
    const vicIcon = document.getElementById('victory-icon');
    const failTitle = document.getElementById('fail-title');
    const failText = document.getElementById('fail-text');
    const failIcon = document.getElementById('fail-icon');

    if (theme === 'cyber') {
        if(logoSub) logoSub.textContent = 'CYBER';
        if(subtitle) subtitle.textContent = 'Överlista systemet. Knäck koden. Vinn racet.';
        if(enterBtn) enterBtn.textContent = 'Gå in i systemet';
        if(guideBtn) guideBtn.textContent = 'Regler & Manual';
        if(helpTitle) helpTitle.textContent = 'Spelmanual';
        if(submitBtnEl) submitBtnEl.textContent = 'Skicka Svar';
        if(vicTitle) vicTitle.textContent = 'UTMANINGEN AVKLARAD';
        if(vicIcon) vicIcon.textContent = '🏆';
        if(failTitle) failTitle.textContent = 'Systemfel...';
        if(failText) failText.textContent = 'Dina liv tog slut.';
        if(failIcon) failIcon.textContent = '💥';
    } else {
        if(logoSub) logoSub.textContent = 'DUNGEONS';
        if(subtitle) subtitle.textContent = 'Överlev grottorna. Knäck koden. Erövra skatten.';
        if(enterBtn) enterBtn.textContent = 'Gå in i grottan';
        if(guideBtn) guideBtn.textContent = 'Äventyrarens guide';
        if(helpTitle) helpTitle.textContent = 'Äventyrarens Guide';
        if(submitBtnEl) submitBtnEl.textContent = 'Kasta Besvärjelse';
        if(vicTitle) vicTitle.textContent = 'SKATTEN ÄR DIN';
        if(vicIcon) vicIcon.textContent = '💎';
        if(failTitle) failTitle.textContent = 'Äventyret slutar här...';
        if(failText) failText.textContent = 'Du föll i mörkret.';
        if(failIcon) failIcon.textContent = '💀';
    }

    checkGrandTrophy();
}
