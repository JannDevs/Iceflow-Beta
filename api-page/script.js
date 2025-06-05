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
        
        // Initialize API content if on API page
        if (window.location.pathname.includes('/api/')) {
            loadAPIContent();
        }
    });

    // Fallback if load event doesn't trigger
    setTimeout(() => {
        clearInterval(dotsInterval);
        loadingScreen.style.display = 'none';
        body.style.overflow = '';
        body.style.height = '';
        lazyLoadImages();
        
        if (window.location.pathname.includes('/api/')) {
            loadAPIContent();
        }
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
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        
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

    // ===== LOAD API CONTENT =====
    async function loadAPIContent() {
        const apiContent = document.getElementById('apiContent');
        if (!apiContent) return;
        
        try {
            const settingsResponse = await fetch('../src/settings.json');
            if (!settingsResponse.ok) throw new Error('Failed to load settings');
            const settings = await settingsResponse.json();
            
            if (!settings.categories || !settings.categories.length) {
                apiContent.innerHTML = `
                    <div class="no-results-message">
                        <i class="fas fa-database"></i>
                        <p>No API categories found</p>
                        <button class="btn btn-primary" onclick="location.reload()">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                `;
            } else {
                let contentHTML = '';
                
                settings.categories.forEach((category) => {
                    contentHTML += `
                        <div class="category-section">
                            <h3 class="category-header">${category.name}</h3>
                            <div class="api-items-grid">
                    `;
                    
                    category.items.forEach((item) => {
                        const status = item.status || "ACTIVE";
                        let statusClass = '';
                        
                        switch(status) {
                            case "ERROR": statusClass = "status-error"; break;
                            case "MAINTENANCE": statusClass = "status-maintenance"; break;
                            case "NEW": statusClass = "status-new"; break;
                            case "UPDATE": statusClass = "status-update"; break;
                            default: statusClass = "status-active";
                        }
                        
                        contentHTML += `
                            <div class="api-item">
                                <div class="api-card">
                                    <div class="api-info">
                                        <h4>${item.name}</h4>
                                        <p>${item.desc}</p>
                                    </div>
                                    <div class="api-actions">
                                        <button class="btn get-api-btn" data-path="${item.path}">
                                            <i class="fas fa-code"></i> GET
                                        </button>
                                        <div class="api-status ${statusClass}">
                                            <i class="fas fa-circle"></i>
                                            <span>${status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    
                    contentHTML += `
                            </div>
                        </div>
                    `;
                });
                
                apiContent.innerHTML = contentHTML;
            }
        } catch (error) {
            console.error('Error loading API content:', error);
            apiContent.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load API content. Please try again later.</p>
                </div>
            `;
        }
    }

    // ===== TOAST NOTIFICATION =====
    const showToast = (message, type = 'info') => {
        const toast = document.getElementById('notificationToast');
        if (!toast) return;
        
        const toastBody = toast.querySelector('.toast-body');
        toastBody.textContent = message;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    };

    // Show welcome toast
    setTimeout(() => {
        showToast('Welcome to Iceflow API');
    }, 1500);
});