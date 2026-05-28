// ==========================================
// GLOBAL STATE (MINNE)
// ==========================================
let globalTrophies = parseInt(localStorage.getItem("globalTrophies")) || 0;
let completedLevels = JSON.parse(localStorage.getItem("completedLevels")) || [];
let selectedLevelId = null;

// Spelvariabler för Kampanj
let campaignCurrentQuestion = 1;
let campaignCorrectAnswers = 0;
let currentCampaignAnswer = 0;
let campaignLives = 3;

// Spelvariabler för Arenan (Boss)
let playerHP = 100;
let enemyHP = 120;
const maxEnemyHP = 120;
let currentBattleCorrectAnswer = 0;
let chosenWeapon = '';
let currentWeaponDamage = 0;

// Initiering vid start
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("global-trophy-count").innerText = globalTrophies;
    renderLevelGrid();
});

// ==========================================
// SKÄRMSYSTEM (NAVIGERING)
// ==========================================
function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
    
    // Rensa inputs
    if(screenId === 'game-screen') document.getElementById("answer-input").value = "";
    if(screenId === 'battle-screen') document.getElementById("battle-answer-input").value = "";
}

// ==========================================
// NIVÅVALS-LOGIK
// ==========================================
function renderLevelGrid() {
    const buttons = document.querySelectorAll('.level-btn');
    buttons.forEach((btn, index) => {
        const lvlNum = index + 1;
        btn.classList.remove('selected', 'completed');
        
        if (completedLevels.includes(lvlNum)) {
            btn.classList.add('completed');
        }
        if (selectedLevelId === lvlNum) {
            btn.classList.add('selected');
        }
    });
}

function selectLevel(levelNum) {
    selectedLevelId = levelNum;
    renderLevelGrid();
    document.getElementById("start-campaign-btn").removeAttribute("disabled");
}

// ==========================================
// GENERERA MATTEMATIK
// ==========================================
function generateMathQuestion(level) {
    let num1, num2, questionText, answer;
    
    switch(level) {
        case 1:
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            if(Math.random() > 0.5) {
                questionText = `${num1} + ${num2}`; answer = num1 + num2;
            } else {
                if(num1 < num2) { let t = num1; num1 = num2; num2 = t; }
                questionText = `${num1} - ${num2}`; answer = num1 - num2;
            }
            break;
        case 2:
            num1 = Math.floor(Math.random() * 30) + 10;
            num2 = Math.floor(Math.random() * 20) + 5;
            questionText = `${num1} + ${num2}`; answer = num1 + num2;
            break;
        case 3:
            num1 = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
            num2 = Math.floor(Math.random() * 10) + 1;
            questionText = `${num1} x ${num2}`; answer = num1 * num2;
            break;
        case 4:
            num1 = [6, 7, 8, 9][Math.floor(Math.random() * 4)];
            num2 = Math.floor(Math.random() * 10) + 1;
            questionText = `${num1} x ${num2}`; answer = num1 * num2;
            break;
        default:
            num1 = Math.floor(Math.random() * 9) + 2;
            num2 = Math.floor(Math.random() * 9) + 2;
            questionText = `${num1} x ${num2}`; answer = num1 * num2;
    }
    return { text: questionText, answer: answer };
}

// ==========================================
// KAMPANJLÄGET LOGIK (MED LIV & ANIMATION)
// ==========================================
function startCampaignGame() {
    campaignCurrentQuestion = 1;
    campaignCorrectAnswers = 0;
    campaignLives = 3;
    updateLivesDisplay();
    goToScreen('game-screen');
    setupNextCampaignQuestion();
}

function updateLivesDisplay() {
    let hearts = "";
    for(let i=0; i<campaignLives; i++) hearts += "❤️";
    for(let i=campaignLives; i<3; i++) hearts += "🖤";
    document.getElementById("lives-display").innerText = hearts;
}

