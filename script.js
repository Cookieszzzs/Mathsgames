// =========================================================================
//  GLOBAL GAME STATE & VARIABLES
// =========================================================================
let selectedLevel = null;
let currentLevel = 1;
let score = 0;
let lives = 3;
const targetScore = 5; 
let currentAnswer = 0;

// Laddar sparad progress från webbläsarens minne
let completedLevels = JSON.parse(localStorage.getItem('mathgame-progress')) || [];
let currentPack = parseInt(localStorage.getItem('mathgame-pack')) || 1; 

let isTransitioning = false;
let currentTheme = localStorage.getItem('mathgame-theme') || 'cyber';

// DOM-element för standardspelet
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

// =========================================================================
//  NEW: BATTLE MODE STATE VARIABLES
// =========================================================================
let battleLevel = parseInt(localStorage.getItem('mathgame-battle-lvl')) || 1;
let playerHP = 100;
let enemyHP = 100;
let enemyMaxHP = 100;
let currentWeapon = 'light';
let battleAnswer = 0;
let isBattleTransitioning = false;

// Sparar vapennivåer så att uppgraderingarna blir permanenta
let weaponLevels = JSON.parse(localStorage.getItem('mathgame-wpn-levels')) || {
    light: 1,
    medium: 1,
    heavy: 1
};

// Hämtar vapenskada baserat på nuvarande nivå (10/10 progression)
function getWeaponDmg(type) {
    const baseDamage = { light: 12, medium: 28, heavy: 55 };
    const scaleFactor = { light: 4, medium: 8, heavy: 15 };
    return baseDamage[type] + (weaponLevels[type] - 1) * scaleFactor;
}

// Hämtar vapennamn dynamiskt beroende på vilket tema som är aktivt
function getWeaponName(type) {
    if (currentTheme === 'cyber') {
        return { light: "Laserkniv", medium: "Plasmagevär", heavy: "Cyber-Slägga" }[type];
    } else {
        return { light: "Snabb Dolk", medium: "Riddarsvärd", heavy: "Stridsslägga" }[type];
    }
}

// =========================================================================
//  AUDIO SYSTEM (Web Audio API - Genererar retro-arkadljud i realtid)
// =========================================================================
function playLevelClearSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const now = ctx.currentTime;

        function playTone(freq, startTime, duration) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle'; 
            osc.frequency.setValueAtTime(freq, startTime);
            
            gain.gain.setValueAtTime(0.08, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        }

        // En glad, uppåtgående arkad-fanfar (C-E-G-C)
        playTone(523.25, now, 0.15);        
        playTone(659.25, now + 0.12, 0.15); 
        playTone(783.99, now + 0.24, 0.15); 
        playTone(1046.50, now + 0.36, 0.5); 

    } catch (e) {
        console.log("Web Audio API stöds inte i denna webbläsare", e);
    }
}

// =========================================================================
//  SCREEN NAVIGATION
// =========================================================================
function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// =========================================================================
//  BATTLE MODE LOGIC (NEW ENGINE)
// =========================================================================
function startBattleRound() {
    playerHP = 100;
    
    // Fiendens HP skalar upp med arenans nivå. Var tredje nivå är en Boss!
    const isBoss = (battleLevel % 3 === 0);
    enemyMaxHP = 40 + (battleLevel * 20);
    if (isBoss) {
        enemyMaxHP = Math.floor(enemyMaxHP * 1.6);
    }
    enemyHP = enemyMaxHP;

    // Återställ gränssnittet till vapenmenyn
    document.getElementById('battle-quiz-container').classList.add('hidden');
    document.getElementById('inventory-section').classList.remove('hidden');
    
    if (isBoss) {
        document.getElementById('battle-feedback').textContent = "⚠️ BOSSSTRID INLEDS! Välj ditt vapen för att attackera!";
    } else {
        document.getElementById('battle-feedback').textContent = "En utmanare närmar sig! Välj ditt vapen för att anfalla!";
    }

    updateBattleUI();
}

