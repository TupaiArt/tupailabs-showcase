document.addEventListener('DOMContentLoaded', () => {
    const gridContainer      = document.getElementById('showcase-grid');
    const skeletonGrid       = document.getElementById('skeleton-grid');
    const errorContainer     = document.getElementById('error-message');
    const noResultsMsg       = document.getElementById('no-results');
    const loadMoreContainer  = document.getElementById('load-more-container');
    const loadMoreBtn        = document.getElementById('load-more-btn');
    const filterBar          = document.getElementById('filter-bar');

    const ITEMS_PER_PAGE = 8;
    let allData  = [];
    let filteredData = [];
    let rendered = 0;
    let currentFilter = 'All';

    // Mapping Category → CSS class
    const CATEGORY_CLASS_MAP = {
        'Retro Tech':         'cat-retro',
        'Vaporwave':          'cat-vaporwave',
        'Gradient':           'cat-gradient',
        'Glassmorphism':      'cat-glassmorphism',
        'Flat Design':        'cat-flat',
        'Isometric':          'cat-isometric',
        'Particle System':    'cat-particle',
        'Morphing':           'cat-morphing',
        'Typography':         'cat-typography',
        'Neumorphism':        'cat-neumorphism',
        'Brutalist':          'cat-brutalist',
        'Bento Grid':         'cat-bento',
        'Parallax':           'cat-parallax',
        'Micro-interaction':  'cat-micro',
        'Path Drawing':       'cat-path',
        'Line Icon':          'cat-line',
        'Duotone':            'cat-duotone',
        'Low Poly':           'cat-low-poly',
        'Memphis':            'cat-particle',
    };

    function getCategoryClass(category) {
        return CATEGORY_CLASS_MAP[category] || 'cat-default';
    }

    // 1. Fetch data dari JSON
    // Simulasi loading sebentar (500ms) supaya user bisa lihat skeleton-nya jalan
    setTimeout(() => {
        fetch('data/showcase.json')
            .then(res => {
                if (!res.ok) throw new Error('Gagal memuat JSON');
                return res.json();
            })
            .then(data => {
                allData = data;
                filteredData = data;
                
                // Matikan skeleton, tampilkan grid
                skeletonGrid.classList.add('hidden');
                gridContainer.classList.remove('hidden');
                
                generateFilters(data);
                renderBatch();
            })
            .catch(() => {
                skeletonGrid.classList.add('hidden');
                errorContainer.classList.remove('hidden');
            });
    }, 500);

    // 2. Generate Filters
    function generateFilters(data) {
        // Ambil semua kategori unik
        const categories = new Set(data.map(item => item.category));
        
        // Buat filter 'All'
        const allBtn = document.createElement('button');
        allBtn.className = 'filter-chip active';
        allBtn.textContent = 'Semua';
        allBtn.addEventListener('click', () => applyFilter('All', allBtn));
        filterBar.appendChild(allBtn);

        // Buat filter untuk tiap kategori
        Array.from(categories).sort().forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-chip';
            btn.textContent = cat;
            btn.addEventListener('click', () => applyFilter(cat, btn));
            filterBar.appendChild(btn);
        });
    }

    // 3. Filter logic
    function applyFilter(category, btnElement) {
        if (currentFilter === category) return;
        currentFilter = category;

        // Update active class di tombol filter
        document.querySelectorAll('.filter-chip').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');

        // Reset grid & state
        gridContainer.innerHTML = '';
        rendered = 0;
        noResultsMsg.classList.add('hidden');

        // Filter data
        if (category === 'All') {
            filteredData = allData;
        } else {
            filteredData = allData.filter(item => item.category === category);
        }

        if (filteredData.length === 0) {
            noResultsMsg.classList.remove('hidden');
            loadMoreContainer.classList.add('hidden');
        } else {
            renderBatch();
        }
    }

    // 4. Render satu batch card
    function renderBatch() {
        const batch = filteredData.slice(rendered, rendered + ITEMS_PER_PAGE);

        batch.forEach((item, batchIndex) => {
            const card = createCard(item, batchIndex);
            gridContainer.appendChild(card);
            loadObserver.observe(card.querySelector('video'));
        });

        rendered += batch.length;

        // Tampilkan atau sembunyikan tombol Load More
        if (rendered < filteredData.length) {
            loadMoreContainer.classList.remove('hidden');
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }

    // 5. Buat elemen card
    function createCard(item, batchIndex) {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${batchIndex * 60}ms`;

        const downloadLink = item.video.replace('_video.mp4', '.html');
        const catClass     = getCategoryClass(item.category);

        card.innerHTML = `
            <div class="video-wrapper">
                <video
                    data-src="${item.video}"
                    preload="none" muted playsinline loop
                    controlsList="nodownload" oncontextmenu="return false;"
                ></video>
                <div class="status-overlay">&#9654;</div>
            </div>
            <div class="card-content">
                <div class="card-header">
                    <div class="card-titles">
                        <h2 class="card-title">${item.title}</h2>
                        <p class="card-subtitle">${item.subtitle || item.category}</p>
                    </div>
                    <span class="category-tag ${catClass}">${item.category}</span>
                </div>
                
                <div class="card-meta">
                    <span>5s</span>
                    <span>&middot;</span>
                    <span>HTML/CSS</span>
                </div>

                <a href="${downloadLink}" download class="download-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download .html
                </a>
            </div>
        `;

        const video   = card.querySelector('video');
        const wrapper = card.querySelector('.video-wrapper');
        const overlay = card.querySelector('.status-overlay');

        video.addEventListener('error', () => {
            wrapper.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);font-size:0.85rem;">Video unavailable</div>`;
        });

        // Hover autoplay logic
        wrapper.addEventListener('mouseenter', () => {
            if (video.paused) {
                video.play().catch(err => console.log('Autoplay ditolak browser:', err));
                overlay.style.opacity = '0';
            }
        });

        wrapper.addEventListener('mouseleave', () => {
            if (!video.paused) {
                video.pause();
                overlay.style.opacity = '1';
            }
        });

        return card;
    }

    // 6. Load More button handler
    loadMoreBtn.addEventListener('click', () => {
        renderBatch();
    });

    // 7. Lazy Load Observer
    const loadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                if (!video.hasAttribute('src')) {
                    video.setAttribute('src', video.getAttribute('data-src'));
                    video.load();
                }
                observer.unobserve(video);
            }
        });
    }, { rootMargin: '0px 0px 400px 0px' });
});
