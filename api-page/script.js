document.addEventListener('DOMContentLoaded', async () => {
    // ===== LOADING SCREEN =====
    const loadingScreen = document.getElementById("loadingScreen");
    const body = document.body;
    
    // Block scroll during loading
    body.style.overflow = 'hidden';
    body.style.height = '100vh';

    // Loading dots animation
    const loadingDots = document.querySelector(".loading-dots");
    let dotsInterval = setInterval(() => {
        loadingDots.textContent = loadingDots.textContent.length >= 3 ? 
            '.' : loadingDots.textContent + '.';
    }, 500);

    // Hide loading screen when everything is loaded
    window.addEventListener('load', () => {
        clearInterval(dotsInterval);
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            body.style.overflow = '';
            body.style.height = '';
        }, 500);
        
        // Initialize lazy loading
        lazyLoadImages();
    });

    // Fallback if load event doesn't trigger
    setTimeout(() => {
        clearInterval(dotsInterval);
        loadingScreen.style.display = 'none';
        body.style.overflow = '';
        body.style.height = '';
        lazyLoadImages();
    }, 3000);
    
    // ===== NAV TOGGLE =====
    const navToggle = document.getElementById('navToggle');
    const navDropdown = document.getElementById('navDropdown');
    
    if (navToggle && navDropdown) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            navDropdown.classList.remove('show');
        });
    }
    
    // ===== DARK MODE =====
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Check saved theme or prefer color scheme
        const savedTheme = localStorage.getItem('theme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
        }

        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // ===== LAZY LOAD IMAGES =====
    function lazyLoadImages() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        const lazyImageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    lazyImage.classList.add('loaded');
                    
                    // If the image hasn't loaded yet, force load
                    if (!lazyImage.complete) {
                        lazyImage.onload = () => {
                            lazyImage.classList.add('loaded');
                        };
                        lazyImage.onerror = () => {
                            console.error('Failed to load image:', lazyImage.src);
                        };
                    }
                    
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });
        
        lazyImages.forEach(lazyImage => {
            lazyImageObserver.observe(lazyImage);
        });
    }

    // ===== TOAST NOTIFICATION =====
    const showToast = (message, type = 'info') => {
        const toast = document.getElementById('notificationToast');
        const toastBody = toast.querySelector('.toast-body');
        const toastTitle = toast.querySelector('.toast-title');
        const toastIcon = toast.querySelector('.toast-icon');
        
        toastBody.textContent = message;
        
        // Set toast appearance based on type
        toast.style.borderLeftColor = type === 'success' 
            ? 'var(--success-color)' 
            : type === 'error' 
                ? 'var(--error-color)' 
                : 'var(--primary-color)';
        
        toastIcon.className = `toast-icon fas fa-${
            type === 'success' 
                ? 'check-circle' 
                : type === 'error' 
                    ? 'exclamation-circle' 
                    : 'info-circle'
        } me-2`;
        
        toastIcon.style.color = type === 'success' 
            ? 'var(--success-color)' 
            : type === 'error' 
                ? 'var(--error-color)' 
                : 'var(--primary-color)';
        
        toastTitle.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    };

    // Show welcome toast
    setTimeout(() => {
        showToast('Welcome to Iceflow API');
    }, 1500);

    // ===== SIDEBAR TOGGLE FOR MOBILE =====
    const menuToggle = document.querySelector('.menu-toggle');
    const sideNav = document.querySelector('.side-nav');
    
    if (menuToggle && sideNav) {
        menuToggle.addEventListener('click', () => {
            sideNav.classList.toggle('active');
        });
        
        // Close side nav when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 992 && 
                !e.target.closest('.side-nav') && 
                !e.target.closest('.menu-toggle') && 
                sideNav.classList.contains('active')) {
                sideNav.classList.remove('active');
            }
        });
    }
});