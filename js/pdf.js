// --- UNDUH LAPORAN SEBAGAI PDF (satu file, beberapa halaman A4) ---
// PDF memakai layout khusus per halaman A4 (794 x 1123 px) sehingga hasilnya rapi
// dan sama di HP maupun laptop, tidak bergantung pada tampilan layar.
const PDF_PAGE_W = 794;
const PDF_PAGE_H = 1123;

function reportPdfFileName() {
    const clean = text => String(text || '').replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim();
    const name = clean(state.childData.name) || 'Anak';
    return `Laporan Artikulasi - ${name} - ${formatDateId(state.childData.testDate || todayISO())}.pdf`;
}

function pdfScoreClass(score) {
    if (score === 'B') return 'is-b';
    if (score === 'I') return 'is-i';
    return score ? 'is-x' : 'is-none';
}

function pdfWordRows(start, end) {
    const posClass = { Awal: 'pdf-awal', Tengah: 'pdf-tengah', Akhir: 'pdf-akhir' };
    return WORDS_DATA.slice(start, end).map(item => {
        const res = state.testResults.find(r => r.id === item.id);
        const chips = item.targets
            .filter(t => res.scores[t.pos])
            .map(t => `<span class="pdf-chip ${posClass[t.pos]}">${t.char}=${res.scores[t.pos]}</span>`)
            .join('') || '<span class="pdf-dash">-</span>';
        return `
            <div class="pdf-wrow">
                <span class="pdf-no">${item.id}.</span>
                <span class="pdf-emoji">${item.emoji}</span>
                <span class="pdf-word">${item.word}</span>
                <span class="pdf-chips">${chips}</span>
            </div>`;
    }).join('');
}

function pdfMatrixRows() {
    return CONSONANT_LIST.map(char => {
        const mapping = CONSONANT_MATRIX[char];

        const cell = pos => {
            if (!mapping[pos].length) return '<span class="pdf-dash">-</span>';
            const label = pos.charAt(0).toUpperCase() + pos.slice(1);
            return mapping[pos].map(id => {
                const res = state.testResults.find(r => r.id === id);
                const score = res ? res.scores[label] : null;
                const word = WORDS_DATA.find(w => w.id === id).word;
                return `<span class="pdf-score ${pdfScoreClass(score)}">${score ? `<b>${score}</b>` : ''}${word}</span>`;
            }).join('');
        };

        const related = [...new Set([...mapping.awal, ...mapping.tengah, ...mapping.akhir])].map(id => {
            const word = WORDS_DATA.find(w => w.id === id).word;
            const res = state.testResults.find(r => r.id === id);
            return res && res.transcription ? `${word} (${esc(res.transcription)})` : word;
        }).join(', ');

        return `
            <tr>
                <td class="pdf-sound">${char}</td>
                <td>${cell('awal')}</td>
                <td>${cell('tengah')}</td>
                <td>${cell('akhir')}</td>
                <td class="pdf-notes">${related}</td>
            </tr>`;
    }).join('');
}

// Grafik norma perkembangan usia konsonan (halaman 3)
function pdfChartHtml() {
    const c = state.childData;
    const pct = age => ((age - NORM_MIN_AGE) / NORM_SPAN) * 100;
    const ages = [2, 3, 4, 5, 6, 7, 8];
    const childAge = c.ageYears + c.ageMonths / 12;
    const inRange = childAge >= NORM_MIN_AGE && childAge <= NORM_MIN_AGE + NORM_SPAN;

    const rows = NORM_DATA.map(item => `
        <div class="pdf-nrow">
            <div class="pdf-nlabel">${item.sound}</div>
            <div class="pdf-ntrack">
                <div class="pdf-nbar" style="left:${pct(item.start)}%;width:${pct(item.end) - pct(item.start)}%;background:${item.hex}">${item.start} - ${item.end} thn</div>
            </div>
        </div>`).join('');

    return `
        <p class="pdf-chart-note">Estimasi usia penguasaan konsonan (Adaptasi Templin 1957 &amp; Wellman et al. 1931).
            ${inRange ? `Garis vertikal menunjukkan usia anak saat ini (${c.ageYears} thn ${c.ageMonths} bln).` : 'Usia anak berada di luar rentang grafik (2 - 8 tahun).'}</p>
        <div class="pdf-chart">
            <div class="pdf-axis">
                ${ages.map(a => `<span style="left:${pct(a)}%">${a} thn</span>`).join('')}
            </div>
            <div class="pdf-nrows">
                <div class="pdf-ngrid">
                    ${ages.map(a => `<i style="left:${pct(a)}%"></i>`).join('')}
                    ${inRange ? `<div class="pdf-nchild" style="left:${pct(childAge)}%"><em>Usia Anak (${c.ageYears} thn)</em></div>` : ''}
                </div>
                ${rows}
            </div>
        </div>`;
}

