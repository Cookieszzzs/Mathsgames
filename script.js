* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: '-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
    background-color: #0b0f19;
    color: #f8fafc;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.game-container {
    width: 100%;
    max-width: 440px;
    padding: 24px;
}

/* DE OLIKA MENYERNA/SKÄRMARNA */
.screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    animation: fadeIn 0.3s ease-out-in; /* Gör menybyten mjuka */
}

/* DENNA GÖR ATT MENYERNA FAKTISKT DÖLJS */
.hidden {
    display: none !important;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

/* LOGO & TEXT */
.logo {
    font-size: 3.5rem;
    font-weight: 900;
    letter-spacing: -2px;
    margin-bottom: 8px;
    background: linear-gradient(to right, #fff, #38bdf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.accent { color: #38bdf8; }
.subtitle { color: #64748b; margin-bottom: 40px; font-size: 1.1rem; }
h2 { font-size: 2rem; margin-bottom: 24px; font-weight: 800; }

/* 6-NIVÅERS GRID */
.level-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    width: 100%;
    margin-bottom: 24px;
}

.level-btn {
    background: #111827;
    border: 2px solid #1f2937;
    color: white;
    padding: 16px;
    border-radius: 16px;
    font-size: 1.5rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.level-btn:hover {
    border-color: #4b5563;
    transform: translateY(-2px);
}

.level-btn.selected {
    border-color: #38bdf8;
    background: rgba(56, 189, 248, 0.08);
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.15);
}

.lvl-title {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
    margin-top: 4px;
}

/* GUI: PROGRESS BAR */
.progress-container {
    width: 100%;
    height: 8px;
    background: #1f2937;
    border-radius: 99px;
    margin-bottom: 20px;
    overflow: hidden;
}

.progress-bar {
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, #38bdf8, #06b6d4);
    border-radius: 99px;
    transition: width 0.3s ease;
}

/* SPELKORT & HJÄLPKORT */
.game-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    color: #94a3b8;
    margin-bottom: 10px;
}

.card {
    background: #111827;
    border: 1px solid #1f2937;
    width: 100%;
    padding: 32px;
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    text-align: center;
}

.help-card p {
    margin-bottom: 15px;
    color: #94a3b8;
    font-size: 1.05rem;
    line-height: 1.5;
    text-align: left;
}

.question {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 24px;
}

input[type="number"] {
    width: 100%;
    padding: 16px;
    background: #0b0f19;
    border: 2px solid #1f2937;
    border-radius: 14px;
    color: white;
    font-size: 1.5rem;
    text-align: center;
    outline: none;
    margin-bottom: 16px;
}

input[type="number"]:focus { border-color: #38bdf8; }

/* KNAPPAR */
.btn {
    width: 100%;
    padding: 16px;
    border-radius: 14px;
    font-size: 1.05rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
}

.primary { background: #38bdf8; color: #0b0f19; }
.primary:hover { background: #7dd3fc; }

.btn:disabled { background: #111827; color: #4b5563; border: 1px solid #1f2937; cursor: not-allowed; }
.secondary { background: #1f2937; color: #f8fafc; margin-bottom: 10px; }
.secondary:hover { background: #2d3748; }
.text-btn { background: transparent; color: #475569; margin-top: 12px; }
.text-btn:hover { color: #94a3b8; }

/* FEEDBACK & SHAKE */
.feedback { margin-top: 16px; min-height: 24px; font-weight: 600; }
.correct { color: #34d399; }
.wrong { color: #f87171; }

.shake { animation: shake 0.4s ease-in-out; }
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-8px); }
    40%, 80% { transform: translateX(8px); }
}

.victory-card { text-align: center; padding: 20px; }
.trophy { font-size: 5rem; margin-bottom: 16px; animation: bounce 1s infinite alternate; }
@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-12px); } }
