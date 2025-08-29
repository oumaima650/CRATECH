// CRATECH - Interface sombre et élégante inspirée de Behance Pro
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialisation des composants
    initHeader();
    initAnimations();
    initInteractiveElements();
    initSmoothScrolling();
    initSearchFunctionality();
    initPerformanceOptimizations();
    
    // Header élégant avec effet de transparence au scroll
    function initHeader() {
        const header = document.querySelector('.header');
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Effet de transparence subtil au scroll
            if (scrollTop > 100) {
                header.style.background = 'rgba(0, 0, 0, 0.98)';
                header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
                header.style.borderBottom = '1px solid rgba(124, 58, 237, 0.3)';
            } else {
                header.style.background = 'rgba(0, 0, 0, 0.95)';
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
            }
            
            lastScrollTop = scrollTop;
        });
    }
    
    // Animations élégantes au scroll avec Intersection Observer
    function initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    
                    // Effet spécial pour les cartes
                    if (entry.target.classList.contains('feature-card')) {
                        entry.target.style.animation = 'cardGlow 0.8s ease-out';
                    }
                    
                    // Effet spécial pour le logo
                    if (entry.target.classList.contains('logo-container')) {
                        entry.target.style.animation = 'logoReveal 1.2s ease-out';
                    }
                }
            });
        }, observerOptions);
        
        // Observer les éléments à animer
        const animatedElements = document.querySelectorAll('.feature-card, .hero-title, .cta-section, .logo-container');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(el);
        });
        
        // Ajouter les animations CSS élégantes
        if (!document.querySelector('#elegant-animations')) {
            const style = document.createElement('style');
            style.id = 'elegant-animations';
            style.textContent = `
                @keyframes cardGlow {
                    0% { 
                        transform: translateY(30px); 
                        opacity: 0; 
                        box-shadow: 0 0 0 rgba(124, 58, 237, 0); 
                    }
                    50% { 
                        transform: translateY(-5px); 
                        opacity: 0.8; 
                        box-shadow: 0 20px 40px rgba(124, 58, 237, 0.3); 
                    }
                    100% { 
                        transform: translateY(0); 
                        opacity: 1; 
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); 
                    }
                }
                
                @keyframes logoReveal {
                    0% { 
                        transform: translateY(30px) scale(0.8); 
                        opacity: 0; 
                    }
                    50% { 
                        transform: translateY(-10px) scale(1.05); 
                        opacity: 0.8; 
                    }
                    100% { 
                        transform: translateY(0) scale(1); 
                        opacity: 1; 
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Éléments interactifs élégants
    function initInteractiveElements() {
        // Boutons avec effet de ripple élégant
        const buttons = document.querySelectorAll('.btn, .cta-button');
        buttons.forEach(button => {
            button.addEventListener('click', createElegantRipple);
        });
        
        // Cartes avec effet de hover élégant
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
                this.style.boxShadow = '0 30px 60px rgba(124, 58, 237, 0.2)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
            });
        });
        
        // Menu des cartes
        const cardMenus = document.querySelectorAll('.card-menu');
        cardMenus.forEach(menu => {
            menu.addEventListener('click', function(e) {
                e.stopPropagation();
                showElegantCardOptions(this);
            });
        });
        
        // Logo avec effet de hover élégant
        const logoBrand = document.querySelector('.logo-brand');
        if (logoBrand) {
            logoBrand.addEventListener('mouseenter', function() {
                this.style.textShadow = '0 0 20px rgba(124, 58, 237, 0.6)';
            });
            
            logoBrand.addEventListener('mouseleave', function() {
                this.style.textShadow = 'none';
            });
        }
        
        // Logo symbol avec effet de hover élégant
        const logoSymbol = document.querySelector('.logo-symbol');
        if (logoSymbol) {
            logoSymbol.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05) rotate(5deg)';
                this.style.filter = 'drop-shadow(0 25px 50px rgba(124, 58, 237, 0.6))';
            });
            
            logoSymbol.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) rotate(0deg)';
                this.style.filter = 'drop-shadow(0 20px 40px rgba(124, 58, 237, 0.4))';
            });
        }
    }
    
    // Effet de ripple élégant sur les boutons
    function createElegantRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, 
                rgba(124, 58, 237, 0.4) 0%, 
                rgba(236, 72, 153, 0.3) 50%, 
                transparent 100%);
            border-radius: 50%;
            transform: scale(0);
            animation: elegantRipple 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            z-index: 1;
        `;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 800);
        
        // Ajouter l'animation CSS si elle n'existe pas
        if (!document.querySelector('#elegant-ripple')) {
            const style = document.createElement('style');
            style.id = 'elegant-ripple';
            style.textContent = `
                @keyframes elegantRipple {
                    0% { transform: scale(0); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                    100% { transform: scale(2); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Options des cartes élégantes
    function showElegantCardOptions(menuElement) {
        const card = menuElement.closest('.feature-card');
        const title = card.querySelector('h3').textContent;
        
        // Créer un menu contextuel élégant
        const contextMenu = document.createElement('div');
        contextMenu.className = 'elegant-context-menu';
        contextMenu.innerHTML = `
            <div class="context-menu-item">
                <i class="fas fa-share"></i>
                <span>Partager</span>
            </div>
            <div class="context-menu-item">
                <i class="fas fa-bookmark"></i>
                <span>Marquer</span>
            </div>
            <div class="context-menu-item">
                <i class="fas fa-info-circle"></i>
                <span>Plus d'infos</span>
            </div>
        `;
        
        // Positionner le menu
        const rect = menuElement.getBoundingClientRect();
        contextMenu.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 10}px;
            left: ${rect.left}px;
            z-index: 1000;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            padding: 0.75rem 0;
            min-width: 200px;
            border: 1px solid rgba(124, 58, 237, 0.3);
            transform: scale(0.9) translateY(-10px);
            opacity: 0;
            animation: elegantMenuAppear 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        `;
        
        document.body.appendChild(contextMenu);
        
        // Fermer le menu au clic ailleurs
        document.addEventListener('click', function closeMenu() {
            contextMenu.style.animation = 'elegantMenuDisappear 0.2s ease forwards';
            setTimeout(() => contextMenu.remove(), 200);
            document.removeEventListener('click', closeMenu);
        });
        
        // Ajouter les animations CSS
        if (!document.querySelector('#elegant-menu-animations')) {
            const style = document.createElement('style');
            style.id = 'elegant-menu-animations';
            style.textContent = `
                @keyframes elegantMenuAppear {
                    to { 
                        transform: scale(1) translateY(0); 
                        opacity: 1; 
                    }
                }
                
                @keyframes elegantMenuDisappear {
                    to { 
                        transform: scale(0.9) translateY(-10px); 
                        opacity: 0; 
                    }
                }
                
                .elegant-context-menu .context-menu-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.25rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                    color: #e2e8f0;
                    border-radius: 8px;
                    margin: 0 0.5rem;
                }
                
                .elegant-context-menu .context-menu-item:hover {
                    background: rgba(124, 58, 237, 0.2);
                    color: #ffffff;
                    transform: translateX(5px);
                }
                
                .elegant-context-menu .context-menu-item i {
                    color: #7c3aed;
                    width: 18px;
                    transition: transform 0.3s ease;
                }
                
                .elegant-context-menu .context-menu-item:hover i {
                    transform: scale(1.1);
                    color: #a78bfa;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Fonctionnalité de recherche élégante
    function initSearchFunctionality() {
        const searchInput = document.querySelector('.search-input');
        const searchIcon = document.querySelector('.search-icon');
        
        if (searchInput && searchIcon) {
            // Focus sur la barre de recherche
            searchInput.addEventListener('focus', function() {
                this.style.background = 'rgba(255, 255, 255, 0.15)';
                this.style.borderColor = '#7C3AED';
                this.style.boxShadow = '0 0 30px rgba(124, 58, 237, 0.3)';
                searchIcon.style.color = '#7C3AED';
            });
            
            searchInput.addEventListener('blur', function() {
                this.style.background = 'rgba(255, 255, 255, 0.1)';
                this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                this.style.boxShadow = 'none';
                searchIcon.style.color = '#94a3b8';
            });
            
            // Recherche en temps réel
            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase();
                if (query.length > 2) {
                    // Ici vous pouvez ajouter la logique de recherche
                    console.log('Recherche pour:', query);
                }
            });
            
            // Recherche au clic sur l'icône
            searchIcon.addEventListener('click', function() {
                searchInput.focus();
            });
        }
    }
    
    // Défilement fluide élégant
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Effet de highlight sur la cible
                    targetElement.style.animation = 'targetHighlight 2s ease-out';
                }
            });
        });
        
        // Ajouter l'animation de highlight
        if (!document.querySelector('#target-highlight')) {
            const style = document.createElement('style');
            style.id = 'target-highlight';
            style.textContent = `
                @keyframes targetHighlight {
                    0% { box-shadow: 0 0 0 rgba(124, 58, 237, 0); }
                    50% { box-shadow: 0 0 30px rgba(124, 58, 237, 0.4); }
                    100% { box-shadow: 0 0 0 rgba(124, 58, 237, 0); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Optimisations de performance élégantes
    function initPerformanceOptimizations() {
        // Lazy loading des images (si ajoutées plus tard)
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
        
        // Debounce pour les événements de scroll
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(function() {
                // Actions après arrêt du scroll
            }, 100);
        });
        
        // Optimisation des animations
        const animatedElements = document.querySelectorAll('.feature-card, .cta-button, .btn, .logo-symbol');
        animatedElements.forEach(el => {
            el.style.willChange = 'transform';
        });
    }
    
    // Gestion des erreurs et fallbacks
    window.addEventListener('error', function(e) {
        console.warn('Erreur JavaScript détectée:', e.error);
    });
    
    // Monitoring des performances
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('🚀 CRATECH - Temps de chargement élégant:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                }
            }, 0);
        });
    }
    
    // Support pour les préférences de réduction de mouvement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition', 'none');
    }
    
    // Initialisation réussie
    console.log('🚀 CRATECH - Interface sombre et élégante initialisée avec succès ! ✨');
    
    // Ajouter des styles CSS dynamiques élégants
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
        /* Styles dynamiques pour les interactions élégantes */
        .btn:active,
        .cta-button:active {
            transform: translateY(1px);
        }
        
        .feature-card:focus-within {
            border-color: #7c3aed;
            box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }
        
        /* États de chargement élégants */
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }
        
        /* Support pour le mode sombre (déjà en mode sombre) */
        @media (prefers-color-scheme: light) {
            /* Garder le mode sombre par défaut */
        }
        
        /* Effets de hover élégants supplémentaires */
        .search-input:hover {
            background: rgba(255, 255, 255, 0.12);
        }
        
        .nav-link:hover {
            transform: translateY(-1px);
        }
        
        .logo-brand:hover {
            transform: scale(1.02);
        }
        
        /* Animation du logo au chargement */
        .logo-symbol {
            animation: logoFloat 3s ease-in-out infinite;
        }
        
        @keyframes logoFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
    `;
    
    document.head.appendChild(dynamicStyles);
}); 