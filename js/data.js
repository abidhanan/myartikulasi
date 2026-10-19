// --- DATA & KONFIGURASI ---
const WORDS_DATA = [
    { id: 1, word: 'pohon', hint: 'Tanaman yang tumbuh besar dan banyak daunnya', emoji: '🌳', targets: [{pos: 'Awal', char: 'p'}, {pos: 'Tengah', char: 'h'}, {pos: 'Akhir', char: 'n'}] },
    { id: 2, word: 'kapal', hint: 'Salah satu transportasi air, dapat pengangkut penumpang dan barang di laut atau di sungai', emoji: '🚢', targets: [{pos: 'Awal', char: 'k'}, {pos: 'Tengah', char: 'p'}, {pos: 'Akhir', char: 'l'}] },
    { id: 3, word: 'asap', hint: 'Uap putih pekat yang dihasilkan dari pembakaran, biasanya berbau', emoji: '💨', targets: [{pos: 'Tengah', char: 's'}, {pos: 'Akhir', char: 'p'}] },
    { id: 4, word: 'motor', hint: 'Kendaraan berroda dua yang menggunakan bahan bakar', emoji: '🏍️', targets: [{pos: 'Awal', char: 'm'}, {pos: 'Tengah', char: 't'}, {pos: 'Akhir', char: 'r'}] },
    { id: 5, word: 'tomat', hint: 'Buah/sayur yang memiliki warna merah menarik serta kaya akan vitamin C', emoji: '🍅', targets: [{pos: 'Awal', char: 't'}, {pos: 'Tengah', char: 'm'}, {pos: 'Akhir', char: 't'}] },
    { id: 6, word: 'ayam', hint: 'Hewan unggas berkaki dua', emoji: '🐔', targets: [{pos: 'Tengah', char: 'y'}, {pos: 'Akhir', char: 'm'}] },
    { id: 7, word: 'hati', hint: 'Organ tubuh manusia yang dilambangkan dengan rasa cinta', emoji: '❤️', targets: [{pos: 'Awal', char: 'h'}, {pos: 'Tengah', char: 't'}] },
    { id: 8, word: 'rumah', hint: 'Bangunan yang dijadikan tempat tinggal dan tempat berlindung', emoji: '🏠', targets: [{pos: 'Awal', char: 'r'}, {pos: 'Tengah', char: 'm'}, {pos: 'Akhir', char: 'h'}] },
    { id: 9, word: 'nanas', hint: 'Buah tropis yang berwarna kuning dengan ciri-ciri kulit bergerigi, rasanya asam segar, dan terdapat daun seperti mahkota diatasnya', emoji: '🍍', targets: [{pos: 'Awal', char: 'n'}, {pos: 'Tengah', char: 'n'}, {pos: 'Akhir', char: 's'}] },
    { id: 10, word: 'wajik', hint: 'Hidangan tradisional khas adat Jawa yang terbuat dari bahan dasar beras ketan', emoji: '🟩', targets: [{pos: 'Awal', char: 'w'}, {pos: 'Tengah', char: 'j'}, {pos: 'Akhir', char: 'k'}] },
    { id: 11, word: 'awan', hint: 'Gumpalan putih di atas langit yang dapat mengeluarkan air hujan', emoji: '☁️', targets: [{pos: 'Tengah', char: 'w'}, {pos: 'Akhir', char: 'n'}] },
    { id: 12, word: 'bibir', hint: 'Bagian tubuh yang terlihat di mulut manusia', emoji: '👄', targets: [{pos: 'Awal', char: 'b'}, {pos: 'Tengah', char: 'b'}, {pos: 'Akhir', char: 'r'}] },
    { id: 13, word: 'buku', hint: 'Kumpulan lembaran kertas yang berisikan tulisan atau kosong', emoji: '📖', targets: [{pos: 'Awal', char: 'b'}, {pos: 'Tengah', char: 'k'}] },
    { id: 14, word: 'gelas', hint: 'Perlengkapan makan yang digunakan untuk minum', emoji: '🥛', targets: [{pos: 'Awal', char: 'g'}, {pos: 'Tengah', char: 'l'}, {pos: 'Akhir', char: 's'}] },
    { id: 15, word: 'jilbab', hint: 'Penutup kepala yang dipakai Perempuan muslim', emoji: '🧕', targets: [{pos: 'Awal', char: 'j'}, {pos: 'Tengah', char: 'l'}, {pos: 'Akhir', char: 'b'}] },
    { id: 16, word: 'jagung', hint: 'Tanaman biji-bijian berkarbohidrat yang berwarna kuning', emoji: '🌽', targets: [{pos: 'Awal', char: 'j'}, {pos: 'Tengah', char: 'g'}, {pos: 'Akhir', char: 'ng'}] },
    { id: 17, word: 'dadu', hint: 'Objek kecil yang berbentuk kubus biasa digunakan untuk bermain monopoli', emoji: '🎲', targets: [{pos: 'Awal', char: 'd'}, {pos: 'Tengah', char: 'd'}] },
    { id: 18, word: 'singa', hint: 'Hewan buas yang memiliki surai, biasa disebut dengan raja hutan', emoji: '🦁', targets: [{pos: 'Awal', char: 's'}, {pos: 'Tengah', char: 'ng'}] },
    { id: 19, word: 'yoyo', hint: 'Permainan berbentuk bulat yang dikelilingi tali di dalamnya', emoji: '🪀', targets: [{pos: 'Awal', char: 'y'}, {pos: 'Tengah', char: 'y'}] },
    { id: 20, word: 'piring', hint: 'Alat makan berbentuk lingkaran pipih digunakan untuk wadah nasi dan lauk pauk', emoji: '🍽️', targets: [{pos: 'Awal', char: 'p'}, {pos: 'Tengah', char: 'r'}, {pos: 'Akhir', char: 'ng'}] },
    { id: 21, word: 'lilin', hint: 'Sumber penerangan yang cara penggunaannya dengan membakar sumbunya', emoji: '🕯️', targets: [{pos: 'Awal', char: 'l'}, {pos: 'Tengah', char: 'l'}, {pos: 'Akhir', char: 'n'}] },
    { id: 22, word: 'cicak', hint: 'Hewan yang menempel di dinding', emoji: '🦎', targets: [{pos: 'Awal', char: 'c'}, {pos: 'Tengah', char: 'c'}, {pos: 'Akhir', char: 'k'}] },
];

