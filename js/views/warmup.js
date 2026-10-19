// --- VIEW: Pemanasan (gelembung ajaib) ---
function createWarmupView() {
    state.bubblesPopped = 0;

    const div = document.createElement('div');
    div.className = "vh-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-sky-200 to-green-100 px-4 py-8";

    div.innerHTML = `
        <div class="z-10 text-center glass-panel px-3 py-6 sm:p-10 rounded-3xl w-full max-w-4xl">
            <h1 class="title-oneline font-bold text-amber-500 mb-4 sm:mb-6 font-poppins drop-shadow-sm animate-float leading-tight">✨ Petualangan Kata Ajaib ✨</h1>
            <p class="text-lg sm:text-xl text-slate-600 mb-6 sm:mb-8">Halo! Sebelum kita berpetualang, ayo pecahkan 5 gelembung ajaib di layar!</p>
            <div class="text-2xl sm:text-3xl font-bold text-sky-500 mb-6 sm:mb-8">Gelembung pecah: <span id="bubbleCount">0</span>/5</div>
            <button id="btnMulaiPrep" class="hidden btn-magic bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-full text-xl sm:text-2xl shadow-xl border-4 border-white">
                Mulai Petualangan! 🚀
            </button>
        </div>
        <div id="bubbleContainer" class="absolute inset-0 z-0 pointer-events-none"></div>
    `;

    setTimeout(() => {
        const container = div.querySelector('#bubbleContainer');
        if (!container) return;
        container.style.pointerEvents = 'auto';
        for (let i = 0; i < 15; i++) createBubble(container);
    }, 100);

    div.querySelector('#btnMulaiPrep').addEventListener('click', () => {
        initTestResults();
        setView('prep');
    });

    return div;
}

function createBubble(container) {
    const bubble = document.createElement('div');
    const size = Math.random() * 60 + 40;
    bubble.className = 'bubble';
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 90}vw`;
    bubble.style.bottom = `-100px`;

    const duration = Math.random() * 4 + 4;
    bubble.style.transition = `transform 0.1s, bottom ${duration}s linear`;

    container.appendChild(bubble);

    setTimeout(() => { bubble.style.bottom = '120vh'; }, 100);

    bubble.addEventListener('click', () => {
        bubble.classList.add('popped');
        state.bubblesPopped = Math.min(state.bubblesPopped + 1, 5);
        document.getElementById('bubbleCount').innerText = state.bubblesPopped;

        playPopSound();

        if (state.bubblesPopped >= 5) {
            const btn = document.getElementById('btnMulaiPrep');
            btn.classList.remove('hidden');
            btn.classList.add('animate-bounce');
        }
    });

    // Buat ulang gelembung setelah melayang ke atas
    setTimeout(() => {
        if (container.contains(bubble)) {
            bubble.remove();
            if (state.view === 'warmup') createBubble(container);
        }
    }, duration * 1000);
}

function playPopSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
        osc.onended = () => ctx.close();
    } catch (e) { console.log("Audio not supported"); }
}
