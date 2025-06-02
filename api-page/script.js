document.addEventListener('DOMContentLoaded', async () => {
    // Enhanced loading screen
    const loadingScreen = document.getElementById("loadingScreen");
    const body = document.body;
    body.classList.add("no-scroll");

    // Loading dots animation
    const loadingDotsAnimation = setInterval(() => {
        const loadingDots = document.querySelector(".loading-dots");
        if (loadingDots) {
            if (loadingDots.textContent === '...') {
                loadingDots.textContent = '.';
            } else {
                loadingDots.textContent += '.';
            }
        }
    }, 500);

    // Side navigation functionality
    const sideNav = document.querySelector('.side-nav');
    const mainWrapper = document.querySelector('.main-wrapper');
    const navCollapseBtn = document.querySelector('.nav-collapse-btn');
    const menuToggle = document.querySelector('.menu-toggle');
    
    navCollapseBtn.addEventListener('click', () => {
        sideNav.classList.toggle('collapsed');
        mainWrapper.classList.toggle('nav-collapsed');
    });
    
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
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('.side-nav-link').forEach(link => {
        if (link.getAttribute('href').startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth' 
                    });
                    
                    // Update active link
                    document.querySelectorAll('.side-nav-link').forEach(l => {
                        l.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // Close side nav on mobile
                    if (window.innerWidth < 992) {
                        sideNav.classList.remove('active');
                    }
                }
            });
        }
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        document.querySelectorAll('section[id]').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.side-nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // Toast notification system
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

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        showToast(`Switched to ${isDarkMode ? 'dark' : 'light'} mode`, 'success');
    });

    // Copy to clipboard functionality
    const copyToClipboard = (elementId) => {
        const element = document.getElementById(elementId);
        const text = element.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            const btn = elementId === 'apiEndpoint' ? 
                document.getElementById('copyEndpoint') : 
                document.getElementById('copyResponse');
            
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.classList.add('copy-success');
            
            showToast('Copied to clipboard successfully!', 'success');
            
            setTimeout(() => {
                btn.innerHTML = '<i class="far fa-copy"></i>';
                btn.classList.remove('copy-success');
            }, 1500);
        }).catch(err => {
            showToast('Failed to copy text: ' + err, 'error');
        });
    };
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Load API content if on API page
    if (window.location.pathname.includes('/api/')) {
        try {
            const settingsResponse = await fetch('/src/settings.json');
            if (!settingsResponse.ok) throw new Error('Failed to load settings');
            const settings = await settingsResponse.json();
            
            const apiContent = document.getElementById('apiContent');
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
                        itemCol.dataset.name = item.name;
                        itemCol.dataset.desc = item.desc;
                        itemCol.dataset.category = category.name;
                        itemCol.style.animationDelay = `${index * 0.05 + 0.3}s`;
                        
                        const heroSection = document.createElement('div');
                        heroSection.className = 'hero-section';
                        
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
                        
                        heroSection.appendChild(infoDiv);
                        heroSection.appendChild(actionsDiv);
                        
                        itemCol.appendChild(heroSection);
                        itemsRow.appendChild(itemCol);
                    });
                    
                    categoryElement.appendChild(itemsRow);
                    apiContent.appendChild(categoryElement);
                });
            }
        } catch (error) {
            console.error('Error loading API content:', error);
            showToast('Failed to load API content', 'error');
        }
    }

    // Hide loading screen
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            loadingScreen.style.display = "none";
            body.classList.remove("no-scroll");
            clearInterval(loadingDotsAnimation);
        }, 500);
    }, 1000);
    
    // Animate in API items as they come into view
    const observeElements = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        document.querySelectorAll('.api-item:not(.in-view)').forEach(item => {
            observer.observe(item);
        });
    };
    
    observeElements();
    window.addEventListener('resize', observeElements);
});