const CONSONANT_LIST = ['p', 'g', 's', 'm', 'd', 'c', 'h', 't', 'j', 'n', 'ng', 'w', 'y', 'b', 'r', 'k', 'l'];

// Pemetaan Lembar Nilai 2/2: dibangun otomatis dari target tiap kata,
// sehingga setiap bunyi di posisi awal/tengah/akhir selalu sesuai dengan WORDS_DATA.
const CONSONANT_MATRIX = (() => {
    const matrix = {};
    CONSONANT_LIST.forEach(c => { matrix[c] = { awal: [], tengah: [], akhir: [] }; });
    WORDS_DATA.forEach(w => {
        w.targets.forEach(t => {
            if (matrix[t.char]) matrix[t.char][t.pos.toLowerCase()].push(w.id);
        });
    });
    return matrix;
})();
const SCORE_CODES = ['B', 'R', 'I', 'S', 'O', 'D', 'A'];
const SCORE_TITLES = { B: 'Benar', R: 'Diulang', I: 'Imitasi', S: 'Substitusi', O: 'Omisi', D: 'Distorsi', A: 'Adisi' };

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const WEEKDAYS_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

// Norma usia penguasaan konsonan (rentang 2-8 tahun), dipakai grafik di layar dan di PDF
const NORM_DATA = [
    { sound: 'p, m, h, n, w', start: 2.5, end: 3.5, color: 'bg-emerald-400', hex: '#34d399' },
    { sound: 'b', start: 3, end: 4, color: 'bg-teal-400', hex: '#2dd4bf' },
    { sound: 'k, g, d', start: 3.5, end: 4.5, color: 'bg-cyan-400', hex: '#22d3ee' },
    { sound: 't, ng, y', start: 4, end: 5, color: 'bg-blue-400', hex: '#60a5fa' },
    { sound: 'f, r, l', start: 5, end: 6.5, color: 'bg-indigo-400', hex: '#818cf8' },
    { sound: 's, c, j', start: 5.5, end: 7.5, color: 'bg-violet-400', hex: '#a78bfa' },
    { sound: 'z, v, th', start: 6, end: 8, color: 'bg-fuchsia-400', hex: '#e879f9' }
];
const NORM_MIN_AGE = 2;
const NORM_SPAN = 6;