function updateBattleUI() {
    const isBoss = (battleLevel % 3 === 0);
    
    // Sätt rubriker och fiendenamn utifrån tema och boss-status
    if (currentTheme === 'cyber') {
        document.getElementById('battle-stage-title').textContent = isBoss ? `BOSS ARENA: SEKTOR ${battleLevel}` : `ARENA: SEKTOR ${battleLevel}`;
        document.getElementById('enemy-name').textContent = isBoss ? "MEGABYTE OVERLORD" : `Skadlig Programvara v.${battleLevel}`;
        document.getElementById('enemy-icon').textContent = isBoss ? "🤖" : "👾";
    } else {
        document.getElementById('battle-stage-title').textContent = isBoss ? `BOSS-GROTTA: NIVÅ ${battleLevel}` : `GROTTA: NIVÅ ${battleLevel}`;
        document.getElementById('enemy-name').textContent = isBoss ? "DRAKEN MATEMATIKUS" : `Grott-Troll lvl.${battleLevel}`;
        document.getElementById('enemy-icon').textContent = isBoss ? "🐉" : "👹";
    }

    // Uppdatera HP-mätare
    const enemyPct = Math.max(0, (enemyHP / enemyMaxHP) * 100);
    document.getElementById('enemy-hp-bar').style.width = `${enemyPct}%`;
    document.getElementById('enemy-hp-text').textContent = `${Math.ceil(enemyHP)} / ${Math.ceil(enemyMaxHP)} HP`;

    const playerPct = Math.max(0, (playerHP / 100) * 100);
    document.getElementById('player-hp-bar').style.width = `${playerPct}%`;
    document.getElementById('player-hp-text').textContent = `${Math.ceil(playerHP)} / 100 HP`;

    // Uppdatera vapenknapparna med aktuella levels och skadevärden
    const types = ['light', 'medium', 'heavy'];
    types.forEach(t => {
        document.getElementById(`wpn-${t}-name`).textContent = `${getWeaponName(t)} (Lvl ${weaponLevels[t]})`;
        const descCard = document.querySelector(`.weapon-card.${t} .weapon-desc`);
        if (descCard) {
            const diffPrefix = t === 'light' ? 'Lätt matte' : t === 'medium' ? 'Medium matte' : 'Tung matte';
            descCard.textContent = `${diffPrefix} (${getWeaponDmg(t)} DMG)`;
        }
    });
}

function selectWeapon(type) {
    currentWeapon = type;
    
    // Växla menyer i stridszonen
    document.getElementById('inventory-section').classList.add('hidden');
    document.getElementById('battle-quiz-container').classList.remove('hidden');
    
    const inputField = document.getElementById('battle-answer-input');
    const submitBtnEl = document.getElementById('battle-submit-btn');
    
    inputField.value = '';
    inputField.disabled = false;
    submitBtnEl.disabled = false;
    isBattleTransitioning = false;
    inputField.focus();

    // Generera High Risk/High Reward matteuppgifter baserat på vapenval
    let num1, num2;
    if (type === 'light') {
        // Lätt matte: Enkel addition/subtraktion
        num1 = Math.floor(Math.random() * 12) + 3;
        num2 = Math.floor(Math.random() * 12) + 3;
        battleAnswer = num1 + num2;
        document.getElementById('battle-question').textContent = `${num1} + ${num2}`;
        document.getElementById('battle-feedback').textContent = `Laddar snabb attack med ${getWeaponName('light')}...`;
    } else if (type === 'medium') {
        // Medium matte: Multiplikationstabeller upp till 10
        num1 = Math.floor(Math.random() * 8) + 2;
        num2 = Math.floor(Math.random() * 9) + 2;
        battleAnswer = num1 * num2;
        document.getElementById('battle-question').textContent = `${num1} × ${num2}`;
        document.getElementById('battle-feedback').textContent = `Siktar noga med ${getWeaponName('medium')}...`;
    } else {
        // Tung matte: Kvadrattal eller tuffare division
        num1 = Math.floor(Math.random() * 8) + 4;
        battleAnswer = num1 * num1;
        document.getElementById('battle-question').textContent = `${num1}²`;
        document.getElementById('battle-feedback').textContent = `Samlar enorm kraft till ${getWeaponName('heavy')}!`;
    }
}

