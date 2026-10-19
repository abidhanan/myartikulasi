// --- INISIALISASI ---
window.addEventListener('DOMContentLoaded', () => {
    initTestResults();
    render();
});

// Bersihkan Service Worker & cache rekaman dari versi sebelumnya (sudah tidak dipakai)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
        .then(regs => regs.forEach(reg => reg.unregister()))
        .catch(() => {});
}
if (window.caches) caches.delete('rec-v1');
