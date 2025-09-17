// CRATECH - Dashboard Administrateur Interactif

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation
    initDashboard();
    initSidebar();
    initStatsAnimation();
    initTimeDisplay();
    initQuickActions();
    initNotifications();
    initLogoutConfirm();
});

// Initialisation du dashboard
function initDashboard() {
    console.log('🚀 CRATECH - Dashboard administrateur initialisé !');
    
    // Animation d'entrée
    const cards = document.querySelectorAll('.dashboard-card, .stat-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Gestion de la sidebar
function initSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
        
        // Fermer la sidebar en cliquant à l'extérieur sur mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 1024) {
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }
    
    // Navigation active
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Empêcher le défaut uniquement pour les ancres internes (hash) ou liens vides
            if (!href || href.startsWith('#')) {
                e.preventDefault();
            }
            
            // Retirer la classe active de tous les éléments
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Ajouter la classe active à l'élément cliqué
            this.classList.add('active');
            
            // Fermer la sidebar sur mobile après clic
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
            }
        });
    });
}

// Animation des statistiques
function initStatsAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateNumber = (element) => {
        const target = parseFloat(element.dataset.target);
        const duration = 2000;
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = target * progress;
            
            if (target % 1 === 0) {
                element.textContent = Math.floor(current);
            } else {
                element.textContent = current.toFixed(1);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    };
    
    // Observer pour déclencher l'animation quand les éléments sont visibles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

// Affichage de l'heure
function initTimeDisplay() {
    const timeElement = document.getElementById('current-time');
    
    if (timeElement) {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            timeElement.textContent = timeString;
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }
}

// Actions rapides
function initQuickActions() {
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.querySelector('span').textContent;
            
            // Animation de clic
            this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Actions selon le bouton
            switch(action) {
                case 'Créer un utilisateur':
                case 'Comptes utilisateurs':
                    window.location.href = '/admin/users.html';
                    break;
                case 'Activités':
                    window.location.href = '/admin/activities.html';
                    break;
                case 'CRA':
                    window.location.href = '/admin/cra.html';
                    break;
                case 'Reporting':
                    window.location.href = '/admin/reporting.html';
                    break;
                case 'Exporter les données':
                    showNotification('Export en cours...', 'info');
                    break;
                case 'Générer un rapport':
                    showNotification('Génération du rapport...', 'info');
                    break;
                case 'Paramètres système':
                    showNotification('Ouverture des paramètres...', 'info');
                    break;
                default:
                    showNotification('Action non implémentée', 'warning');
            }
        });
    });
}

// Notifications
function initNotifications() {
    const notificationBtn = document.querySelector('.action-btn');
    
        if (notificationBtn) {
            notificationBtn.addEventListener('click', function() {
            showNotification('Vous avez 3 nouvelles notifications', 'info');
            });
        }
    }
    
// Fonction pour afficher les notifications
    function showNotification(message, type = 'info') {
    // Créer l'élément de notification
        const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
        notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
    // Styles pour la notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--white);
        border: 1px solid var(--gray-200);
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Ajouter au DOM
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        }, 100);
        
    // Gestion de la fermeture
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    
    // Fermeture automatique après 5 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Icône selon le type de notification
    function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-bell';
    }
}

// Actions de validation
function initValidationActions() {
    const approveBtns = document.querySelectorAll('.approve-btn');
    const rejectBtns = document.querySelectorAll('.reject-btn');
    
    approveBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const pendingItem = this.closest('.pending-item');
            const userName = pendingItem.querySelector('h4').textContent;
            
            // Animation
            this.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
            
            showNotification(`${userName} - CRA approuvé`, 'success');
            
            // Simuler la suppression de l'élément
            setTimeout(() => {
                pendingItem.style.opacity = '0';
                pendingItem.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    pendingItem.remove();
                }, 300);
            }, 1000);
        });
    });
    
    rejectBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const pendingItem = this.closest('.pending-item');
            const userName = pendingItem.querySelector('h4').textContent;
            
            // Animation
            this.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
            
            showNotification(`${userName} - CRA rejeté`, 'warning');
            
            // Simuler la suppression de l'élément
            setTimeout(() => {
                pendingItem.style.opacity = '0';
                pendingItem.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    pendingItem.remove();
                }, 300);
            }, 1000);
        });
    });
}

// Initialiser les actions de validation
document.addEventListener('DOMContentLoaded', function() {
    initValidationActions();
});

// Gestion du redimensionnement de la fenêtre
        window.addEventListener('resize', function() {
    const sidebar = document.querySelector('.admin-sidebar');
    if (window.innerWidth > 1024) {
        sidebar.classList.remove('open');
    }
});

