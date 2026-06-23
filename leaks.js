/**
 * Leaks Gallery - Dynamic Image Loading
 * Automatically loads the latest 4 images from the Leaks folder
 * Sorted by date (newest first) based on filename timestamps
 */

// Leaks folder path
const LEAKS_FOLDER = 'Leaks/';

// IMPORTANT:
// Static websites cannot read local folder contents automatically.
// To make "add/remove leak" work reliably, update this manifest.
// leaks.js will always show the latest 4 based on filename date parsing.
const leakImages = [
    // Newest 4 (added to Leaks folder)
    { filename: 'Screenshot_2026-06-17-19-52-39-24_0b2fce7a16bf2b728d6ffa28c8d60efb.jpg', date: '2026-06-17' },
    { filename: 'Screenshot_20260616-202047.png', date: '2026-06-16' },
    { filename: 'IMG_1933.png', date: '2026-06-16' },
    { filename: 'image.jpg', date: '2026-06-16' },

    // Older leaks
    { filename: 'Screenshot_2026-04-30-11-36-34-60_40deb401b9ffe8e1df2f1cc5ba480b12.png', date: '2026-04-30' },
    { filename: 'Screenshot_20260429_003335.jpg', date: '2026-04-29' },
    { filename: 'Screenshot_2026-04-25_095858.png', date: '2026-04-25' },
    { filename: 'Screenshot_2026-04-24-13-33-53-107_com.twitter.android-edit.jpg', date: '2026-04-24' }
];

// Force ordering for the first 4 slots (some filenames don't match parse patterns)
const LEAKS_MANUAL_ORDER_TOP4 = [
    'Screenshot_2026-06-17-19-52-39-24_0b2fce7a16bf2b728d6ffa28c8d60efb.jpg',
    'Screenshot_20260616-202047.png',
    'IMG_1933.png',
    'image.jpg'
];


/**
 * Parse date from filename for sorting
 * Handles various filename formats:
 * - Screenshot_2026-04-30-11-36-34-60_... (ISO format with dashes)
 * - Screenshot_20260429_003335 (compact format)
 * - Screenshot_2026_0425_095858 (underscore format)
 */
