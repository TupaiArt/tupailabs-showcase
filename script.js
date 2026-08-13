document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('showcase-grid');
    const errorContainer = document.getElementById('error-message');

    fetch('data/showcase.json')
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(data => renderCards(data))
        .catch(() => errorContainer.classList.remove('hidden'));

    function renderCards(data) {
        gridContainer.innerHTML = '';
        
        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // data-src digunakan agar video tidak langsung didownload semua
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
                </div>
            `;
            gridContainer.appendChild(card);

            const video = card.querySelector('video');
            const wrapper = card.querySelector('.video-wrapper');
            const overlay = card.querySelector('.status-overlay');

            // Handling kalau video gagal dimuat
            video.addEventListener('error', () => {
                wrapper.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--text-secondary);">Video unavailable</div>`;
            });

            // Logika Klik (Play/Pause)
            wrapper.addEventListener('click', () => {
                if (video.paused) {
                    // Fitur Auto-Pause: Matikan semua video lain yang mungkin sedang jalan
                    document.querySelectorAll('video').forEach(v => {
                        if (v !== video && !v.paused) {
                            v.pause();
                            // Munculkan kembali tombol play di video yang baru saja dimatikan
                            v.nextElementSibling.style.opacity = '1'; 
                        }
                    });

                    // Putar video yang diklik dan sembunyikan tombol play-nya
                    video.play().catch(()=>{});
                    overlay.style.opacity = '0'; 
                } else {
                    // Pause video dan munculkan tombol play-nya
                    video.pause();
                    overlay.style.opacity = '1'; 
                }
            });

            // Daftarkan video ke observer untuk keperluan lazy loading
            loadObserver.observe(video);
        });
    }

    // Lazy Load Observer: Download file MP4 HANYA saat video digeser mendekati layar
    const loadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                if (!video.src) {
                    video.src = video.getAttribute('data-src');
                    video.load(); // Mulai download secara senyap
                }
                observer.unobserve(video); // Hentikan pemantauan jika sudah diload
            }
        });
    }, { rootMargin: "0px 0px 500px 0px" }); // Jarak 500px sebelum masuk ke layar
});