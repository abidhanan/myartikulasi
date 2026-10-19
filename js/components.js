// --- KOMPONEN FORM: Select, Date Picker, Dialog ---
// Semua komponen memakai event delegation di document, jadi tetap berfungsi
// walaupun view dirender ulang.

// ---------- Select kustom ----------
function selectHtml({ id = '', options, value = '', placeholder = 'Pilih...', small = false, attrs = '' }) {
    const selected = options.find(o => o.value === value);
    return `
        <div class="sel" data-select data-placeholder="${esc(placeholder)}">
            <input type="hidden" ${id ? `id="${id}"` : ''} value="${esc(value)}" ${attrs}>
            <button type="button" class="field ${small ? 'field-sm' : ''} sel-trigger" aria-haspopup="listbox" aria-expanded="false">
                <span class="sel-label ${selected ? '' : 'is-placeholder'}">${esc(selected ? selected.label : placeholder)}</span>
                <i class="fa-solid fa-chevron-down chev"></i>
            </button>
            <ul class="pop sel-menu" role="listbox" tabindex="-1">
                ${options.map(o => `
                    <li class="sel-opt ${o.value === value ? 'is-selected' : ''}" role="option" data-value="${esc(o.value)}" aria-selected="${o.value === value}">
                        <span>${esc(o.label)}</span><i class="fa-solid fa-check sel-check"></i>
                    </li>`).join('')}
            </ul>
        </div>`;
}

function setSelectValue(root, value) {
    const input = root.querySelector('input[type="hidden"]');
    const label = root.querySelector('.sel-label');
    let found = null;
    root.querySelectorAll('.sel-opt').forEach(opt => {
        const on = opt.dataset.value === value;
        opt.classList.toggle('is-selected', on);
        opt.setAttribute('aria-selected', on);
        if (on) found = opt;
    });
    input.value = value;
    label.textContent = found ? found.querySelector('span').textContent : root.dataset.placeholder;
    label.classList.toggle('is-placeholder', !found);
}

function setActiveOption(root, index) {
    const opts = [...root.querySelectorAll('.sel-opt')];
    opts.forEach((o, i) => o.classList.toggle('is-active', i === index));
    if (opts[index]) opts[index].scrollIntoView({ block: 'nearest' });
}

// ---------- Popup (buka / tutup / posisi) ----------
function placePop(pop) {
    pop.classList.remove('up');
    pop.style.left = '0px';
    const host = pop.parentElement.getBoundingClientRect();
    const w = pop.offsetWidth, h = pop.offsetHeight;

    // jaga agar tidak keluar dari layar kiri/kanan
    let left = 0;
    if (host.left + w > window.innerWidth - 8) left = window.innerWidth - 8 - w - host.left;
    if (host.left + left < 8) left = 8 - host.left;
    pop.style.left = `${left}px`;

    // buka ke atas jika di bawah tidak cukup ruang
    const below = window.innerHeight - host.bottom;
    if (h + 16 > below && host.top > below) pop.classList.add('up');
}

function openPop(root) {
    closeAllPops(root);
    root.classList.add('open');
    root.querySelector('.field').setAttribute('aria-expanded', 'true');

    if (root.matches('[data-dp]')) renderCalendar(root, true);
    placePop(root.querySelector(':scope > .pop'));

    if (root.matches('[data-select]')) {
        const opts = [...root.querySelectorAll('.sel-opt')];
        const idx = opts.findIndex(o => o.classList.contains('is-selected'));
        setActiveOption(root, idx);
    }
}

function closePop(root) {
    root.classList.remove('open');
    root.querySelector('.field, .ap-menu-btn')?.setAttribute('aria-expanded', 'false');
}

// tutup semua popup yang tidak berkaitan dengan elemen `keep`
function closeAllPops(keep) {
    document.querySelectorAll('.sel.open, .dp.open, .ap-more.open').forEach(root => {
        if (root !== keep && !root.contains(keep)) closePop(root);
    });
}

function chooseOption(root, opt) {
    const input = root.querySelector('input[type="hidden"]');
    const value = opt.dataset.value;
    const changed = input.value !== value;
    setSelectValue(root, value);
    closePop(root);
    root.querySelector('.sel-trigger').focus({ preventScroll: true });
    if (changed) input.dispatchEvent(new Event('change', { bubbles: true }));
}