function checkBattleAnswer() {
    if (isBattleTransitioning) return;
    isBattleTransitioning = true;

    const inputField = document.getElementById('battle-answer-input');
    const submitBtnEl = document.getElementById('battle-submit-btn');
    const userAnswer = parseInt(inputField.value);

    if (isNaN(userAnswer)) {
        isBattleTransitioning = false;
        return;
    }

    inputField.disabled = true;
    submitBtnEl.disabled = true;

    if (userAnswer === battleAnswer) {
        // SPELAREN TRÄFFAR FIENDEN
        const dmg = getWeaponDmg(currentWeapon);
        enemyHP -= dmg;
        if (enemyHP < 0) enemyHP = 0;

        document.getElementById('battle-feedback').textContent = `💥 TRÄFF! Du gör ${dmg} skada med din ${getWeaponName(currentWeapon)}!`;
        
        // Snygg skakeffekt på fiendens fält
        const enemyBox = document.getElementById('enemy-icon').parentElement;
        enemyBox.classList.add('enemy-hit');
        setTimeout(() => enemyBox.classList.remove('enemy-hit'), 400);

        updateBattleUI();

        if (enemyHP <= 0) {
            // SEGER! Fienden eller bossen är besegrad
            playLevelClearSound();
            const isBoss = (battleLevel % 3 === 0);

            if (isBoss) {
                // Boss ger legendarisk uppgradering till ALLA vapen!
                weaponLevels.light += 1;
                weaponLevels.medium += 1;
                weaponLevels.heavy += 1;
                document.getElementById('battle-feedback').textContent = `🏆 BOSS BESEGRAD! Alla dina vapen har uppgraderats till en helt ny nivå!`;
            } else {
                // Vanlig fiende uppgraderar det valda vapnet du använde
                weaponLevels[currentWeapon] += 1;
                document.getElementById('battle-feedback').textContent = `🎉 SEGER! Fienden krossades. Din ${getWeaponName(currentWeapon)} gick upp till Lvl ${weaponLevels[currentWeapon]}!`;
            }

            // Spara den nya vapennivån och arenan i localStorage
            localStorage.setItem('mathgame-wpn-levels', JSON.stringify(weaponLevels));
            battleLevel += 1;
            localStorage.setItem('mathgame-battle-lvl', battleLevel);

            // Gå vidare till nästa fiende efter en stunds firande
            setTimeout(() => {
                startBattleRound();
            }, 2500);
        } else {
            // Fienden överlevde, återgå till vapenmenyn för nästa drag
            setTimeout(() => {
                document.getElementById('battle-quiz-container').classList.add('hidden');
                document.getElementById('inventory-section').classList.remove('hidden');
                document.getElementById('battle-feedback').textContent = "Välj ditt nästa vapen för attack!";
                isBattleTransitioning = false;
                updateBattleUI();
            }, 1200);
        }
    } else {
        // FIENDEN KONTRAR VID FEL SVAR
        const enemyDmg = 15 + (battleLevel * 3);
        playerHP -= enemyDmg;
        if (playerHP < 0) playerHP = 0;

        document.getElementById('battle-feedback').textContent = `❌ MISS! Du räknade fel. Fienden slår tillbaka och gör ${enemyDmg} skada på dig!`;
        updateBattleUI();

        if (playerHP <= 0) {
            // SPELAREN FÖRLORAR STRIDEN
            document.getElementById('battle-feedback').textContent = "☠️ Ditt HP nådde noll... Du svimmade och tvingades fly från arenan.";
            setTimeout(() => {
                goToScreen('level-screen');
            }, 2500);
        } else {
            // Återgå till vapenvalet trots smällen
            setTimeout(() => {
                document.getElementById('battle-quiz-container').classList.add('hidden');
                document.getElementById('inventory-section').classList.remove('hidden');
                document.getElementById('battle-feedback').textContent = "Res dig upp! Välj ett vapen och försök igen!";
                isBattleTransitioning = false;
                updateBattleUI();
            }, 1500);
        }
    }
}

// Koppla stridsknapparna till lyssnare
document.getElementById('battle-submit-btn').addEventListener('click', checkBattleAnswer);
document.getElementById('battle-answer-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        checkBattleAnswer();
    }
});


