// --- STATE APLIKASI & UTILITAS ---
const state = {
    view: 'warmup', // warmup, prep, test, report
    childData: {
        name: '', gender: 'L', examiner: '',
        testDate: todayISO(),
        dob: '', ageYears: 0, ageMonths: 0, ageDays: 0, reason: ''
    },
    currentCardIndex: 0,
    testResults: [], // hasil untuk 22 item
    mediaRecorder: null,
    recordingItemId: null, // id kata yang sedang direkam
    recordStartedAt: 0,
    recordings: {}, // { [idKata]: { url, blob, ext } }
    processing: {}, // { [idKata]: true } selama rekaman dikonversi ke MP3
    bubblesPopped: 0
};

function initTestResults() {
    state.testResults = WORDS_DATA.map(word => {
        const scores = {};
        word.targets.forEach(t => scores[t.pos] = null);
        return {
            id: word.id,
            word: word.word,
            scores: scores, // contoh: { Awal: 'B', Tengah: 'S' }
            transcription: '',
            attempts: 0,
            showHint: false
        };
    });
}

// --- Utilitas ---
function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

function pad2(n) { return String(n).padStart(2, '0'); }

function toISO(y, m, d) { return `${y}-${pad2(m + 1)}-${pad2(d)}`; }

function todayISO() {
    const n = new Date();
    return toISO(n.getFullYear(), n.getMonth(), n.getDate());
}

function parseISO(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return { y, m: m - 1, d };
}

function formatDateId(iso) {
    if (!iso) return '';
    const { y, m, d } = parseISO(iso);
    return `${d} ${MONTHS_ID[m]} ${y}`;
}

// Format ringkas untuk tombol date picker, mis. "19 Okt 2026"
function formatDateShort(iso) {
    if (!iso) return '';
    const { y, m, d } = parseISO(iso);
    return `${d} ${MONTHS_ID[m].slice(0, 3)} ${y}`;
}

function calculateAge() {
    const dobInput = document.getElementById('dob').value;
    const testDateInput = document.getElementById('testDate').value;
    const ageDisplay = document.getElementById('ageDisplay');

    if (!dobInput || !testDateInput) return;

    const dob = parseISO(dobInput);
    const test = parseISO(testDateInput);

    if (testDateInput < dobInput) {
        ageDisplay.textContent = 'Tanggal tidak valid';
        ageDisplay.className = 'text-lg font-bold text-rose-500';
        showDialog({
            title: 'Tanggal Tidak Valid',
            message: 'Tanggal tes tidak boleh sebelum tanggal lahir!',
            icon: 'fa-calendar-xmark',
            tone: 'rose'
        });
        return;
    }

    let years = test.y - dob.y;
    let months = test.m - dob.m;
    let days = test.d - dob.d;

    if (days < 0) {
        months--;
        days += new Date(test.y, test.m, 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    state.childData.ageYears = years;
    state.childData.ageMonths = months;
    state.childData.ageDays = days;

    ageDisplay.textContent = `${years} Tahun, ${months} Bulan, ${days} Hari`;
    ageDisplay.className = 'text-lg font-bold text-emerald-600';
}

// --- Router sederhana ---
function setView(viewName) {
    // rekaman yang masih berjalan dihentikan & disimpan sebelum pindah halaman/kartu
    if (typeof isRecording === 'function' && isRecording()) state.mediaRecorder.stop();
    state.view = viewName;
    render();
    window.scrollTo(0, 0);
}

function render() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    switch (state.view) {
        case 'warmup': app.appendChild(createWarmupView()); break;
        case 'prep': app.appendChild(createPrepView()); break;
        case 'test': app.appendChild(createTestView()); break;
        case 'report': app.appendChild(createReportView()); break;
    }
}