// ---------- Date picker kustom ----------
function datePickerHtml({ id, value = '', placeholder = 'Pilih tanggal', min = '', max = '', yearFrom, yearTo }) {
    const nowYear = new Date().getFullYear();
    return `
        <div class="dp" data-dp data-min="${min}" data-max="${max}"
             data-year-from="${yearFrom ?? nowYear - 20}" data-year-to="${yearTo ?? nowYear + 1}">
            <input type="hidden" id="${id}" value="${value}">
            <button type="button" class="field dp-trigger" aria-haspopup="dialog" aria-expanded="false">
                <i class="fa-regular fa-calendar text-emerald-500 shrink-0"></i>
                <span class="dp-label ${value ? '' : 'is-placeholder'}">${value ? formatDateShort(value) : esc(placeholder)}</span>
                <i class="fa-solid fa-chevron-down chev"></i>
            </button>
            <div class="pop dp-panel" role="dialog" aria-label="Pilih tanggal"></div>
        </div>`;
}

function setDateValue(root, iso) {
    const input = root.querySelector('input[type="hidden"]');
    const label = root.querySelector('.dp-label');
    const changed = input.value !== iso;
    input.value = iso;
    label.textContent = iso ? formatDateShort(iso) : root.dataset.placeholder || 'Pilih tanggal';
    label.classList.toggle('is-placeholder', !iso);
    if (changed) input.dispatchEvent(new Event('change', { bubbles: true }));
}

function renderCalendar(root, reset = false) {
    const input = root.querySelector('input[type="hidden"]');
    const { min, max } = root.dataset;

    if (reset || root.dataset.vy === undefined) {
        let base = input.value || todayISO();
        if (!input.value && max && base > max) base = max;
        if (!input.value && min && base < min) base = min;
        const { y, m } = parseISO(base);
        root.dataset.vy = y;
        root.dataset.vm = m;
    }

    const vy = +root.dataset.vy, vm = +root.dataset.vm;
    const yearFrom = Math.min(+root.dataset.yearFrom, vy);
    const yearTo = Math.max(+root.dataset.yearTo, vy);
    const years = [];
    for (let y = yearFrom; y <= yearTo; y++) years.push({ value: String(y), label: String(y) });
    const months = MONTHS_ID.map((label, i) => ({ value: String(i), label }));

    const today = todayISO();
    const offset = (new Date(vy, vm, 1).getDay() + 6) % 7; // pekan mulai hari Senin
    const daysInMonth = new Date(vy, vm + 1, 0).getDate();

    let cells = '';
    for (let i = 0; i < offset; i++) cells += '<span></span>';
    for (let d = 1; d <= daysInMonth; d++) {
        const iso = toISO(vy, vm, d);
        const disabled = (min && iso < min) || (max && iso > max);
        const cls = ['dp-day', iso === input.value ? 'is-selected' : '', iso === today ? 'is-today' : ''].join(' ');
        cells += `<button type="button" class="${cls}" data-date="${iso}" ${disabled ? 'disabled' : ''}>${d}</button>`;
    }

    const todayOk = !(min && today < min) && !(max && today > max);

    root.querySelector('.dp-panel').innerHTML = `
        <div class="dp-head">
            <button type="button" class="dp-nav" data-dir="-1" aria-label="Bulan sebelumnya"><i class="fa-solid fa-chevron-left"></i></button>
            <div class="flex-1 min-w-0">${selectHtml({ options: months, value: String(vm), small: true, attrs: 'data-role="month"' })}</div>
            <div class="w-[5.5rem] shrink-0">${selectHtml({ options: years, value: String(vy), small: true, attrs: 'data-role="year"' })}</div>
            <button type="button" class="dp-nav" data-dir="1" aria-label="Bulan berikutnya"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
        <div class="dp-grid">
            ${WEEKDAYS_ID.map(d => `<div class="dp-wd">${d}</div>`).join('')}
            ${cells}
        </div>
        <div class="dp-foot">
            ${todayOk ? '<button type="button" class="dp-link" data-action="today">Hari ini</button>' : '<span></span>'}
            ${input.value ? '<button type="button" class="dp-link !text-rose-500" data-action="clear">Hapus</button>' : ''}
        </div>`;
}

function shiftCalendar(root, dir) {
    let y = +root.dataset.vy, m = +root.dataset.vm + dir;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    root.dataset.vy = y;
    root.dataset.vm = m;
    renderCalendar(root);
}

// ---------- Dialog (pengganti alert / confirm) ----------
const DIALOG_TONES = {
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600'
};

