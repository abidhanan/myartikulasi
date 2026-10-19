// --- VIEW: Persiapan & Data Peserta ---
function createPrepView() {
    const div = document.createElement('div');
    div.className = "vh-full p-4 sm:p-6 md:p-12 flex justify-center items-start bg-dots-prep";

    const nowYear = new Date().getFullYear();
    const today = todayISO();

    div.innerHTML = `
        <div class="glass-panel w-full max-w-4xl rounded-3xl p-5 pt-8 sm:p-8 sm:pt-10 shadow-2xl relative">
            <div class="absolute top-0 left-0 w-full h-3 rounded-t-[1.4rem] bg-gradient-to-r from-blue-400 via-green-400 to-amber-400"></div>

            <h2 class="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 font-poppins"><i class="fa-solid fa-clipboard-list text-amber-500 mr-3"></i>Persiapan & Data Peserta</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <!-- Daftar periksa -->
                <div class="bg-blue-50 p-5 sm:p-6 rounded-2xl border-2 border-blue-100 self-start">
                    <h3 class="text-xl font-bold text-blue-800 mb-4">Daftar Periksa Penguji</h3>
                    <div class="space-y-3">
                        <label class="check">
                            <input type="checkbox" class="check-input" checked disabled>
                            <span class="check-box"><i class="fa-solid fa-check"></i></span>
                            <span class="text-slate-700">Modul Gambar Digital Siap</span>
                        </label>
                        <label class="check">
                            <input type="checkbox" class="check-input" checked disabled>
                            <span class="check-box"><i class="fa-solid fa-check"></i></span>
                            <span class="text-slate-700">Lembar Nilai Digital Aktif</span>
                        </label>
                        <label class="check" id="micCheckContainer">
                            <input type="checkbox" id="micCheck" class="check-input">
                            <span class="check-box"><i class="fa-solid fa-check"></i></span>
                            <span class="text-slate-700 font-bold" id="micText">Klik untuk Izin Akses Mikrofon</span>
                        </label>
                    </div>
                    <div class="mt-6 p-4 bg-amber-100 text-amber-800 rounded-xl text-sm border border-amber-200">
                        <strong>Penting:</strong> Bermainlah dulu dengan anak sebelum memulai tes agar anak merasa siap dan tenang.
                    </div>
                </div>

                <!-- Form data -->
                <form id="dataForm" class="space-y-4 min-w-0" novalidate>
                    <div>
                        <label for="childName" class="block text-sm font-bold text-slate-700 mb-1.5">Nama Anak</label>
                        <input type="text" id="childName" required autocomplete="off" class="field" placeholder="Masukkan nama anak">
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <span class="block text-sm font-bold text-slate-700 mb-1.5">Jenis Kelamin</span>
                            ${selectHtml({
                                id: 'gender',
                                value: state.childData.gender,
                                options: [
                                    { value: 'L', label: 'Laki-laki (L)' },
                                    { value: 'P', label: 'Perempuan (P)' }
                                ]
                            })}
                        </div>
                        <div>
                            <label for="examinerName" class="block text-sm font-bold text-slate-700 mb-1.5">Nama Penguji</label>
                            <input type="text" id="examinerName" required autocomplete="off" class="field" placeholder="Nama penguji">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-4">
                        <div>
                            <span class="block text-sm font-bold text-slate-700 mb-1.5">Tanggal Tes</span>
                            ${datePickerHtml({ id: 'testDate', value: state.childData.testDate, yearFrom: nowYear - 5, yearTo: nowYear + 1 })}
                        </div>
                        <div>
                            <span class="block text-sm font-bold text-slate-700 mb-1.5">Tanggal Lahir Anak</span>
                            ${datePickerHtml({ id: 'dob', placeholder: 'Pilih tanggal', max: today, yearFrom: nowYear - 25, yearTo: nowYear })}
                        </div>
                    </div>

                    <div class="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-100">
                        <span class="text-sm font-bold text-emerald-700 block mb-1"><i class="fa-solid fa-cake-candles mr-1.5"></i>Usia Kronologis (Otomatis):</span>
                        <div id="ageDisplay" class="text-base font-semibold text-slate-400">Pilih tanggal lahir untuk menghitung usia</div>
                    </div>

                    <div>
                        <label for="reason" class="block text-sm font-bold text-slate-700 mb-1.5">Alasan Pengetesan</label>
                        <textarea id="reason" rows="2" class="field" placeholder="Tuliskan alasan pengetesan (opsional)"></textarea>
                    </div>

                    <button type="submit" class="w-full btn-magic mt-2 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-4 px-6 sm:px-8 rounded-xl text-lg sm:text-xl shadow-lg">
                        Mulai Tes Kartu Gambar <i class="fa-solid fa-arrow-right ml-2"></i>
                    </button>
                </form>
            </div>
        </div>
    `;

    const dobInput = div.querySelector('#dob');
    const testDateInput = div.querySelector('#testDate');
    dobInput.addEventListener('change', calculateAge);
    testDateInput.addEventListener('change', calculateAge);

    // Izin mikrofon
    const micCheck = div.querySelector('#micCheck');
    const micText = div.querySelector('#micText');
    div.querySelector('#micCheckContainer').addEventListener('click', async (e) => {
        e.preventDefault();
        if (micCheck.checked) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micCheck.checked = true;
            micText.innerText = "Mikrofon Siap";
            micText.classList.replace('text-slate-700', 'text-emerald-600');
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            showDialog({
                title: 'Mikrofon Tidak Tersedia',
                message: 'Akses mikrofon ditolak atau tidak ditemukan. Perekaman suara tidak akan berfungsi.',
                icon: 'fa-microphone-slash',
                tone: 'rose'
            });
        }
    });

    // Validasi & kirim form
    const form = div.querySelector('#dataForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = div.querySelector('#childName');
        const examinerInput = div.querySelector('#examinerName');
        const missing = [
            [nameInput, 'Nama anak'],
            [examinerInput, 'Nama penguji']
        ].find(([el]) => !el.value.trim());
        const dobTrigger = dobInput.parentElement.querySelector('.dp-trigger');

        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        if (missing) {
            missing[0].classList.add('is-invalid');
            missing[0].focus();
            await showDialog({ title: 'Data Belum Lengkap', message: `${missing[1]} wajib diisi.`, icon: 'fa-pen', tone: 'amber' });
            return;
        }
        if (!dobInput.value) {
            dobTrigger.classList.add('is-invalid');
            await showDialog({ title: 'Data Belum Lengkap', message: 'Tanggal lahir anak wajib diisi.', icon: 'fa-calendar-day', tone: 'amber' });
            return;
        }
        if (testDateInput.value < dobInput.value) {
            calculateAge();
            return;
        }

        if (!micCheck.checked) {
            const ok = await confirmDialog({
                title: 'Mikrofon Belum Aktif',
                message: 'Anda belum mengaktifkan mikrofon. Lanjutkan tanpa fitur rekam?',
                confirmText: 'Lanjutkan',
                icon: 'fa-microphone-lines-slash',
                tone: 'amber'
            });
            if (!ok) return;
        }

        calculateAge();
        state.childData.name = nameInput.value.trim();
        state.childData.gender = div.querySelector('#gender').value;
        state.childData.examiner = examinerInput.value.trim();
        state.childData.testDate = testDateInput.value;
        state.childData.dob = dobInput.value;
        state.childData.reason = div.querySelector('#reason').value;

        setView('test');
    });

    form.addEventListener('input', e => e.target.classList.remove('is-invalid'));
    dobInput.addEventListener('change', () => dobInput.parentElement.querySelector('.dp-trigger').classList.remove('is-invalid'));

    return div;
}
