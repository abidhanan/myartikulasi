// --- VIEW: Laporan hasil & dashboard ---
function createReportView() {
    const div = document.createElement('div');
    div.className = "vh-full bg-slate-50 p-4 sm:p-6 md:p-12";

    const c = state.childData;

    div.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            <!-- Aksi atas -->
            <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-3 no-print bg-white p-4 rounded-2xl shadow-sm">
                <button onclick="setView('test')" class="order-2 sm:order-1 text-blue-600 font-bold hover:underline text-left whitespace-nowrap"><i class="fa-solid fa-arrow-left mr-2"></i>Kembali ke Tes</button>
                <button id="btnPdf" onclick="downloadReportPdf(this)" class="order-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-wait text-white font-bold py-2 px-4 sm:px-6 rounded-xl shadow-md transition whitespace-nowrap"><i class="fa-solid fa-file-pdf mr-2"></i>Cetak PDF</button>
                <h1 class="order-1 sm:order-2 w-full sm:w-auto sm:flex-1 text-center text-xl sm:text-2xl font-bold font-poppins text-slate-800">Laporan Hasil Tes</h1>
            </div>

            <!-- Identitas -->
            <div class="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-slate-200" id="printHeader">
                <div class="text-center mb-6">
                    <h2 class="text-xl sm:text-2xl font-black uppercase tracking-widest text-slate-800">Tes Artikulasi</h2>
                    <p class="text-slate-500 font-bold text-sm sm:text-base">DENGAN GAMBAR UNTUK TAHAP KATA</p>
                    <p class="text-sm mt-1 text-slate-400">Adaptasi Modul Tim Teaching SSD</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 text-sm font-medium border-t border-b border-slate-100 py-4">
                    <div><span class="text-slate-500 inline-block w-32">Nama Anak:</span> <strong class="text-slate-800 text-base">${esc(c.name)}</strong> (${esc(c.gender)})</div>
                    <div><span class="text-slate-500 inline-block w-32">Nama Penguji:</span> <strong class="text-slate-800">${esc(c.examiner)}</strong></div>
                    <div><span class="text-slate-500 inline-block w-32">Tanggal Tes:</span> <strong class="text-slate-800">${esc(formatDateId(c.testDate))}</strong></div>
                    <div><span class="text-slate-500 inline-block w-32">Tanggal Lahir:</span> <strong class="text-slate-800">${esc(formatDateId(c.dob))}</strong></div>
                    <div class="sm:col-span-2"><span class="text-slate-500 inline-block w-32">Usia:</span> <strong class="text-slate-800">${c.ageYears} Thn, ${c.ageMonths} Bln, ${c.ageDays} Hr</strong></div>
                    <div class="sm:col-span-2"><span class="text-slate-500 inline-block w-32 align-top">Alasan Tes:</span> <span class="text-slate-800 inline-block max-w-full break-words">${esc(c.reason) || '-'}</span></div>
                </div>
            </div>

            <!-- Lembar Nilai Detail Kata -->
            <div class="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
                <h3 class="text-lg sm:text-xl font-bold font-poppins text-slate-800 mb-4 bg-slate-100 p-3 rounded-lg text-center">LEMBAR NILAI DETAIL KATA</h3>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    ${generateWordTableHtml(0, 11)}
                    ${generateWordTableHtml(11, 22)}
                </div>
                <div class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold bg-slate-50 p-3 rounded-lg justify-center border border-slate-200">
                    <span class="text-red-500">Awalan</span>
                    <span class="text-emerald-500">Pertengahan</span>
                    <span class="text-blue-500">Akhiran</span>
                </div>
            </div>

            <!-- Lembar Nilai Ringkasan Konsonan -->
            <div class="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
                <h3 class="text-lg sm:text-xl font-bold font-poppins text-slate-800 mb-4 bg-slate-100 p-3 rounded-lg text-center">LEMBAR NILAI RINGKASAN KONSONAN</h3>
                <div class="overflow-x-auto rounded-lg">
                    <table class="w-full min-w-[34rem] text-left text-sm border-collapse border border-slate-300">
                        <thead class="bg-slate-100 text-slate-700">
                            <tr>
                                <th class="border border-slate-300 p-2 text-center" rowspan="2">Bunyi</th>
                                <th class="border border-slate-300 p-2 text-center" colspan="3">Posisi & Hasil</th>
                                <th class="border border-slate-300 p-2" rowspan="2">KATA / Catatan Utama</th>
                            </tr>
                            <tr>
                                <th class="border border-slate-300 p-2 text-center text-red-600">Awal</th>
                                <th class="border border-slate-300 p-2 text-center text-emerald-600">Tengah</th>
                                <th class="border border-slate-300 p-2 text-center text-blue-600">Akhir</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateConsonantMatrixHtml()}
                        </tbody>
                    </table>
                </div>
                <div class="mt-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div><strong>B</strong> : Benar</div>
                    <div><strong>R</strong> : Diulang</div>
                    <div><strong>I</strong> : Imitasi/meniru</div>
                    <div><strong>S</strong> : Substitusi</div>
                    <div><strong>O</strong> : Omisi</div>
                    <div><strong>D</strong> : Distorsi</div>
                    <div><strong>A</strong> : Adisi</div>
                </div>
            </div>

            ${generateRecordingsHtml()}

            <!-- Grafik norma perkembangan -->
            <div class="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-slate-200 no-print" id="chartSection">
                <h3 class="text-lg sm:text-xl font-bold font-poppins text-slate-800 mb-4 bg-slate-100 p-3 rounded-lg text-center">Grafik Norma Perkembangan Usia Konsonan</h3>
                <p class="text-sm text-slate-500 mb-6 text-center">Estimasi usia penguasaan konsonan (Adaptasi Templin 1957 & Wellman et al. 1931). Garis vertikal menunjukkan usia anak saat ini (${c.ageYears} thn).</p>
                ${generateNormChartHtml()}
            </div>
        </div>
    `;
    return div;
}

// --- Generator HTML laporan ---
function generateWordTableHtml(start, end) {
    const rows = WORDS_DATA.slice(start, end).map(item => {
        const res = state.testResults.find(r => r.id === item.id);

        const scoreText = [];
        item.targets.forEach(t => {
            const score = res.scores[t.pos];
            if (score) {
                const color = t.pos === 'Awal' ? 'text-red-500' : (t.pos === 'Tengah' ? 'text-emerald-500' : 'text-blue-500');
                scoreText.push(`<span class="${color} font-bold border border-slate-200 rounded px-1 text-xs" title="${t.pos}">${t.char}=${score}</span>`);
            }
        });

        return `
            <div class="flex items-center justify-between gap-2 p-3 border-b border-slate-100 hover:bg-slate-50 transition">
                <div class="flex items-center shrink-0 sm:w-1/3">
                    <span class="text-slate-400 text-xs w-6 shrink-0">${item.id}.</span>
                    <span class="text-2xl mr-2 sm:mr-3 shrink-0">${item.emoji}</span>
                    <span class="font-bold text-slate-700 uppercase tracking-wide text-sm">${item.word}</span>
                </div>
                <div class="flex-1 min-w-0 flex gap-1 justify-end flex-wrap">
                    ${scoreText.join('') || '<span class="text-slate-300 text-xs italic">-</span>'}
                </div>
            </div>
        `;
    }).join('');

    return `<div class="bg-white border border-slate-200 rounded-xl overflow-hidden">${rows}</div>`;
}

function generateConsonantMatrixHtml() {
    let html = '';
    CONSONANT_LIST.forEach(char => {
        const mapping = CONSONANT_MATRIX[char];
        if (!mapping) return;

        const getScoreStr = (posKey) => {
            if (mapping[posKey].length === 0) return '<span class="text-slate-300">-</span>';

            const capitalizedPos = posKey.charAt(0).toUpperCase() + posKey.slice(1);
            return mapping[posKey].map(wordId => {
                const res = state.testResults.find(r => r.id === wordId);
                const score = res ? res.scores[capitalizedPos] : null;

                let classStyle = '';
                if (score === 'B') classStyle = 'bg-green-100 text-green-700';
                else if (score === 'I') classStyle = 'bg-amber-100 text-amber-700 underline font-bold';
                else if (score) classStyle = 'bg-rose-100 text-rose-700';

                const word = WORDS_DATA.find(w => w.id === wordId).word;
                return `<span class="inline-flex flex-col items-center leading-tight m-0.5 px-2 py-1 rounded text-xs font-bold ${classStyle}" title="${word}"><span>${score || '-'}</span><span class="text-[0.6rem] font-semibold opacity-70 no-underline">${word}</span></span>`;
            }).join(' ');
        };

        const relatedWords = [...mapping.awal, ...mapping.tengah, ...mapping.akhir];
        const uniqueWords = [...new Set(relatedWords)].map(id => {
            const word = WORDS_DATA.find(w => w.id === id).word;
            const res = state.testResults.find(r => r.id === id);
            const note = res && res.transcription ? `(${esc(res.transcription)})` : '';
            return `<span class="text-xs text-slate-500">${word}${note}</span>`;
        }).join(', ');

        html += `
            <tr class="hover:bg-slate-50 border-b border-slate-200 transition">
                <td class="p-2 text-center border-r border-slate-200 font-black text-lg bg-slate-50">${char}</td>
                <td class="p-2 text-center border-r border-slate-200">${getScoreStr('awal')}</td>
                <td class="p-2 text-center border-r border-slate-200">${getScoreStr('tengah')}</td>
                <td class="p-2 text-center border-r border-slate-200">${getScoreStr('akhir')}</td>
                <td class="p-2 text-xs leading-tight">${uniqueWords}</td>
            </tr>
        `;
    });
    return html;
}

// Grafik norma: kolom label + area plot yang sejajar dengan sumbu usia 2-8 tahun
function generateNormChartHtml() {
    const MIN_AGE = NORM_MIN_AGE, SPAN = NORM_SPAN;
    const pct = age => ((age - MIN_AGE) / SPAN) * 100;
    const ages = [2, 3, 4, 5, 6, 7, 8];

    const c = state.childData;
    const childAge = c.ageYears + c.ageMonths / 12;
    const showMarker = childAge >= MIN_AGE && childAge <= MIN_AGE + SPAN;

    const bars = NORM_DATA.map(item => `
        <div class="flex items-center text-xs">
            <div class="w-24 sm:w-28 shrink-0 font-bold text-slate-700 text-right pr-3 sm:pr-4 uppercase tracking-wider">${item.sound}</div>
            <div class="flex-1 relative h-7 rounded bg-slate-100 shadow-inner">
                <div class="absolute h-full rounded ${item.color} shadow-sm flex items-center justify-center px-2 text-white font-bold whitespace-nowrap"
                    style="left: ${pct(item.start)}%; width: ${pct(item.end) - pct(item.start)}%; min-width: max-content;">
                    <span class="drop-shadow-md">${item.start} - ${item.end} thn</span>
                </div>
            </div>
        </div>
    `).join('');

    return `
        <div class="overflow-x-auto pb-2">
            <div class="min-w-[36rem] relative pb-10 pr-6">
                <!-- Label sumbu usia -->
                <div class="relative h-6 ml-24 sm:ml-28 mb-2 text-xs font-bold text-slate-400">
                    ${ages.map(a => `<span class="absolute -translate-x-1/2 whitespace-nowrap" style="left:${pct(a)}%">${a} thn</span>`).join('')}
                </div>

                <!-- Garis bantu & penanda usia anak -->
                <div class="absolute top-6 bottom-10 left-24 sm:left-28 right-6 pointer-events-none">
                    ${ages.map(a => `<div class="absolute top-0 bottom-0 border-l border-dashed border-slate-300" style="left:${pct(a)}%"></div>`).join('')}
                    ${showMarker ? `
                    <div class="absolute top-0 bottom-0 border-l-4 border-rose-500 z-10" style="left:${pct(childAge)}%; transform: translateX(-2px);">
                        <div class="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full absolute -bottom-8 left-0 -translate-x-1/2 whitespace-nowrap shadow-md">Usia Anak (${c.ageYears} thn)</div>
                    </div>` : ''}
                </div>

                <div class="space-y-3 relative z-0">${bars}</div>
            </div>
        </div>
    `;
}

// Rekaman suara: pemutar + tombol unduh MP3 per kata
function generateRecordingsHtml() {
    const items = WORDS_DATA.filter(w => state.recordings[w.id] || state.processing[w.id]);

    const rows = items.length ? items.map(w => {
        const rec = state.recordings[w.id];
        const pending = state.processing[w.id];
        return `
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50">
                <div class="flex items-center gap-3 sm:w-48 shrink-0">
                    <span class="text-slate-400 text-xs w-6">${w.id}.</span>
                    <span class="text-2xl">${w.emoji}</span>
                    <span class="font-bold text-slate-700 uppercase tracking-wide text-sm">${w.word}</span>
                </div>
                ${pending || !rec ? `
                <div class="flex-1 text-sm font-bold text-slate-500"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Memproses rekaman...</div>
                ` : `
                <div class="w-full sm:flex-1 min-w-0">${audioPlayerHtml({ url: rec.url, fileName: recordingFileName(w, rec.ext) })}</div>
                `}
            </div>`;
    }).join('') : `<p class="text-center text-slate-400 text-sm py-4">Belum ada rekaman suara. Gunakan tombol <strong>Rekam Suara</strong> pada halaman tes.</p>`;

    return `
        <div class="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-slate-200 no-print" id="recordingSection">
            <h3 class="text-lg sm:text-xl font-bold font-poppins text-slate-800 mb-4 bg-slate-100 p-3 rounded-lg text-center"><i class="fa-solid fa-microphone mr-2 text-rose-500"></i>Rekaman Suara</h3>
            <div class="space-y-3">${rows}</div>
        </div>`;
}