function parseDateFromFilename(filename) {
    if (!filename) return new Date(2000, 0, 1);

    // Try to extract date from filename
    // Format 1: Screenshot_2026-04-30-11-36-34-60_...
    let match = filename.match(/Screenshot_(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
        return new Date(match[1], match[2], match[3]);
    }

    // Format 2: Screenshot_20260429_003335
    match = filename.match(/Screenshot_(\d{4})(\d{2})(\d{2})/);
    if (match) {
        return new Date(match[1], match[2], match[3]);
    }

    // Format 3: Screenshot_2026_0425_095858
    match = filename.match(/Screenshot_(\d{4})_(\d{2})(\d{2})/);
    if (match) {
        return new Date(match[1], match[2], match[3]);
    }

    // Fallback: if file is one of our known non-Screenshot names, still rank it by the `date` manifest
    // (date is handled in getLatestLeaks fallback below). Here, default to very old.
    return new Date(2000, 0, 1);
}

/**
 * Sort images by date (newest first)
 * Uses filename parsing first; falls back to the `date` field from our manifest.
 */
function sortByDate(images) {
    return images.sort((a, b) => {
        const dateA = parseDateFromFilename(a.filename);
        const dateB = parseDateFromFilename(b.filename);

        // If parsing fails (returns 2000-01-01), fall back to the manifest `date` field.
        const fallbackA = (a.date != null && a.date !== '') ? new Date(String(a.date) + '-01-01') : null;
        const fallbackB = (b.date != null && b.date !== '') ? new Date(String(b.date) + '-01-01') : null;

        const finalA = (dateA && dateA.getFullYear() !== 2000) ? dateA : (fallbackA || dateA);
        const finalB = (dateB && dateB.getFullYear() !== 2000) ? dateB : (fallbackB || dateB);

        return finalB - finalA; // Descending order (newest first)
    });
}

/**
 * Get the latest 4 images
 * This is the algorithm: always show the 4 most recent images
 * When a new image is added, it automatically appears first
 * The oldest of the 4 is removed when a new one is added
 */
function getLatestLeaks(maxCount = 4) {
    // If we have a manual order for the newest 4, use it to guarantee they appear.
    if (maxCount === 4 && Array.isArray(LEAKS_MANUAL_ORDER_TOP4) && LEAKS_MANUAL_ORDER_TOP4.length >= 4) {
        const map = new Map(leakImages.map(i => [i.filename, i]));
        const ordered = LEAKS_MANUAL_ORDER_TOP4.map(fn => map.get(fn)).filter(Boolean);
        if (ordered.length === 4) return ordered;
    }

    const sorted = sortByDate([...leakImages]);
    return sorted.slice(0, maxCount);
}

/**
 * Render leak image card
 */
function renderLeakCard(image, index) {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open leak ${index + 1} (${image.date})`);

    const img = document.createElement('img');
    const fullSrc = LEAKS_FOLDER + image.filename;
    img.src = fullSrc;
    img.alt = `Leak ${index + 1} - ${image.date}`;
    img.loading = 'lazy';

    // store src for lightbox
    card.dataset.fullSrc = fullSrc;
    card.dataset.index = String(index);

    card.appendChild(img);
    return card;
}


/**
 * Initialize the leaks gallery
 */
function initLeaksGallery() {
    const grid = document.getElementById('leaksGrid');
    if (!grid) {
        console.error('Leaks grid container not found!');
        return;
    }
    
    // Get latest 4 leaks
    const latestLeaks = getLatestLeaks(4);
    
    // Clear existing content
    grid.innerHTML = '';
    
    // Render each image
    latestLeaks.forEach((image, index) => {
        const card = renderLeakCard(image, index);
        grid.appendChild(card);
    });
    
    console.log(`Loaded ${latestLeaks.length} leak images`);
}

function setupLeakLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    if (!lightbox || !lightboxImg) {
        return;
    }

    const leakCards = () => Array.from(document.querySelectorAll('#leaksGrid .image-card'));

    let currentIndex = -1;
    let currentImages = [];

    const openByIndex = (idx) => {
        const imgs = currentImages;
        if (!imgs.length) return;
        const safeIdx = (idx + imgs.length) % imgs.length;
        currentIndex = safeIdx;

        const fullSrc = imgs[safeIdx].dataset.fullSrc;
        if (!fullSrc) return;

        lightboxImg.src = fullSrc;
        lightboxImg.alt = imgs[safeIdx].querySelector('img')?.alt || 'Full size leak image';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const syncImages = () => {
        currentImages = leakCards().filter(c => c.dataset && c.dataset.fullSrc);
    };

    // open on card click / keyboard
    const grid = document.getElementById('leaksGrid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const card = e.target && e.target.closest ? e.target.closest('.image-card') : null;
            if (!card) return;
            syncImages();
            const idx = currentImages.indexOf(card);
            if (idx >= 0) openByIndex(idx);
        });

        grid.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const card = e.target && e.target.closest ? e.target.closest('.image-card') : null;
            if (!card) return;
            e.preventDefault();
            syncImages();
            const idx = currentImages.indexOf(card);
            if (idx >= 0) openByIndex(idx);
        });
    }

    const close = () => {
        lightbox.classList.remove('active');
        lightboxImg.src = '';
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', close);

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            syncImages();
            if (currentIndex === -1) currentIndex = 0;
            openByIndex(currentIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            syncImages();
            if (currentIndex === -1) currentIndex = 0;
            openByIndex(currentIndex + 1);
        });
    }

    // close when clicking backdrop (but not the image itself)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') {
            syncImages();
            openByIndex(currentIndex - 1);
        }
        if (e.key === 'ArrowRight') {
            syncImages();
            openByIndex(currentIndex + 1);
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initLeaksGallery();
    setupLeakLightbox();

    // Helpful debug if click doesn't work for any reason
    const grid = document.getElementById('leaksGrid');
    if (grid) grid.dataset.leaksInitialized = 'true';
});