// Raccourcis clavier
document.addEventListener('keydown', function(e) {
    // Ctrl + K pour la recherche
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        showNotification('Recherche rapide activée', 'info');
    }
    
    // Échap pour fermer la sidebar sur mobile
    if (e.key === 'Escape') {
        const sidebar = document.querySelector('.admin-sidebar');
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('open');
        }
    }
});

// Optimisations de performance
function initPerformanceOptimizations() {
    // Lazy loading des images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
    images.forEach(img => imageObserver.observe(img));
    
    // Debounce pour les événements de scroll
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Actions de scroll si nécessaire
        }, 100);
    });
}

// Initialiser les optimisations
document.addEventListener('DOMContentLoaded', function() {
    initPerformanceOptimizations();
    loadDashboardStats();
});

// Charger les statistiques réelles du dashboard
async function loadDashboardStats(){
    try {
        const els = {
            usersActive: document.querySelector('.stats-grid .stat-card:nth-child(1) .stat-number'),
            crasSubmitted: document.querySelector('.stats-grid .stat-card:nth-child(2) .stat-number'),
            pending: document.querySelector('.stats-grid .stat-card:nth-child(3) .stat-number'),
            validationRate: document.querySelector('.stats-grid .stat-card:nth-child(4) .stat-number'),
            pendingBadge: document.querySelector('.dashboard-card .pending-count')
        };

        // Utilisateurs actifs
        let usersActive = 0;
        try {
            const r = await fetch('/api/public/users', { credentials: 'same-origin' });
            const j = await r.json();
            usersActive = (j && j.stats && typeof j.stats.active === 'number') ? j.stats.active : 0;
            if (els.usersActive) els.usersActive.textContent = usersActive;
        } catch(e) {}

        // Statuts CRA via parsing de la page admin/cra.html (aucune auth requise)
        let total = 0, pending = 0, validated = 0;
        try {
            const res = await fetch('/admin/cra.html', { credentials: 'same-origin' });
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const rows = Array.from(doc.querySelectorAll('#craTbody tr'));
            rows.forEach(tr => {
                const badge = tr.querySelector('.status-badge');
                if (!badge) return;
                total += 1;
                const cls = badge.className || '';
                if (cls.includes('en_attente')) pending += 1;
                if (cls.includes('valide')) validated += 1;
            });
        } catch(e) {}

        const crasSubmitted = total; // approximation
        const validationRate = crasSubmitted > 0 ? Math.round((validated / crasSubmitted) * 1000)/10 : 0;

        if (els.crasSubmitted) els.crasSubmitted.textContent = crasSubmitted;
        if (els.pending) els.pending.textContent = pending;
        if (els.validationRate) els.validationRate.textContent = validationRate;
        if (els.pendingBadge) els.pendingBadge.textContent = pending;
    } catch (err) {
        console.warn('Chargement stats dashboard échoué:', err);
    }
}

// Confirmation de déconnexion (modal)
function showConfirmModal(message, onConfirm) {
    // Créer modal
    const overlay = document.createElement('div');
    overlay.className = 'modal';
    overlay.innerHTML = `
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-sign-out-alt" style="color:#EF4444;margin-right:.5rem;"></i>Confirmer la déconnexion</h3>
            <button class="modal-close" aria-label="Fermer">&times;</button>
        </div>
        <div class="modal-body">
            <p style="font-size:1rem;color:#374151;">${message || 'Voulez-vous vraiment vous déconnecter ?'}</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" id="logoutCancelBtn">Annuler</button>
            <button class="btn btn-danger" id="logoutConfirmBtn"><i class="fas fa-power-off"></i> Se déconnecter</button>
        </div>
    </div>`;

    document.body.appendChild(overlay);

    const close = () => { overlay.remove(); };
    overlay.querySelector('.modal-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('#logoutCancelBtn').addEventListener('click', close);
    overlay.querySelector('#logoutConfirmBtn').addEventListener('click', () => { try { onConfirm && onConfirm(); } finally { close(); } });
}

function initLogoutConfirm() {
    try {
        const bind = (el) => {
            el.addEventListener('click', function(e) {
                e.preventDefault();
                showConfirmModal('Voulez-vous vraiment vous déconnecter ?', () => {
                    window.location.href = '/logout';
                });
            });
        };
        // Liens de déconnexion connus
        document.querySelectorAll('a[href="/logout"], .logout-btn[href="/logout"]').forEach(bind);
    } catch (err) {
        console.warn('Init logout confirm failed:', err);
    }
}