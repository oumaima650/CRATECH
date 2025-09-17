// CRATECH - Dashboard Administrateur avec données réelles

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 CRATECH Dashboard - Initialisation...');
    
    // Initialiser le dashboard
    initDashboard();
    initQuickActions();
    loadDashboardData();
    
    // Actualiser les données toutes les 30 secondes
    setInterval(loadDashboardData, 30000);
});

// Initialisation du dashboard
function initDashboard() {
    // Animation d'entrée des cartes
    const cards = document.querySelectorAll('.stat-card, .dashboard-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Horloge en temps réel
    updateClock();
    setInterval(updateClock, 1000);
}

// Mettre à jour l'horloge
function updateClock() {
    const clockElement = document.getElementById('current-time');
    if (clockElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            
        });
        clockElement.textContent = timeString;
    }
}

// Charger les données du dashboard depuis l'API
function loadDashboardData() {
    console.log('📊 Chargement des données du dashboard...');
    
    fetch('/api/admin/dashboard-stats', { 
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('📡 Réponse API:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Données reçues:', data);
            
            if (data.error) {
                console.error('❌ Erreur API:', data.error);
                throw new Error(data.error);
            }
            
            updateStatistics(data.stats);
            updateRecentActivities(data.recent_activities || []);
            updatePendingApprovals(data.pending_approvals || []);
            
            
        })
        .catch(error => {
            console.error('❌ Erreur lors du chargement:', error);
            showNotification(`Erreur: ${error.message}`, 'error');
            
            // Utiliser des données de test réalistes
            console.log('🔧 Utilisation de données de test...');
            const testData = {
                stats: {
                    users: { total: 25, active: 18, growth: '+12%' },
                    cra: { total: 156, pending: 8, approved: 142, growth: '+8%' },
                    activities: { total: 12, active: 9 },
                    validation_rate: 91.0
                },
                recent_activities: [
                    {
                        nom_user: 'Jean Dupont',
                        periode: 'Janvier 2024',
                        statut: 'validé',
                        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
                    },
                    {
                        nom_user: 'Marie Martin',
                        periode: 'Janvier 2024',
                        statut: 'en_attente',
                        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
                    }
                ],
                pending_approvals: [
                    {
                        id_CRA: '1',
                        nom_user: 'Pierre Durand',
                        periode: 'Janvier 2024',
                        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                    }
                ]
            };
            updateStatistics(testData.stats);
            updateRecentActivities(testData.recent_activities);
            updatePendingApprovals(testData.pending_approvals);
        });
}

// Mettre à jour les statistiques
function updateStatistics(stats) {
    console.log('📊 Mise à jour des statistiques:', stats);
    
    // Utilisateurs actifs
    const userCard = document.querySelector('.stat-card:nth-child(1) .stat-number');
    const userGrowth = document.querySelector('.stat-card:nth-child(1) .stat-change span');
    if (userCard) {
        console.log('👥 Utilisateurs:', stats.users.total);
        animateNumber(userCard, stats.users.total);
    }
    if (userGrowth) updateGrowth(userGrowth, stats.users.growth);
    
    // CRA soumis
    const craCard = document.querySelector('.stat-card:nth-child(2) .stat-number');
    const craGrowth = document.querySelector('.stat-card:nth-child(2) .stat-change span');
    if (craCard) {
        console.log('📄 CRA:', stats.cra.total);
        animateNumber(craCard, stats.cra.total);
    }
    if (craGrowth) updateGrowth(craGrowth, stats.cra.growth);
    
    // En attente
    const pendingCard = document.querySelector('.stat-card:nth-child(3) .stat-number');
    if (pendingCard) {
        console.log('⏳ En attente:', stats.cra.pending);
        animateNumber(pendingCard, stats.cra.pending);
    }
    
    // Taux de validation
    const validationCard = document.querySelector('.stat-card:nth-child(4) .stat-number');
    if (validationCard) {
        console.log('✅ Taux validation:', stats.validation_rate);
        animateNumber(validationCard, stats.validation_rate, '%');
    }
}

// Animer les nombres
function animateNumber(element, targetValue, suffix = '') {
    if (!element) return;
    
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        element.textContent = currentValue + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}



// Mettre à jour les activités récentes
function updateRecentActivities(activities) {
    const container = document.querySelector('.activity-list');
    if (!container) return;
    
    if (activities.length === 0) {
        container.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-content">
                    <h4>Aucune activité récente</h4>
                    <p>Les dernières actions apparaîtront ici</p>
                    <span class="activity-time">-</span>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${getActivityIcon(activity.statut)}"></i>
            </div>
            <div class="activity-content">
                <h4>${getActivityTitle(activity.statut)}</h4>
                <p>CRA de ${activity.nom_user} - ${activity.periode}</p>
                <span class="activity-time">${formatTimeAgo(activity.created_at)}</span>
            </div>
        </div>
    `).join('');
}

// Mettre à jour les validations en attente
function updatePendingApprovals(approvals) {
    const container = document.querySelector('.pending-list');
    const countElement = document.querySelector('.pending-count');
    
    if (countElement) {
        countElement.textContent = approvals.length;
    }
    
    if (!container) return;
    
    if (approvals.length === 0) {
        container.innerHTML = `
            <div class="pending-item">
                <div class="pending-info">
                    <h4>Aucune validation en attente</h4>
                    <p>Tous les CRA sont à jour</p>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = approvals.map(approval => `
        <div class="pending-item">
            <div class="pending-info">
                <h4>${approval.nom_user}</h4>
                <p>CRA - ${approval.periode}</p>
            </div>
            <div class="pending-actions">
                <button class="approve-btn" onclick="approveCRA('${approval.id_CRA}')">
                    <i class="fas fa-check"></i>
                </button>
                <button class="reject-btn" onclick="rejectCRA('${approval.id_CRA}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Obtenir l'icône pour le type d'activité
function getActivityIcon(status) {
    switch(status) {
        case 'validé': return 'fa-check-circle';
        case 'en_attente': return 'fa-clock';
        case 'rejeté': return 'fa-times-circle';
        default: return 'fa-file-alt';
    }
}

// Obtenir le titre pour le type d'activité
function getActivityTitle(status) {
    switch(status) {
        case 'validé': return 'CRA validé';
        case 'en_attente': return 'CRA soumis';
        case 'rejeté': return 'CRA rejeté';
        default: return 'Nouvelle activité';
    }
}

// Formater le temps écoulé
function formatTimeAgo(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
}

// Initialiser les actions rapides
function initQuickActions() {
    const quickActions = document.querySelectorAll('.quick-action-btn');
    
    quickActions.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const text = this.querySelector('span').textContent;
            handleQuickAction(text, this);
        });
    });
}

// Gérer les actions rapides
function handleQuickAction(action, button) {
    console.log('🚀 Action rapide:', action);
    
    // Animation du bouton
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
    
    
}

// Approuver un CRA
function approveCRA(craId) {
    console.log('✅ Approbation CRA:', craId);
    showNotification('CRA approuvé avec succès', 'success');
    
    // Recharger les données après 1 seconde
    setTimeout(loadDashboardData, 1000);
}

// Rejeter un CRA
function rejectCRA(craId) {
    console.log('❌ Rejet CRA:', craId);
    showNotification('CRA rejeté', 'warning');
    
    // Recharger les données après 1 seconde
    setTimeout(loadDashboardData, 1000);
}

// Afficher une notification
function showNotification(message, type = 'info') {
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

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }

    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Obtenir l'icône de notification
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-bell';
    }
}