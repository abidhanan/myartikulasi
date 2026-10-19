// --- VIEW: Tes utama (kartu gambar & panel penguji) ---
function createTestView() {
    const div = document.createElement('div');
    div.className = "app-shell";

    const total = WORDS_DATA.length;
    const current = state.currentCardIndex;
    const percent = Math.round(((current + 1) / total) * 100);

    div.innerHTML = `
        <!-- Navigasi atas & progres -->
        <header class="bg-white/95 backdrop-blur shadow-md px-4 py-3 sticky top-0 lg:static z-30">
            <div class="max-w-7xl mx-auto flex flex-wrap items-center gap-x-4 gap-y-3">
                <div class="order-1 w-full flex items-center gap-3 xl:contents">
                    <h2 class="flex-1 min-w-0 truncate text-lg sm:text-xl font-bold text-slate-800 font-poppins xl:order-1 xl:flex-none">Petualangan ${esc(state.childData.name || 'Anak')}</h2>
                    <button id="btnFinish" class="shrink-0 xl:order-4 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-3 sm:px-4 rounded-xl shadow-md transition text-sm sm:text-base whitespace-nowrap">
                        <i class="fa-solid fa-flag-checkered sm:hidden"></i><span class="hidden sm:inline">Akhiri & Lihat Hasil</span>
                    </button>
                </div>

                <div class="order-2 w-full sm:w-48 sm:shrink-0">
                    ${selectHtml({
                        id: 'consonantFilter',
                        placeholder: 'Cari Bunyi...',
                        small: true,
                        options: CONSONANT_LIST.map(c => ({ value: c, label: `Huruf '${c}'` }))
                    })}
                </div>

                <!-- Progres: batang (layar kecil) -->
                <div class="order-3 w-full sm:w-auto sm:flex-1 xl:hidden">
                    <div class="flex justify-between text-xs font-bold text-slate-500 mb-1">
                        <span>Kartu ${current + 1} dari ${total}</span><span>${percent}%</span>
                    </div>
                    <div class="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                        <div class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-500" style="width:${percent}%"></div>
                    </div>
                </div>

                <!-- Progres: titik (layar lebar) -->
                <div class="hidden xl:flex order-3 flex-1 items-center relative px-2">
                    <div class="absolute h-2 bg-slate-200 rounded-full z-0 left-4 right-4 top-1/2 -translate-y-1/2"></div>
                    <div class="w-full flex justify-between z-10 relative">
                        ${WORDS_DATA.map((_, idx) => `
                            <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                                ${idx < current ? 'bg-green-400 text-white shadow-md scale-110' :
                                  idx === current ? 'bg-amber-400 text-white shadow-lg scale-125 ring-2 ring-amber-200 animate-pulse' :
                                  'bg-slate-300 text-slate-500'}">
                                ${idx === current ? '⭐' : idx + 1}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </header>

        <!-- Area utama: layar terbagi -->
        <main class="flex-1 min-h-0 flex flex-col lg:flex-row bg-dots-test">

            <!-- KIRI: tampilan anak (kartu) -->
            <section class="w-full lg:w-1/2 p-4 sm:p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 border-dashed app-scroll">
                <div id="cardContainer" class="card-enter glass-panel w-full max-w-md aspect-square rounded-[2rem] sm:rounded-[3rem] flex flex-col items-center justify-center shadow-2xl relative cursor-pointer group bg-white border-8 border-amber-100">
                    <div class="text-[8rem] sm:text-[12rem] md:text-[15rem] lg:text-[11rem] xl:text-[14rem] leading-none group-hover:scale-110 transition-transform duration-300" style="filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));">
                        ${WORDS_DATA[current].emoji}
                    </div>
                </div>
                <div class="mt-6 sm:mt-8 text-center bg-blue-50 py-3 px-4 sm:px-6 rounded-2xl border-2 border-blue-200">
                    <p class="text-blue-800 font-bold text-base sm:text-lg"><i class="fa-solid fa-chalkboard-user mr-2"></i>Panduan Penguji: Tanyakan <span class="text-xl sm:text-2xl text-rose-500 font-black">"Ini apa?"</span></p>
                </div>
            </section>

            <!-- KANAN: panel penguji -->
            <section class="w-full lg:w-1/2 min-w-0 p-4 sm:p-6 bg-white/80 backdrop-blur-sm app-scroll">
                <div id="examinerPanel" class="max-w-xl mx-auto w-full space-y-6"></div>
            </section>
        </main>
    `;

    setupTestViewListeners(div);
    renderExaminerPanel(div.querySelector('#examinerPanel'));

    return div;
}

// --- Panel penguji ---
function renderExaminerPanel(container) {
    const currentItem = WORDS_DATA[state.currentCardIndex];
    const currentResult = state.testResults[state.currentCardIndex];
    const recording = isRecording() && state.recordingItemId === currentItem.id;
    const processing = !!state.processing[currentItem.id];
    const recorded = state.recordings[currentItem.id];

    const posColor = pos => pos === 'Awal' ? 'text-red-500' : (pos === 'Tengah' ? 'text-emerald-500' : 'text-blue-500');

    const displayConsonants = currentItem.targets.map(t =>
        `<span class="inline-block px-3 py-1 bg-slate-100 rounded-lg m-1 font-bold ${posColor(t.pos)}">${t.pos}: ${t.char.toUpperCase()}</span>`
    ).join('');

    container.innerHTML = `
        <!-- Target kata -->
        <div class="bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Target Kata</h3>
            <div class="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight font-poppins mb-3 break-words">${currentItem.word.toUpperCase()}</div>
            <div class="flex justify-center flex-wrap">${displayConsonants}</div>
        </div>

        <!-- Alat bantu -->
        <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <button id="btnHint" class="bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-700 font-bold py-3 px-3 sm:px-4 rounded-2xl transition flex flex-col items-center justify-center">
                <i class="fa-solid fa-lightbulb text-2xl mb-1 text-amber-400"></i>
                <span>Beri Petunjuk</span>
            </button>

            <button id="btnRecord" ${processing ? 'disabled' : ''} class="${recording ? 'bg-rose-600 hover:bg-rose-700 border-rose-700 text-white shadow-lg' : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'} border-2 font-bold py-3 px-3 sm:px-4 rounded-2xl transition flex flex-col items-center justify-center relative overflow-hidden disabled:opacity-60 disabled:cursor-wait">
                <i class="fa-solid ${processing ? 'fa-spinner fa-spin' : (recording ? 'fa-stop' : 'fa-microphone')} text-2xl mb-1"></i>
                <span id="recordText">${processing ? 'Memproses...' : (recording ? 'Berhenti' : (recorded ? 'Rekam Ulang' : 'Rekam Suara'))}</span>
                ${recording ? `<span class="text-xs font-semibold tabular-nums text-rose-100" data-rec-timer>${formatTimer(Date.now() - state.recordStartedAt)}</span>` : ''}
                ${recorded && !recording ? `<div class="absolute top-1 right-2 w-3 h-3 bg-green-500 rounded-full"></div>` : ''}
            </button>
        </div>

        <!-- Petunjuk -->
        <div id="hintArea" class="hidden bg-indigo-600 text-white p-4 rounded-2xl shadow-inner animate-fade-in">
            <p class="font-bold text-indigo-200 text-sm mb-1">Bacakan Kalimat Pengarahan:</p>
            <p class="text-lg leading-snug">"${esc(currentItem.hint)}"</p>
        </div>

        ${recorded && !recording && !processing ? `
        <div class="bg-slate-100 p-3 rounded-2xl border border-slate-200">
            ${audioPlayerHtml({ url: recorded.url, fileName: recordingFileName(currentItem, recorded.ext) })}
        </div>
        ` : ''}

        <!-- Jumlah percobaan -->
        <div class="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex justify-between items-center gap-3">
            <div class="min-w-0">
                <span class="font-bold text-amber-800 block">Jumlah Percobaan:</span>
            </div>
            <div class="shrink-0 flex items-center gap-2">
                <button id="btnAttemptMinus" aria-label="Kurangi percobaan" ${currentResult.attempts === 0 ? 'disabled' : ''} class="w-10 h-10 bg-white rounded-full border-2 border-amber-300 text-amber-600 font-black shadow-sm hover:bg-amber-100 transition disabled:opacity-40 disabled:cursor-not-allowed"><i class="fa-solid fa-minus"></i></button>
                <span class="min-w-[2.75rem] text-center text-2xl font-black text-amber-700 tabular-nums">${currentResult.attempts}x</span>
                <button id="btnAttemptPlus" aria-label="Tambah percobaan" ${currentResult.attempts >= 3 ? 'disabled' : ''} class="w-10 h-10 bg-amber-400 rounded-full border-2 border-amber-400 text-white font-black shadow-sm hover:bg-amber-500 transition disabled:opacity-40 disabled:cursor-not-allowed"><i class="fa-solid fa-plus"></i></button>
            </div>
        </div>

        ${currentResult.attempts >= 3 ? `
        <div class="bg-rose-100 border-l-4 border-rose-500 p-4 rounded-r-xl">
            <p class="text-rose-700 font-bold"><i class="fa-solid fa-triangle-exclamation mr-2"></i>3x Percobaan Gagal.</p>
            <p class="text-sm text-rose-600 mt-1">Mintalah anak meniru pengucapan kata dan berikan nilai <strong class="bg-rose-200 px-1 rounded">I (Imitasi)</strong> di bawah ini.</p>
        </div>
        ` : ''}

        <!-- Penilaian -->
        <div class="space-y-4 pt-4 border-t-2 border-slate-100">
            <h3 class="font-bold text-slate-700 text-lg flex items-center"><i class="fa-solid fa-pen-to-square text-blue-500 mr-2"></i>Penilaian Cepat</h3>

            ${currentItem.targets.map(target => {
                const colorClass = target.pos === 'Awal' ? 'text-red-600 bg-red-50' : (target.pos === 'Tengah' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50');
                const borderClass = target.pos === 'Awal' ? 'border-red-200' : (target.pos === 'Tengah' ? 'border-emerald-200' : 'border-blue-200');

                return `
                <div class="p-3 sm:p-4 rounded-2xl border ${borderClass} ${colorClass}">
                    <div class="flex justify-between items-center mb-3">
                        <span class="font-bold uppercase tracking-wide text-sm">${target.pos}</span>
                        <span class="text-2xl font-black bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-sm">${target.char}</span>
                    </div>
                    <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
                        ${SCORE_CODES.map(code => {
                            const isSelected = currentResult.scores[target.pos] === code;
                            const isImitasiRec = (code === 'I' && currentResult.attempts >= 3);
                            let btnClasses = `h-10 rounded-xl font-bold transition flex items-center justify-center border-2
                                ${isSelected ? 'bg-slate-800 text-white border-slate-800 scale-105 shadow-md' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'}`;

                            if (isImitasiRec && !isSelected) btnClasses += ' ring-2 ring-rose-400 ring-offset-2 animate-pulse';

                            return `<button class="score-btn ${btnClasses}" data-pos="${target.pos}" data-code="${code}" title="${SCORE_TITLES[code]}">${code}</button>`;
                        }).join('')}
                    </div>
                </div>
                `;
            }).join('')}
        </div>

        <!-- Catatan transkripsi -->
        <div>
            <input type="text" id="transcriptionInput" value="${esc(currentResult.transcription)}" placeholder="Catatan transkripsi (opsional)..." class="field field-soft">
        </div>

        <!-- Navigasi -->
        <div class="flex justify-between gap-3 pt-4 pb-2">
            <button id="btnPrev" class="px-5 sm:px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition" ${state.currentCardIndex === 0 ? 'disabled' : ''}>
                <i class="fa-solid fa-chevron-left mr-2"></i> Kembali
            </button>
            <button id="btnNext" class="px-5 sm:px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md transition">
                ${state.currentCardIndex === WORDS_DATA.length - 1 ? 'Selesai <i class="fa-solid fa-flag-checkered ml-2"></i>' : 'Lanjut <i class="fa-solid fa-chevron-right ml-2"></i>'}
            </button>
        </div>
    `;

    attachPanelListeners(container);
}

// --- Interaksi dalam panel ---
function attachPanelListeners(container) {
    const currentResult = state.testResults[state.currentCardIndex];
    const refresh = () => renderExaminerPanel(document.getElementById('examinerPanel'));

    container.querySelector('#btnHint').addEventListener('click', () => {
        container.querySelector('#hintArea').classList.toggle('hidden');
    });

    container.querySelector('#btnAttemptPlus').addEventListener('click', () => {
        if (currentResult.attempts < 3) {
            currentResult.attempts++;
            refresh();
        }
    });
    container.querySelector('#btnAttemptMinus').addEventListener('click', () => {
        if (currentResult.attempts > 0) {
            currentResult.attempts--;
            refresh();
        }
    });

    container.querySelectorAll('.score-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { pos, code } = e.currentTarget.dataset;
            currentResult.scores[pos] = currentResult.scores[pos] === code ? null : code;
            refresh();
        });
    });

    container.querySelector('#transcriptionInput').addEventListener('input', (e) => {
        currentResult.transcription = e.target.value;
    });

    container.querySelector('#btnPrev').addEventListener('click', () => navigateCard(-1));
    container.querySelector('#btnNext').addEventListener('click', () => navigateCard(1));
    container.querySelector('#btnRecord').addEventListener('click', toggleRecording);
}

