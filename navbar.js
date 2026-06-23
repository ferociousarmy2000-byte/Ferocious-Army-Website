/**
 * Navbar Active State Manager
 * Automatically highlights the current page in the navigation
 */
document.addEventListener('DOMContentLoaded', function() {
    // ===== Mobile Hamburger Toggle =====
    const toggles = document.querySelectorAll('.nav-toggle');
    toggles.forEach((toggle) => {
        const menuId = toggle.getAttribute('aria-controls') || 'primary-navigation';
        const menu = document.getElementById(menuId) || document.querySelector('.nav-menu');
        if (!menu) return;

        // Ensure aria state matches visual state
        toggle.setAttribute('aria-expanded', toggle.getAttribute('aria-expanded') === 'true' ? 'true' : 'false');

        toggle.addEventListener('click', () => {
            const isOpen = menu.classList.contains('active');
            menu.classList.toggle('active');
            toggle.setAttribute('aria-expanded', String(!isOpen));
        });
    });

    // Close mobile menu on link click
    document.addEventListener('click', function(e) {
        const link = e.target && e.target.closest ? e.target.closest('.nav-menu a.nav-link') : null;
        if (!link) return;

        const openMenus = document.querySelectorAll('.nav-menu.active');
        openMenus.forEach((menu) => {
            menu.classList.remove('active');
        });

        const expandedToggles = document.querySelectorAll('.nav-toggle[aria-expanded="true"]');
        expandedToggles.forEach((t) => t.setAttribute('aria-expanded', 'false'));
    });

    // ===== Desktop Active State =====
    // Get current page path
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Map of pages to their corresponding nav link IDs
    // For sub-pages (vs-attack, manager-mode, head-to-head), highlight strategies
    const pageMapping = {
        'index.html': null, // Special - handled by hash or default
        'leaks.html': 'nav-leaks',
        'stratergies.html': 'nav-strategies',
        'reviews.html': 'nav-reviews',
        'vs-attack.html': 'nav-strategies',
        'manager-mode.html': 'nav-strategies',
        'head-to-head.html': 'nav-strategies'
    };
    
    // Get all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Remove active class from all links first
    navLinks.forEach(function(link) {
        link.classList.remove('active');
    });
    
    // For index.html, check URL hash or default to home
    if (currentPage === 'index.html' || currentPage === '') {
        const hash = window.location.hash;
        
        // Map hash values to nav IDs for index.html sections
        const hashMapping = {
            '#strategies': 'nav-strategies',
            '#showcase': 'nav-leaks',
            '#reviews': 'nav-reviews',
            '#hero': 'nav-home',
            '#discord': 'nav-home'
        };
        
        const activeNavId = hashMapping[hash] || 'nav-home';
        const activeLink = document.getElementById(activeNavId);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    } else {
        // For other pages, use the page mapping
        const activeNavId = pageMapping[currentPage] || 'nav-home';
        const activeLink = document.getElementById(activeNavId);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
});

// Also handle hash changes for single-page navigation
window.addEventListener('hashchange', function() {
    const hash = window.location.hash;
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Remove active class from all links
    navLinks.forEach(function(link) {
        link.classList.remove('active');
    });
    
    // Map hash values to nav IDs
    const hashMapping = {
        '#strategies': 'nav-strategies',
        '#showcase': 'nav-leaks',
        '#reviews': 'nav-reviews',
        '#hero': 'nav-home',
        '#discord': 'nav-home',
        '': 'nav-home',
        '#': 'nav-home'
    };
    
    const activeNavId = hashMapping[hash] || 'nav-home';
    const activeLink = document.getElementById(activeNavId);
    if (activeLink) {
        activeLink.classList.add('active');
    }
});