function setupNextCampaignQuestion() {
    document.getElementById("game-level-indicator").innerText = `Nivå ${selectedLevelId}`;
    document.getElementById("question-counter").innerText = `${campaignCurrentQuestion}/10`;
    document.getElementById("game-progress-bar").style.width = `${(campaignCurrentQuestion - 1) * 10}%`;
    document.getElementById("game-feedback").innerText = "";
    
    let qObj = generateMathQuestion(selectedLevelId);
    document.getElementById("game-question").innerText = qObj.text;
    currentCampaignAnswer = qObj.answer;
}

function submitCampaignAnswer() {
    const input = document.getElementById("answer-input");
    const userAns = parseInt(input.value);
    if(isNaN(userAns)) return;

    const feedback = document.getElementById("game-feedback");
    const gameCard = document.querySelector(".game-card");

    if(userAns === currentCampaignAnswer) {
        campaignCorrectAnswers++;
        feedback.className = "feedback correct";
        feedback.innerText = "Snyggt! Rätt svar.";
        gameCard.classList.add("success-pop");
        setTimeout(() => gameCard.classList.remove("success-pop"), 300);
    } else {
        campaignLives--;
        updateLivesDisplay();
        feedback.className = "feedback wrong";
        feedback.innerText = `Fel! Rätt svar var ${currentCampaignAnswer}`;
        gameCard.classList.add("shake");
        setTimeout(() => gameCard.classList.remove("shake"), 300);

        if(campaignLives <= 0) {
            setTimeout(() => { endCampaignGame(false); }, 1000);
            return;
        }
    }

    setTimeout(() => {
        campaignCurrentQuestion++;
        if(campaignCurrentQuestion <= 10) {
            input.value = "";
            setupNextCampaignQuestion();
        } else {
            // Sista frågan är avklarad -> Går till 11/10
            document.getElementById("question-counter").innerText = `11/10`;
            document.getElementById("game-progress-bar").style.width = `100%`;
            setTimeout(() => { endCampaignGame(true); }, 800);
        }
    }, 1200);
}

function endCampaignGame(won) {
    if(won) {
        if (!completedLevels.includes(selectedLevelId)) {
            completedLevels.push(selectedLevelId);
            localStorage.setItem("completedLevels", JSON.stringify(completedLevels));
            globalTrophies += 1;
            localStorage.setItem("globalTrophies", globalTrophies);
            document.getElementById("global-trophy-count").innerText = globalTrophies;
        }
        document.getElementById("victory-icon").innerText = "🏆";
        document.getElementById("victory-title").innerText = "NIVÅ KLARAD!";
        document.getElementById("victory-text").innerText = `Bra jobbat! Du fick ${campaignCorrectAnswers} rätt och har kvar ${campaignLives} liv!`;
        goToScreen('victory-screen');
    } else {
        document.getElementById("fail-icon").innerText = "❌";
        document.getElementById("fail-title").innerText = "SLUT PÅ LIV!";
        document.getElementById("fail-text").innerText = `Du förlorade alla dina hjärtan. Träna mer och försök igen!`;
        const retryBtn = document.querySelector(".retry-btn");
        retryBtn.setAttribute("onclick", "retryCurrentGame()");
        goToScreen('game-over-screen');
    }
    renderLevelGrid();
}

function retryCurrentGame() {
    startCampaignGame();
}

// ==========================================
// BATTLE MODE (BOSSEN) LOGIK
// ==========================================
function startBattleArena() {
    playerHP = 100;
    enemyHP = maxEnemyHP;
    updateBattleHUD();
    
    document.getElementById("battle-feedback").innerText = "Välj ett vapen nedan för att ladda din attack!";
    document.getElementById("battle-quiz-container").classList.add("hidden");
    document.getElementById("inventory-section").classList.remove("hidden");
    
    goToScreen('battle-screen');
}

function selectWeapon(weaponType) {
    chosenWeapon = weaponType;
    if(weaponType === 'light') { currentWeaponDamage = 15; }
    else if(weaponType === 'medium') { currentWeaponDamage = 30; }
    else if(weaponType === 'heavy') { currentWeaponDamage = 55; }

    let qObj = generateMathQuestion(5); 
    currentBattleCorrectAnswer = qObj.answer;
    
    document.getElementById("battle-question").innerText = qObj.text;
    document.getElementById("battle-answer-input").value = "";
    
    document.getElementById("inventory-section").classList.add("hidden");
    document.getElementById("battle-quiz-container").classList.remove("hidden");
    document.getElementById("battle-feedback").innerText = `Laddar vapen... Svara för att skjuta!`;
}

