document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Inisialisasi AOS (Animasi Scroll)
    AOS.init({ 
        duration: 1000, 
        once: true,
        offset: 50
    });

    // 2. Logic Nama Tamu dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    
    if (guestName) {
        document.getElementById('guest-name').innerText = guestName;
        const formNama = document.getElementById('form-nama');
        if(formNama) formNama.value = guestName; 
    }

    // 3. Logic Buka Undangan & Play Music (FIX MOBILE VERSION)
    const btnOpen = document.getElementById('btn-open');
    const cover = document.getElementById('cover');
    const body = document.body;
    const music = document.getElementById('bg-music');
    const musicControl = document.getElementById('music-control');
    let isPlaying = false;

    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            
            // A. EKSEKUSI MUSIK DULUAN (Prioritas agar terdeteksi sebagai interaksi user)
            if (music) {
                // Pastikan volume full (karena iPhone kadang nge-mute default)
                music.volume = 1.0; 
                
                const playPromise = music.play();

                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        // SUKSES: Lagu main otomatis
                        console.log("Audio playing...");
                        isPlaying = true;
                        musicControl.style.display = 'block';
                        musicControl.classList.remove('paused');
                        musicControl.innerHTML = '<i class="bi bi-music-note-beamed"></i>';
                    })
                    .catch(error => {
                        // GAGAL: Biasanya karena settingan hemat daya / privacy browser
                        console.log("Auto-play dicegah, menunggu klik manual.");
                        isPlaying = false;
                        
                        // Tetap munculkan tombol control, tapi icon Play (Manual)
                        musicControl.style.display = 'block';
                        musicControl.classList.add('paused');
                        musicControl.innerHTML = '<i class="bi bi-play-fill"></i>';
                    });
                }
            }

            // B. BARU GESER COVER (Animasi)
            cover.style.transform = 'translateY(-100%)';
            body.classList.remove('overflow-hidden');
        });
    }

    // 4. Logic Tombol Music (Play/Pause Manual)
    if (musicControl) {
        musicControl.addEventListener('click', () => {
            if (isPlaying) {
                music.pause();
                musicControl.classList.add('paused');
                musicControl.innerHTML = '<i class="bi bi-pause-fill"></i>'; // Icon Pause
            } else {
                music.play();
                musicControl.classList.remove('paused');
                musicControl.innerHTML = '<i class="bi bi-music-note-beamed"></i>'; // Icon Note
            }
            isPlaying = !isPlaying;
        });
    }

    // 5. Logic Form Submit (Konek ke Google Sheets)
    const rsvpForm = document.getElementById('rsvpForm');
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const btnSubmit = rsvpForm.querySelector('button[type="submit"]');
            const originalText = btnSubmit.innerHTML;
            
            // Loading State
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Mengirim...';

            const data = new FormData(rsvpForm);
            
            // --- JANGAN LUPA GANTI URL GOOGLE SCRIPT DISINI ---
            const scriptURL = 'LINK_GOOGLE_SCRIPT_LU_DISINI'; 

            fetch(scriptURL, { method: 'POST', body: data })
                .then(response => {
                    alert('Alhamdulillah! Konfirmasi kehadiran berhasil terkirim. Terima kasih!');
                    rsvpForm.reset();
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = originalText;
                })
                .catch(error => {
                    alert('Pesan terkirim (Mode Demo). Setup Google Script untuk save real-time.');
                    console.error('Error:', error.message);
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = originalText;
                });
        });
    }

    // 6. Logic Countdown Timer
    const targetDate = new Date("Feb 20, 2026 08:00:00").getTime();

    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            const countdownBox = document.getElementById("countdown-box");
            if(countdownBox) countdownBox.innerHTML = "<h3 class='text-primary-custom'>Alhamdulillah Sah!</h3>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const elDays = document.getElementById("days");
        if(elDays) elDays.innerText = String(days).padStart(2, '0');
        
        const elHours = document.getElementById("hours");
        if(elHours) elHours.innerText = String(hours).padStart(2, '0');
        
        const elMinutes = document.getElementById("minutes");
        if(elMinutes) elMinutes.innerText = String(minutes).padStart(2, '0');
        
        const elSeconds = document.getElementById("seconds");
        if(elSeconds) elSeconds.innerText = String(seconds).padStart(2, '0');

    }, 1000);
});

// 7. Logic Copy No Rekening (Global Function)
function copyText(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("Nomor rekening berhasil disalin!");
    }).catch(err => {
        console.error('Gagal menyalin: ', err);
        // Fallback untuk browser lama
        alert("Gagal copy otomatis. Silakan copy manual.");
    });
}