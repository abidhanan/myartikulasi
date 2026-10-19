// --- PEREKAM SUARA: rekam, konversi ke MP3, nama file ---

function isRecording() {
    return !!state.mediaRecorder && state.mediaRecorder.state === 'recording';
}

function formatTimer(ms) {
    const total = Math.floor(ms / 1000);
    return `${pad2(Math.floor(total / 60))}:${pad2(total % 60)}`;
}

// Nama file mengikuti data peserta di form persiapan:
// "Nama Anak - 04 Kata - Tanggal Tes.mp3", mis. "Budi - 04 Motor - 19 Oktober 2026.mp3"
function recordingFileName(word, ext = 'mp3') {
    const clean = text => String(text || '').replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim();
    const name = clean(state.childData.name) || 'Anak';
    const label = word.word.charAt(0).toUpperCase() + word.word.slice(1);
    const date = formatDateId(state.childData.testDate || todayISO());
    return `${name} - ${pad2(word.id)} ${label} - ${date}.${ext}`;
}

// Decode rekaman (webm/ogg/mp4) lalu encode ke MP3 mono 128 kbps
async function blobToMp3(blob) {
    if (typeof lamejs === 'undefined') throw new Error('Encoder MP3 tidak tersedia');

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    let audio;
    try {
        audio = await ctx.decodeAudioData(await blob.arrayBuffer());
    } finally {
        ctx.close();
    }

    const channel = audio.getChannelData(0);
    const samples = new Int16Array(channel.length);
    for (let i = 0; i < channel.length; i++) {
        const v = Math.max(-1, Math.min(1, channel[i]));
        samples[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
    }

    const encoder = new lamejs.Mp3Encoder(1, audio.sampleRate, 128);
    const parts = [];
    const BLOCK = 1152;
    for (let i = 0; i < samples.length; i += BLOCK) {
        const chunk = encoder.encodeBuffer(samples.subarray(i, i + BLOCK));
        if (chunk.length) parts.push(chunk);
    }
    const tail = encoder.flush();
    if (tail.length) parts.push(tail);

    return new Blob(parts, { type: 'audio/mpeg' });
}

// Perbarui tampilan yang sedang aktif (panel penguji atau bagian rekaman di laporan)
function refreshExaminerPanel() {
    if (state.view === 'test') {
        const panel = document.getElementById('examinerPanel');
        if (panel) renderExaminerPanel(panel);
    } else if (state.view === 'report') {
        const section = document.getElementById('recordingSection');
        if (section) section.outerHTML = generateRecordingsHtml();
    }
}

// ---------- Indikator rekaman ----------
let recTimerId = null;

function tickRecTimer() {
    const text = formatTimer(Date.now() - state.recordStartedAt);
    document.querySelectorAll('[data-rec-timer]').forEach(el => { el.textContent = text; });
}

function showRecPill() {
    if (document.getElementById('recPill')) return;
    const pill = document.createElement('button');
    pill.id = 'recPill';
    pill.type = 'button';
    pill.className = 'rec-pill';
    pill.innerHTML = `<span class="rec-dot"></span><span>Merekam</span><b data-rec-timer>00:00</b><span class="rec-pill-stop"><i class="fa-solid fa-stop"></i> Berhenti</span>`;
    pill.addEventListener('click', () => { if (isRecording()) state.mediaRecorder.stop(); });
    document.body.appendChild(pill);
}

function stopRecIndicators() {
    clearInterval(recTimerId);
    recTimerId = null;
    document.getElementById('recPill')?.remove();
}

// ---------- Rekam / berhenti ----------
async function toggleRecording() {
    if (isRecording()) {
        state.mediaRecorder.stop();
        return;
    }

    const item = WORDS_DATA[state.currentCardIndex];

    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
        console.error('Microphone error:', err);
        showDialog({
            title: 'Gagal Merekam',
            message: 'Gagal mengakses mikrofon. Pastikan izin mikrofon diaktifkan pada browser.',
            icon: 'fa-microphone-slash',
            tone: 'rose'
        });
        return;
    }

    const chunks = [];
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

    recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        stopRecIndicators();
        state.recordingItemId = null;

        const raw = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        state.processing[item.id] = true;
        refreshExaminerPanel();

        let saved;
        try {
            const mp3 = await blobToMp3(raw);
            saved = { blob: mp3, ext: 'mp3' };
        } catch (err) {
            // cadangan: simpan format asli bila konversi gagal
            console.error('Konversi MP3 gagal:', err);
            const ext = /ogg/.test(raw.type) ? 'ogg' : /mp4|aac/.test(raw.type) ? 'm4a' : 'webm';
            saved = { blob: raw, ext };
        }

        const previous = state.recordings[item.id];
        if (previous) URL.revokeObjectURL(previous.url);
        state.recordings[item.id] = { ...saved, url: URL.createObjectURL(saved.blob) };
        delete state.processing[item.id];
        refreshExaminerPanel();
    };

    state.mediaRecorder = recorder;
    state.recordingItemId = item.id;
    state.recordStartedAt = Date.now();
    recorder.start();

    recTimerId = setInterval(tickRecTimer, 250);
    showRecPill();
    refreshExaminerPanel();
}