function submitBattleAnswer() {
    const input = document.getElementById("battle-answer-input");
    const userAns = parseInt(input.value);
    if(isNaN(userAns)) return;

    if(userAns === currentBattleCorrectAnswer) {
        enemyHP -= currentWeaponDamage;
        if(enemyHP < 0) enemyHP = 0;
        updateBattleHUD();
        document.getElementById("battle-feedback").innerText = `💥 BOM! Du gör ${currentWeaponDamage} skada!`;
        
        const enemyBox = document.getElementById("enemy-box");
        enemyBox.classList.add("enemy-hit");
        setTimeout(() => enemyBox.classList.remove("enemy-hit"), 300);
        
        if(enemyHP <= 0) {
            setTimeout(() => { triggerBattleVictory(); }, 1200);
            return;
        }
    } else {
        let recoilDamage = 15;
        if(chosenWeapon === 'medium') recoilDamage = 25;
        if(chosenWeapon === 'heavy') recoilDamage = 40;

        playerHP -= recoilDamage;
        if(playerHP < 0) playerHP = 0;
        updateBattleHUD();
        document.getElementById("battle-feedback").innerText = `❌ REKYLEXPLOSION! Bossen straffar dig med ${recoilDamage} skada!`;
        
        const playerHud = document.querySelector(".player-battle-hud");
        playerHud.classList.add("shake");
        setTimeout(() => playerHud.classList.remove("shake"), 300);

        if(playerHP <= 0) {
            setTimeout(() => { triggerBattleGameOver(); }, 1200);
            return;
        }
    }

    setTimeout(() => {
        document.getElementById("battle-quiz-container").classList.add("hidden");
        document.getElementById("inventory-section").classList.remove("hidden");
        document.getElementById("battle-feedback").innerText = "Välj nästa vapen för att anfalla igen!";
    }, 1500);
}

function updateBattleHUD() {
    let enemyPct = (enemyHP / maxEnemyHP) * 100;
    document.getElementById("enemy-hp-bar").style.width = `${enemyPct}%`;
    document.getElementById("enemy-hp-text").innerText = `${enemyHP} / ${maxEnemyHP} HP`;

    document.getElementById("player-hp-bar").style.width = `${playerHP}%`;
    document.getElementById("player-hp-text").innerText = `${playerHP} / 100 HP`;
}

function triggerBattleVictory() {
    globalTrophies += 5;
    localStorage.setItem("globalTrophies", globalTrophies);
    document.getElementById("global-trophy-count").innerText = globalTrophies;

    document.getElementById("victory-icon").innerText = "👑";
    document.getElementById("victory-title").innerText = "BOSSEN ÄR KROSSAD!";
    document.getElementById("victory-text").innerText = "Legendariskt! Du har rensat Arenan och belönas med +5 Pokaler!";
    goToScreen('victory-screen');
}

function triggerBattleGameOver() {
    document.getElementById("fail-icon").innerText = "💀";
    document.getElementById("fail-title").innerText = "ARENA TERMINATED";
    document.getElementById("fail-text").innerText = "Ditt liv nådde 0. Bossen krossade dig!";
    const retryBtn = document.querySelector(".retry-btn");
    retryBtn.setAttribute("onclick", "startBattleArena()");
    goToScreen('game-over-screen');
}

function resetAllProgress() {
    if(confirm("Är du säker på att du vill radera alla pokaler och klarade nivåer?")) {
        localStorage.clear();
        globalTrophies = 0;
        completedLevels = [];
        selectedLevelId = null;
        document.getElementById("global-trophy-count").innerText = 0;
        document.getElementById("start-campaign-btn").setAttribute("disabled", "true");
        renderLevelGrid();
    }
}