function showDialog({ title, message, confirmText = 'Oke', cancelText = '', icon = 'fa-circle-info', tone = 'emerald' }) {
    return new Promise(resolve => {
        const prevFocus = document.activeElement;
        const el = document.createElement('div');
        el.className = 'dlg-overlay';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.innerHTML = `
            <div class="dlg-box">
                <div class="mx-auto mb-4 w-14 h-14 rounded-2xl grid place-items-center text-2xl ${DIALOG_TONES[tone] || DIALOG_TONES.emerald}">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <h3 class="font-poppins font-bold text-xl text-slate-800 mb-2">${esc(title)}</h3>
                <p class="text-slate-600 leading-relaxed">${esc(message)}</p>
                <div class="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-center">
                    ${cancelText ? `<button type="button" data-act="cancel" class="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">${esc(cancelText)}</button>` : ''}
                    <button type="button" data-act="ok" class="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 shadow-md transition">${esc(confirmText)}</button>
                </div>
            </div>`;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('show'));
        el.querySelector('[data-act="ok"]').focus();

        const finish = result => {
            document.removeEventListener('keydown', onKey, true);
            el.classList.remove('show');
            setTimeout(() => el.remove(), 200);
            prevFocus?.focus?.({ preventScroll: true });
            resolve(result);
        };
        const onKey = e => {
            if (e.key === 'Escape') { e.stopPropagation(); finish(false); }
        };
        document.addEventListener('keydown', onKey, true);
        el.addEventListener('click', e => {
            const act = e.target.closest('[data-act]')?.dataset.act;
            if (act === 'ok') finish(true);
            else if (act === 'cancel' || e.target === el) finish(false);
        });
    });
}

function confirmDialog(opts) {
    return showDialog({ cancelText: 'Batal', ...opts });
}

// ---------- Event delegation global ----------
document.addEventListener('click', e => {
    const t = e.target;

    const trigger = t.closest('.sel-trigger, .dp-trigger');
    if (trigger) {
        const root = trigger.parentElement;
        root.classList.contains('open') ? closePop(root) : openPop(root);
        return;
    }

    const opt = t.closest('.sel-opt');
    if (opt) { chooseOption(opt.closest('[data-select]'), opt); return; }

    const dp = t.closest('[data-dp]');
    if (dp) {
        const day = t.closest('.dp-day');
        if (day && !day.disabled) {
            setDateValue(dp, day.dataset.date);
            closePop(dp);
            dp.querySelector('.dp-trigger').focus({ preventScroll: true });
            return;
        }
        const nav = t.closest('.dp-nav');
        if (nav) { shiftCalendar(dp, +nav.dataset.dir); return; }
        const action = t.closest('[data-action]')?.dataset.action;
        if (action === 'today') { setDateValue(dp, todayISO()); closePop(dp); return; }
        if (action === 'clear') { setDateValue(dp, ''); closePop(dp); return; }
        return; // klik di area kosong kalender: tetap terbuka
    }

    closeAllPops(t);
});

// Pilihan bulan / tahun di dalam kalender
document.addEventListener('change', e => {
    const role = e.target.dataset?.role;
    const dp = e.target.closest?.('[data-dp]');
    if (!role || !dp) return;
    if (role === 'month') dp.dataset.vm = e.target.value;
    if (role === 'year') dp.dataset.vy = e.target.value;
    renderCalendar(dp);
});

// Navigasi keyboard
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const open = document.querySelector('.sel.open, .dp.open, .ap-more.open');
        if (open) {
            closeAllPops(null);
            open.querySelector('.field')?.focus({ preventScroll: true });
        }
        return;
    }

    const root = e.target.closest?.('[data-select]');
    if (!root) return;

    const isOpen = root.classList.contains('open');
    const opts = [...root.querySelectorAll('.sel-opt')];
    const idx = opts.findIndex(o => o.classList.contains('is-active'));

    switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp': {
            e.preventDefault();
            if (!isOpen) { openPop(root); return; }
            const next = e.key === 'ArrowDown' ? Math.min(idx + 1, opts.length - 1) : Math.max(idx - 1, 0);
            setActiveOption(root, next);
            break;
        }
        case 'Home':
        case 'End':
            if (!isOpen) return;
            e.preventDefault();
            setActiveOption(root, e.key === 'Home' ? 0 : opts.length - 1);
            break;
        case 'Enter':
        case ' ':
            if (isOpen && idx >= 0) {
                e.preventDefault();
                // cegah klik susulan dari tombol saat tombol Spasi dilepas
                root.addEventListener('keyup', ev => ev.preventDefault(), { once: true });
                chooseOption(root, opts[idx]);
            }
            break;
        case 'Tab':
            if (isOpen) closePop(root);
            break;
    }
});

// Reposisi popup yang terbuka saat layar diputar / diubah ukurannya
window.addEventListener('resize', () => {
    document.querySelectorAll('.sel.open > .pop, .dp.open > .pop, .ap-more.open > .pop').forEach(placePop);
});