function setupTestViewListeners(div) {
    const card = div.querySelector('#cardContainer');
    card.addEventListener('click', () => {
        card.style.transform = 'scale(0.95)';
        setTimeout(() => card.style.transform = 'scale(1)', 150);
    });

    // Filter konsonan
    div.querySelector('#consonantFilter').addEventListener('change', (e) => {
        const char = e.target.value;
        const root = e.target.closest('[data-select]');
        if (!char) return;

        const foundIndex = WORDS_DATA.findIndex(w => w.targets.some(t => t.char === char));
        if (foundIndex !== -1) {
            state.currentCardIndex = foundIndex;
            setView('test');
        } else {
            setSelectValue(root, '');
            showDialog({
                title: 'Bunyi Tidak Ditemukan',
                message: `Bunyi '${char}' tidak ditemukan sebagai target utama dalam 22 gambar ini.`,
                icon: 'fa-magnifying-glass',
                tone: 'amber'
            });
        }
    });

    div.querySelector('#btnFinish').addEventListener('click', async () => {
        const ok = await confirmDialog({
            title: 'Akhiri Tes?',
            message: 'Yakin ingin mengakhiri tes dan melihat hasil?',
            confirmText: 'Ya, Lihat Hasil',
            icon: 'fa-flag-checkered',
            tone: 'rose'
        });
        if (ok) setView('report');
    });
}

function navigateCard(direction) {
    const newIndex = state.currentCardIndex + direction;
    if (newIndex >= 0 && newIndex < WORDS_DATA.length) {
        state.currentCardIndex = newIndex;
        setView('test');
    } else if (newIndex >= WORDS_DATA.length) {
        setView('report');
    }
}
