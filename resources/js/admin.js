// CRATECH - Interface Admin Sombre et Élégante
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialisation des composants
    initAdminInterface();
    initDashboardData();
    initInteractiveElements();
    initPerformanceOptimizations();
    
    // Interface d'administration principale
    function initAdminInterface() {
        console.log('🚀 CRATECH - Interface d\'administration initialisée !');
        
        // Animation d'entrée élégante
        const sidebar = document.querySelector('.admin-sidebar');
        const mainContent = document.querySelector('.admin-main');
        
        if (sidebar && mainContent) {
            sidebar.style.opacity = '0';
            sidebar.style.transform = 'translateX(-30px)';
            mainContent.style.opacity = '0';
            mainContent.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                sidebar.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                mainContent.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                
                sidebar.style.opacity = '1';
                sidebar.style.transform = 'translateX(0)';
                mainContent.style.opacity = '1';
                mainContent.style.transform = 'translateX(0)';
            }, 100);
        }
    }
    
    // Données du tableau de bord
    function initDashboardData() {
        loadStats();
        loadRecentActivity();
        
        // Actualisation automatique toutes les 30 secondes
        setInterval(() => {
            loadStats();
            loadRecentActivity();
        }, 30000);
    }
    
    // Charger les statistiques
    function loadStats() {
        // Simulation de données en temps réel
        const stats = {
            'total-users': Math.floor(Math.random() * 50) + 150,
            'active-projects': Math.floor(Math.random() * 10) + 20,
            'pending-cras': Math.floor(Math.random() * 20) + 80,
            'validators': Math.floor(Math.random() * 5) + 10
        };
        
        Object.keys(stats).forEach(statId => {
            const element = document.getElementById(statId);
            if (element) {
                animateCounter(element, parseInt(element.textContent), stats[statId]);
            }
        });
    }
    
    // Animation des compteurs
    function animateCounter(element, start, end) {
        const duration = 1000;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * easeOutQuart(progress));
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }
    
    // Fonction d'easing
    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
    
    // Charger l'activité récente
    function loadRecentActivity() {
        const activities = [
            {
                action: 'CRA soumis',
                user: 'Marie Joulain',
                service: 'Service IT',
                date: '09/08/2025',
                status: 'EN ATTENTE',
                statusClass: 'warning'
            },
            {
                action: 'Utilisateur créé',
                user: 'Pierre Dubois',
                service: 'Commercial',
                date: '08/08/2025',
                status: 'ACTIF',
                statusClass: 'success'
            },
            {
                action: 'Projet validé',
                user: 'Sophie Martin',
                service: 'Développement',
                date: '07/08/2025',
                status: 'TERMINÉ',
                statusClass: 'success'
            },
            {
                action: 'CRA rejeté',
                user: 'Jean Dupont',
                service: 'Marketing',
                date: '06/08/2025',
                status: 'REJETÉ',
                statusClass: 'error'
            }
        ];
        
        const tbody = document.getElementById('recent-activity');
        if (tbody) {
            tbody.innerHTML = '';
            
            activities.forEach((activity, index) => {
                const row = createActivityRow(activity, index);
                tbody.appendChild(row);
            });
        }
    }
    
    // Créer une ligne d'activité
    function createActivityRow(activity, index) {
        const row = document.createElement('tr');
        row.className = 'activity-row';
        row.style.animationDelay = `${index * 0.1}s`;
        
        const statusColors = {
            'warning': '#f59e0b',
            'success': '#10b981',
            'error': '#ef4444',
            'info': '#3b82f6'
        };
        
        row.innerHTML = `
            <td>
                <div class="activity-action">
                    <i class="fas fa-${getActionIcon(activity.action)}"></i>
                    <span>${activity.action}</span>
                </div>
            </td>
            <td>
                <div class="activity-user">
                    <div class="user-avatar-small">
                        ${getUserInitials(activity.user)}
                    </div>
                    <div class="user-info">
                        <div class="user-name">${activity.user}</div>
                        <div class="user-service">${activity.service}</div>
                    </div>
                </div>
            </td>
            <td>${activity.date}</td>
            <td>
                <span class="status-badge ${activity.statusClass}" style="background: ${statusColors[activity.statusClass]}20; color: ${statusColors[activity.statusClass]}; border: 1px solid ${statusColors[activity.statusClass]}40;">
                    ${activity.status}
                </span>
            </td>
            <td>
                <div class="activity-actions">
                    <button class="action-btn" title="Voir les détails">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }
    
    // Obtenir l'icône pour l'action
    function getActionIcon(action) {
        const icons = {
            'CRA soumis': 'file-alt',
            'Utilisateur créé': 'user-plus',
            'Projet validé': 'check-circle',
            'CRA rejeté': 'times-circle'
        };
        return icons[action] || 'info-circle';
    }
    
    // Obtenir les initiales de l'utilisateur
    function getUserInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    
    // Éléments interactifs élégants
    function initInteractiveElements() {
        // Bouton d'actualisation
        const refreshBtn = document.getElementById('refresh-activity');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                this.classList.add('rotating');
                loadRecentActivity();
                
                setTimeout(() => {
                    this.classList.remove('rotating');
                }, 1000);
            });
        }
        
        // Navigation active
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.forEach(l => l.parentElement.classList.remove('active'));
                this.parentElement.classList.add('active');
            });
        });
        
        // Effets de hover sur les cartes de stats
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Boutons d'action rapide
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', createElegantRipple);
        });
        
        // Notifications
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', function() {
                showNotification('Fonctionnalité de notifications à venir !', 'info');
            });
        }
    }
    
    // Effet de ripple élégant
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
    }
    
    // Afficher une notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-suppression
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
        
        // Bouton de fermeture
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    // Obtenir l'icône de notification
    function getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    // Optimisations de performance
    function initPerformanceOptimizations() {
        // Optimisation des animations
        const animatedElements = document.querySelectorAll('.stat-card, .quick-action-btn, .nav-link');
        animatedElements.forEach(el => {
            el.style.willChange = 'transform';
        });
        
        // Debounce pour les événements de resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(function() {
                // Actions après redimensionnement
            }, 100);
        });
        
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
    }
    
    // Gestion des erreurs
    window.addEventListener('error', function(e) {
        console.warn('Erreur JavaScript détectée:', e.error);
        showNotification('Une erreur est survenue', 'error');
    });
    
    // Monitoring des performances
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log(' CRATECH - Temps de chargement du dashboard:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                }
            }, 0);
        });
    }
    
    // Support pour les préférences de réduction de mouvement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition', 'none');
    }
    
    // Initialisation réussie
    console.log(' CRATECH - Interface d\'administration élégante initialisée avec succès ! ');
    
    // Ajouter des styles CSS dynamiques élégants
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
        /* Styles dynamiques pour les interactions élégantes */
        .activity-row {
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s ease-out forwards;
        }
        
        .rotating {
            animation: rotate 1s linear;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .admin-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--background-card);
            border: 1px solid var(--border-light);
            color: var(--text-white);
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            backdrop-filter: blur(20px);
            box-shadow: var(--shadow-card);
        }
        
        .admin-notification.show {
            transform: translateX(0);
        }
        
        .admin-notification.success {
            border-color: #10b981;
            background: rgba(16, 185, 129, 0.1);
        }
        
        .admin-notification.error {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
        }
        
        .admin-notification.warning {
            border-color: #f59e0b;
            background: rgba(245, 158, 11, 0.1);
        }
        
        .admin-notification.info {
            border-color: #3b82f6;
            background: rgba(59, 130, 246, 0.1);
        }
        
        .notification-close {
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
            transition: var(--transition);
        }
        
        .notification-close:hover {
            color: var(--text-white);
            background: rgba(255, 255, 255, 0.1);
        }
        
        .activity-action {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .activity-action i {
            color: var(--primary-purple);
            width: 16px;
        }
        
        .activity-user {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .user-avatar-small {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, var(--primary-purple), var(--accent-pink));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-white);
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .user-info {
            display: flex;
            flex-direction: column;
        }
        
        .user-name {
            font-weight: 600;
            color: var(--text-white);
            font-size: 0.9rem;
        }
        
        .user-service {
            color: var(--text-muted);
            font-size: 0.8rem;
        }
        
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .activity-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .action-btn {
            background: transparent;
            border: 1px solid var(--border-light);
            color: var(--text-muted);
            padding: 0.5rem;
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: var(--transition);
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .action-btn:hover {
            background: var(--primary-purple);
            color: var(--text-white);
            border-color: var(--primary-purple);
            transform: scale(1.1);
        }
        
        /* Animation du logo au hover */
        .logo-symbol:hover {
            transform: scale(1.1) rotate(5deg);
            filter: drop-shadow(0 25px 50px rgba(124, 58, 237, 0.6));
        }
        
        /* Effets de hover supplémentaires */
        .nav-link:hover {
            transform: translateX(8px);
        }
        
        .quick-action-btn:hover {
            transform: translateY(-5px) scale(1.05);
        }
    `;
    
    document.head.appendChild(dynamicStyles);
});