// ---------- Pemutar audio kustom (dengan menu titik tiga: Unduh & Kecepatan) ----------
const AUDIO_SPEEDS = [1, 1.25, 1.5, 2];

function audioPlayerHtml({ url, fileName }) {
    return `
        <div class="ap" data-audio-player data-filename="${esc(fileName)}">
            <audio src="${url}" preload="metadata"></audio>
            <button type="button" class="ap-play" data-ap="play" aria-label="Putar"><i class="fa-solid fa-play"></i></button>
            <span class="ap-time"><span data-ap-cur>0:00</span> / <span data-ap-dur>0:00</span></span>
            <input type="range" class="ap-seek" min="0" max="1000" value="0" step="1" aria-label="Posisi audio">
            <div class="ap-more">
                <button type="button" class="ap-menu-btn" data-ap="menu" aria-haspopup="menu" aria-expanded="false" aria-label="Menu lainnya"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                <div class="pop ap-menu" role="menu">
                    <button type="button" class="ap-item" data-ap="download" role="menuitem"><i class="fa-solid fa-download"></i>Unduh</button>
                    <button type="button" class="ap-item" data-ap="speed" role="menuitem"><i class="fa-solid fa-gauge-high"></i>Kecepatan: <b data-ap-speed>1x</b></button>
                </div>
            </div>
        </div>`;
}

function formatAudioTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    return `${Math.floor(sec / 60)}:${pad2(Math.floor(sec % 60))}`;
}

function syncAudioPlayer(player) {
    const audio = player.querySelector('audio');
    const dur = isFinite(audio.duration) ? audio.duration : 0;
    player.querySelector('[data-ap-cur]').textContent = formatAudioTime(audio.currentTime);
    player.querySelector('[data-ap-dur]').textContent = formatAudioTime(dur);
    const seek = player.querySelector('.ap-seek');
    seek.value = dur ? Math.round((audio.currentTime / dur) * 1000) : 0;
    seek.style.setProperty('--fill', `${seek.value / 10}%`);
}

// Event media tidak bubble, jadi didengarkan lewat fase capture
['loadedmetadata', 'durationchange', 'timeupdate'].forEach(type => {
    document.addEventListener(type, e => {
        const player = e.target.closest?.('[data-audio-player]');
        if (player) syncAudioPlayer(player);
    }, true);
});
['play', 'pause', 'ended'].forEach(type => {
    document.addEventListener(type, e => {
        const player = e.target.closest?.('[data-audio-player]');
        if (!player) return;
        const playing = !e.target.paused && !e.target.ended;
        player.querySelector('.ap-play i').className = `fa-solid ${playing ? 'fa-pause' : 'fa-play'}`;
        player.querySelector('.ap-play').setAttribute('aria-label', playing ? 'Jeda' : 'Putar');
        if (type === 'play') {
            // hanya satu rekaman yang diputar pada satu waktu
            document.querySelectorAll('[data-audio-player] audio').forEach(a => { if (a !== e.target) a.pause(); });
        }
    }, true);
});

document.addEventListener('input', e => {
    if (!e.target.matches?.('.ap-seek')) return;
    const player = e.target.closest('[data-audio-player]');
    const audio = player.querySelector('audio');
    if (isFinite(audio.duration)) audio.currentTime = (e.target.value / 1000) * audio.duration;
    syncAudioPlayer(player);
});

document.addEventListener('click', e => {
    const btn = e.target.closest?.('[data-ap]');
    if (!btn) return;
    const player = btn.closest('[data-audio-player]');
    const audio = player.querySelector('audio');
    const more = player.querySelector('.ap-more');

    switch (btn.dataset.ap) {
        case 'play':
            audio.paused || audio.ended ? audio.play() : audio.pause();
            break;
        case 'menu':
            if (more.classList.contains('open')) {
                more.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            } else {
                closeAllPops(more);
                more.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
                placePop(more.querySelector('.pop'));
            }
            break;
        case 'download': {
            // File asli (blob MP3) diunduh dengan nama sesuai data peserta
            const a = document.createElement('a');
            a.href = audio.currentSrc || audio.src;
            a.download = player.dataset.filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            more.classList.remove('open');
            break;
        }
        case 'speed': {
            const next = AUDIO_SPEEDS[(AUDIO_SPEEDS.indexOf(audio.playbackRate) + 1) % AUDIO_SPEEDS.length];
            audio.playbackRate = next;
            player.querySelector('[data-ap-speed]').textContent = `${next}x`;
            break;
        }
    }
});
