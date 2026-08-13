document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('showcase-grid');
    const errorContainer = document.getElementById('error-message');

    // 1. Fetch data dari JSON
    fetch('data/showcase.json')
        .then(res => { 
            if (!res.ok) throw new Error('Gagal memuat JSON'); 
            return res.json(); 
        })
        .then(data => renderCards(data))
        .catch(() => errorContainer.classList.remove('hidden'));

    // 2. Fungsi merender Card ke dalam HTML
    function renderCards(data) {
        gridContainer.innerHTML = '';
        
        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // LOGIKA DOWNLOAD: 
            // Mengubah format "videos/nama_file_video.mp4" menjadi "videos/nama_file.html"
            const downloadLink = item.video.replace('_video.mp4', '.html');
            
            card.innerHTML = `
                <div class="video-wrapper">
                    <video 
                        data-src="${item.video}" 
                        preload="none" muted playsinline loop
                        controlsList="nodownload" oncontextmenu="return false;"
                    ></video>
                    <div class="status-overlay">▶</div>
                </div>
                <div class="card-content">
                    <h2 class="card-title">${item.title}</h2>
                    <p class="card-subtitle">Style Desain: ${item.category}</p>
                    
                    <!-- TOMBOL DOWNLOAD HTML -->
                    <a href="${downloadLink}" download class="download-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download Code
                    </a>
                </div>
            `;
            gridContainer.appendChild(card);

            const video = card.querySelector('video');
            const wrapper = card.querySelector('.video-wrapper');
            const overlay = card.querySelector('.status-overlay');

            // Handling error jika video gagal dimuat
            video.addEventListener('error', () => {
                wrapper.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--text-secondary);">Video unavailable</div>`;
            });

            // Logika Klik (Play/Pause)
            wrapper.addEventListener('click', () => {
                if (video.paused) {
                    // Auto-Pause: Matikan semua video lain yang sedang jalan
                    document.querySelectorAll('video').forEach(v => {
                        if (v !== video && !v.paused) {
                            v.pause();
                            // Munculkan kembali tombol play di video yang dimatikan
                            v.nextElementSibling.style.opacity = '1'; 
                        }
                    });

                    // Putar video yang diklik dan hilangkan tombol play-nya
                    video.play().catch(err => console.log("Play tertunda:", err));
                    overlay.style.opacity = '0'; 
                } else {
                    // Pause video dan munculkan tombol play-nya
                    video.pause();
                    overlay.style.opacity = '1'; 
                }
            });

            // Daftarkan video ke observer untuk keperluan Lazy Loading
            loadObserver.observe(video);
        });
    }

    // 3. Lazy Load Observer (Tukang Download Background)
    // Hanya memuat file MP4 jika digeser mendekati layar agar web tidak berat di awal
    const loadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                
                // FIX: Cek atribut 'src' secara spesifik agar tidak error di Live Server
                if (!video.hasAttribute('src')) {
                    video.setAttribute('src', video.getAttribute('data-src'));
                    video.load(); // Mulai download secara senyap
                }
                
                observer.unobserve(video); // Hentikan pemantauan jika sudah diload
            }
        });
    }, { rootMargin: "0px 0px 500px 0px" }); // Jarak 500px sebelum masuk layar
});