// Dokumen PDF terdiri dari 3 halaman A4 dalam satu file:
// halaman 1 = identitas + lembar nilai detail kata, halaman 2 = lembar nilai ringkasan konsonan,
// halaman 3 = grafik norma perkembangan usia konsonan
function buildPdfPagesHtml() {
    const c = state.childData;
    const total = 3;
    const foot = n => `<div class="pdf-foot"><span>Tes Artikulasi - ${esc(c.name)} - ${esc(formatDateId(c.testDate))}</span><span>Halaman ${n} dari ${total}</span></div>`;

    const page1 = `
        <div class="pdf-sheet">
            <div class="pdf-title">
                <h1>TES ARTIKULASI</h1>
                <p class="pdf-sub">DENGAN GAMBAR UNTUK TAHAP KATA</p>
                <p class="pdf-adapt">Adaptasi Modul Tim Teaching SSD</p>
            </div>

            <div class="pdf-id">
                <div><span>Nama Anak</span>: <b>${esc(c.name)}</b> (${esc(c.gender)})</div>
                <div><span>Nama Penguji</span>: <b>${esc(c.examiner)}</b></div>
                <div><span>Tanggal Tes</span>: <b>${esc(formatDateId(c.testDate))}</b></div>
                <div><span>Tanggal Lahir</span>: <b>${esc(formatDateId(c.dob))}</b></div>
                <div class="pdf-id-wide"><span>Usia</span>: <b>${c.ageYears} Thn, ${c.ageMonths} Bln, ${c.ageDays} Hr</b></div>
                <div class="pdf-id-wide"><span>Alasan Tes</span>: ${esc(c.reason) || '-'}</div>
            </div>

            <h2 class="pdf-h2">LEMBAR NILAI DETAIL KATA</h2>
            <div class="pdf-words">
                <div class="pdf-wcol">${pdfWordRows(0, 11)}</div>
                <div class="pdf-wcol">${pdfWordRows(11, 22)}</div>
            </div>
            <div class="pdf-legend-pos">
                <span class="pdf-awal">Awalan</span><span class="pdf-tengah">Pertengahan</span><span class="pdf-akhir">Akhiran</span>
            </div>
            ${foot(1)}
        </div>`;

    const page2 = `
        <div class="pdf-sheet">
            <div class="pdf-runhead"><b>TES ARTIKULASI</b><span>${esc(c.name)} · ${esc(formatDateId(c.testDate))}</span></div>

            <h2 class="pdf-h2">LEMBAR NILAI RINGKASAN KONSONAN</h2>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th rowspan="2" class="pdf-col-sound">Bunyi</th>
                        <th colspan="3">Posisi &amp; Hasil</th>
                        <th rowspan="2" class="pdf-col-notes">Kata / Catatan</th>
                    </tr>
                    <tr><th class="pdf-awal">Awal</th><th class="pdf-tengah">Tengah</th><th class="pdf-akhir">Akhir</th></tr>
                </thead>
                <tbody>${pdfMatrixRows()}</tbody>
            </table>

            <div class="pdf-legend">
                <b>B</b> Benar &nbsp;·&nbsp; <b>R</b> Diulang &nbsp;·&nbsp; <b>I</b> Imitasi/meniru &nbsp;·&nbsp; <b>S</b> Substitusi &nbsp;·&nbsp; <b>O</b> Omisi &nbsp;·&nbsp; <b>D</b> Distorsi &nbsp;·&nbsp; <b>A</b> Adisi
            </div>
            ${foot(2)}
        </div>`;

    const page3 = `
        <div class="pdf-sheet">
            <div class="pdf-runhead"><b>TES ARTIKULASI</b><span>${esc(c.name)} · ${esc(formatDateId(c.testDate))}</span></div>

            <h2 class="pdf-h2">GRAFIK NORMA PERKEMBANGAN USIA KONSONAN</h2>
            ${pdfChartHtml()}
            ${foot(3)}
        </div>`;

    return [page1, page2, page3];
}

// Render tiap halaman PDF menjadi canvas
async function renderReportCanvases() {
    const stage = document.createElement('div');
    stage.style.cssText = `position:absolute;left:0;top:0;width:${PDF_PAGE_W}px;background:#fff;z-index:-1;pointer-events:none;`;
    document.body.appendChild(stage);

    try {
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        const canvases = [];
        for (const html of buildPdfPagesHtml()) {
            stage.innerHTML = html;
            await new Promise(resolve => setTimeout(resolve, 50)); // beri waktu browser menata layout
            canvases.push(await html2canvas(stage, {
                scale: 3,
                width: PDF_PAGE_W,
                height: PDF_PAGE_H,
                windowWidth: PDF_PAGE_W,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false
            }));
        }
        return canvases;
    } finally {
        stage.remove();
    }
}

async function downloadReportPdf(btn) {
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Menyiapkan PDF';

    try {
        if (!window.html2canvas || !window.jspdf) throw new Error('Library PDF belum termuat');

        const canvases = await renderReportCanvases();
        const pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();

        // semua halaman masuk ke satu dokumen PDF
        canvases.forEach((canvas, i) => {
            if (i > 0) pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageW, pageH);
        });

        pdf.save(reportPdfFileName());
    } catch (err) {
        console.error('Gagal membuat PDF:', err);
        showDialog({
            title: 'Gagal Membuat PDF',
            message: 'PDF tidak dapat dibuat. Coba lagi, atau muat ulang halaman.',
            icon: 'fa-file-circle-xmark',
            tone: 'rose'
        });
    } finally {
        btn.disabled = false;
        btn.innerHTML = original;
    }
}