// =========================================================================
//  CAMPAIGN MODE LOGIC (STANDARDSPELET)
// =========================================================================
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
            if (currentPack === 2) num2 += 5;
            currentAnswer = Math.floor(Math.random() * 5) + 2 + Math.floor(score/2);
            if (currentPack === 2) currentAnswer += 6; 
            num1 = num2 * currentAnswer; 
            questionElement.textContent = `${num1} ÷ ${num2}`;
            break;
        case 5:
            num1 = Math.floor(Math.random() * 5) + 2 + score; 
            if (currentPack === 2) num1 += 4;
            currentAnswer = Math.floor(Math.random() * 11); 
            if (currentAnswer < 2) currentAnswer = 2;
            num1 = currentAnswer;
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
        isTransitioning = false; answerInput.disabled = false; submitBtn.disabled = false;
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
            
            playLevelClearSound();

            setTimeout(() => {
                document.getElementById('victory-lives-left').textContent = "❤️".repeat(lives);
                let humanText = "";
                if (currentPack === 2 && completedLevels.length >= 6) {
                    humanText = "GRATTIS! DU HAR KOMMIT SÅ LÅNGT SOM MAN KAN KOMMA! MEN SE UPP!! Det kommer att komma helt nya nivåer i framtiden...";
                } else {
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
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('completed'));
    
    completedLevels.forEach(levelNum => {
        const btn = document.getElementById(`lvl-btn-${levelNum}`);
        if (btn) btn.classList.add('completed');
    });

    checkGrandTrophy();
}

function checkGrandTrophy() {
    const mapTitle = document.getElementById('map-title');
    const nextPackBtn = document.getElementById('next-pack-btn');
    const trophyDisplay = document.getElementById('global-trophy-count');
    if (!mapTitle) return;

    let totalTrophies = 0;
    if (currentPack === 1) {
        totalTrophies = completedLevels.length;
    } else if (currentPack === 2) {
        totalTrophies = 6 + completedLevels.length; 
    }
    
    if (trophyDisplay) trophyDisplay.textContent = totalTrophies;

    if (completedLevels.length >= 6) {
        if (currentPack === 1) {
            if (currentTheme === 'cyber') {
                mapTitle.innerHTML = "👑 SYSTEMET ÄR HACKAT! 👑<br><span style='font-size: 1.1rem; color: #00ffcc;'>Master Hacker-status uppnådd.</span>";
                if(nextPackBtn) { nextPackBtn.textContent = "⚡ Vågar du ta det till nästa nivå? (Pack 2) ⚡"; nextPackBtn.classList.remove('hidden'); }
            } else {
                mapTitle.innerHTML = "👑 GROTTAN ÄR ERÖVRAD! 👑<br><span style='font-size: 1.1rem; color: #ffe08a;'>Eviga Kungens Trofé är din!</span>";
                if(nextPackBtn) { nextPackBtn.textContent = "⚔️ Vågar du ta det till nästa nivå? (Pack 2) ⚔️"; nextPackBtn.classList.remove('hidden'); }
            }
        } else {
            if (currentTheme === 'cyber') {
                mapTitle.innerHTML = "🌌 SYSTEMETS GUD 🌌<br><span style='font-size: 1rem; color: #00ffcc;'>DU HAR KOMMIT SÅ LÅNGT SOM MAN KAN KOMMA!<br>MEN SE UPP!! Nya koder laddas snart... 🛸</span>";
            } else {
                mapTitle.innerHTML = "🔱 GUDOMLIG HJÄLTE 🔱<br><span style='font-size: 1rem; color: #ffe08a;'>DU HAR KOMMIT SÅ LÅNGT SOM MAN KAN KOMMA!<br>MEN SE UPP!! Nya världar öppnas snart... 🎴</span>";
            }
            if(nextPackBtn) nextPackBtn.classList.add('hidden');
        }
    } else {
        if (nextPackBtn) nextPackBtn.classList.add('hidden');
        if (currentPack === 2) {
            mapTitle.innerHTML = currentTheme === 'cyber' ? "Välj Utmaning <span style='color: #ef4444;'>[PACK 2]</span>" : "Kartan <span style='color: #ee0000;'>[PACK 2]</span>";
        } else {
            mapTitle.textContent = currentTheme === 'cyber' ? "Välj Utmaning" : "Kartan";
        }
    }
}

function activateNextPack() {
    currentPack = 2;
    completedLevels = []; 
    localStorage.setItem('mathgame-pack', currentPack);
    localStorage.setItem('mathgame-progress', JSON.stringify(completedLevels));
    
    selectedLevel = null;
    startGameBtn.disabled = true;
    startGameBtn.textContent = "Börja Utmaningen";
    document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('selected'));
    updateMenuButtons();
}

function resetAllProgress() {
    if (confirm("Vill du starta om dina nivåer, rensa pokaler OCH nollställa dina vapennivåer i Arenan?")) {
        currentPack = 1;
        completedLevels = [];
        battleLevel = 1;
        weaponLevels = { light: 1, medium: 1, heavy: 1 };
        
        localStorage.setItem('mathgame-pack', currentPack);
        localStorage.setItem('mathgame-progress', JSON.stringify(completedLevels));
        localStorage.setItem('mathgame-battle-lvl', battleLevel);
        localStorage.setItem('mathgame-wpn-levels', JSON.stringify(weaponLevels));
        
        selectedLevel = null;
        startGameBtn.disabled = true;
        startGameBtn.textContent = "Börja Utmaningen";
        document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('selected'));
        updateMenuButtons();
    }
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
//  THEME LOGIC & INITIALIZATION
// =========================================
applyTheme(currentTheme);

function openThemeModal() { themeModal.classList.remove('hidden'); }
function closeThemeModal() { themeModal.classList.add('hidden'); }
function closeThemeModalOnOverlay(e) { if (e.target === themeModal) closeThemeModal(); }

function selectThemeViaModal(theme) {
    currentTheme = theme;
    applyTheme(theme);
    localStorage.setItem('mathgame-theme', theme); 
    closeThemeModal();
    // Uppdaterar arenans texter direkt om spelaren byter tema mitt i
    if (!document.getElementById('battle-screen').classList.contains('hidden')) {
        updateBattleUI();
    }
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
    updateBattleUI();
}
