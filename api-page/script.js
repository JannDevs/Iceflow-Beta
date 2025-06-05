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
            setupAPISearch();
        }
        
        // Initialize docs page
        if (window.location.pathname.includes('/docs/')) {
            setupCopyButtons();
        }
        
        // Initialize stats page
        if (window.location.pathname.includes('/stats/')) {
            initStatsPage();
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
            setupAPISearch();
        }
        
        if (window.location.pathname.includes('/docs/')) {
            setupCopyButtons();
        }
        
        if (window.location.pathname.includes('/stats/')) {
            initStatsPage();
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
                settings.categories.forEach((category, categoryIndex) => {
                    const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));
                    
                    const categoryElement = document.createElement('div');
                    categoryElement.className = 'category-section';
                    categoryElement.style.animationDelay = `${categoryIndex * 0.2}s`;
                    categoryElement.dataset.category = category.name.toLowerCase().replace(/\s+/g, '-');
                    
                    const categoryHeader = document.createElement('h3');
                    categoryHeader.className = 'category-header';
                    categoryHeader.textContent = category.name;
                    
                    if (category.icon) {
                        const icon = document.createElement('i');
                        icon.className = category.icon;
                        icon.style.color = 'var(--primary-color)';
                        categoryHeader.prepend(icon);
                    }
                    
                    categoryElement.appendChild(categoryHeader);
                    
                    const itemsRow = document.createElement('div');
                    itemsRow.className = 'row';
                    
                    sortedItems.forEach((item, index) => {
                        const itemCol = document.createElement('div');
                        itemCol.className = 'col-md-6 col-lg-4 api-item';
                        itemCol.dataset.name = item.name.toLowerCase();
                        itemCol.dataset.desc = item.desc.toLowerCase();
                        itemCol.dataset.category = category.name.toLowerCase().replace(/\s+/g, '-');
                        itemCol.style.animationDelay = `${index * 0.05 + 0.3}s';
                        
                        const apiCard = document.createElement('div');
                        apiCard.className = 'api-card';
                        
                        const infoDiv = document.createElement('div');
                        
                        const itemTitle = document.createElement('h5');
                        itemTitle.className = 'mb-0';
                        itemTitle.textContent = item.name;
                        
                        const itemDesc = document.createElement('p');
                        itemDesc.className = 'text-muted mb-0';
                        itemDesc.textContent = item.desc;
                        
                        infoDiv.appendChild(itemTitle);
                        infoDiv.appendChild(itemDesc);
                        
                        const actionsDiv = document.createElement('div');
                        actionsDiv.className = 'api-actions';
                        
                        const getBtn = document.createElement('button');
                        getBtn.className = 'btn get-api-btn';
                        getBtn.innerHTML = '<i class="fas fa-code"></i> GET';
                        getBtn.dataset.apiPath = item.path;
                        getBtn.dataset.apiName = item.name;
                        getBtn.dataset.apiDesc = item.desc;
                        getBtn.setAttribute('aria-label', `Get ${item.name} API`);
                        
                        const status = item.status || "ACTIVE";
                        let statusClass, statusIcon, statusTooltip;
                        
                        switch(status) {
                            case "ERROR":
                                statusClass = "status-error";
                                statusIcon = "fa-circle-xmark";
                                statusTooltip = "This feature has errors";
                                break;
                            case "MAINTENANCE":
                                statusClass = "status-maintenance";
                                statusIcon = "fa-circle-down";
                                statusTooltip = "This feature has maintenance";
                                break;
                            case "NEW":
                                statusClass = "status-new";
                                statusIcon = "fa-circle-plus";
                                statusTooltip = "This feature was added";
                                break;
                            case "UPDATE":
                                statusClass = "status-update";
                                statusIcon = "fa-circle-up";
                                statusTooltip = "New update available on this feature";
                                break;
                            default: // "ACTIVE"
                                statusClass = "status-active";
                                statusIcon = "fa-circle-check";
                                statusTooltip = "This feature is active";
                        }
                        
                        const statusIndicator = document.createElement('div');
                        statusIndicator.classList.add('api-status', statusClass);
                        statusIndicator.setAttribute('title', statusTooltip);
                        statusIndicator.setAttribute('data-bs-toggle', 'tooltip');
                        
                        const icon = document.createElement('i');
                        icon.className = `fas ${statusIcon}`;
                        statusIndicator.appendChild(icon);
                        
                        const statusText = document.createElement('span');
                        statusText.textContent = status;
                        statusIndicator.appendChild(statusText);
                        
                        actionsDiv.appendChild(getBtn);
                        actionsDiv.appendChild(statusIndicator);
                        
                        apiCard.appendChild(infoDiv);
                        apiCard.appendChild(actionsDiv);
                        
                        itemCol.appendChild(apiCard);
                        itemsRow.appendChild(itemCol);
                    });
                    
                    categoryElement.appendChild(itemsRow);
                    apiContent.appendChild(categoryElement);
                });
            }
            
            // Initialize tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.forEach(function (tooltipTriggerEl) {
                new bootstrap.Tooltip(tooltipTriggerEl);
            });
            
            // Observe API items for lazy loading
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.api-item:not(.in-view)').forEach(item => {
                observer.observe(item);
            });
        } catch (error) {
            console.error('Error loading API content:', error);
            showToast('Failed to load API content', 'error');
        }
    }

    // ===== API SEARCH FUNCTIONALITY =====
    function setupAPISearch() {
        const searchInput = document.getElementById('apiSearch');
        const clearSearch = document.getElementById('clearSearch');
        
        if (!searchInput) return;
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const apiItems = document.querySelectorAll('.api-item');
            
            apiItems.forEach(item => {
                const name = item.dataset.name;
                const desc = item.dataset.desc;
                const category = item.dataset.category;
                
                if (name.includes(searchTerm) || desc.includes(searchTerm) || category.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Show/hide category headers based on visible items
            document.querySelectorAll('.category-section').forEach(section => {
                const hasVisibleItems = Array.from(section.querySelectorAll('.api-item'))
                    .some(item => item.style.display !== 'none');
                
                section.style.display = hasVisibleItems ? '' : 'none';
            });
            
            // Show/hide clear button
            clearSearch.style.display = searchTerm ? 'block' : 'none';
        });
        
        clearSearch.addEventListener('click', function() {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            this.style.display = 'none';
            searchInput.focus();
        });
    }

    // ===== DOCS PAGE FUNCTIONALITY =====
    function setupCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = this.dataset.target;
                const targetElement = document.getElementById(targetId);
                const textToCopy = targetElement.textContent;
                
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    
                    setTimeout(() => {
                        this.innerHTML = originalText;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });
        });
        
        // Tab switching functionality
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons and samples
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.code-sample').forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked button and corresponding sample
                btn.classList.add('active');
                const lang = btn.dataset.lang;
                document.getElementById(`${lang}-example`).classList.add('active');
            });
        });
    }

    // ===== STATS PAGE FUNCTIONALITY =====
    function initStatsPage() {
        if (!document.getElementById('currentTime')) return;
        
        // Update time and battery
        function updateTime() {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            document.getElementById('currentTime').textContent = `${hours}:${minutes}`;
        }
        
        // Simulate battery level
        function updateBattery() {
            const batteryLevel = Math.floor(Math.random() * 30) + 20; // Random between 20-50%
            document.getElementById('batteryLevel').textContent = `${batteryLevel}%`;
        }
        
        // Initialize traffic chart
        if (typeof Chart !== 'undefined') {
            const ctx = document.getElementById('trafficChart').getContext('2d');
            const trafficChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                    datasets: [{
                        label: 'Requests',
                        data: [1200, 1900, 3000, 5000, 2000, 3000, 2400],
                        borderColor: 'var(--primary-color)',
                        backgroundColor: 'rgba(108, 92, 231, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'var(--border-color)'
                            },
                            ticks: {
                                color: 'var(--text-muted)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'var(--border-color)'
                            },
                            ticks: {
                                color: 'var(--text-muted)'
                            }
                        }
                    }
                }
            });
        }
        
        // Initial calls
        updateTime();
        updateBattery();
        
        // Update time every minute
        setInterval(updateTime, 60000);
        // Update battery every 5 minutes
        setInterval(updateBattery, 300000);
    }

    // ===== TOAST NOTIFICATION =====
    const showToast = (message, type = 'info') => {
        const toast = document.getElementById('notificationToast');
        if (!toast) return;
        
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
});