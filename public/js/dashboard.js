// CRATECH - Dashboard Admin avec Chart.js
// Réalisé par l'IA Google DeepMind

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 CRATECH Dashboard - Initialisation Chart.js...');

    // Configuration globale des charts
    Chart.defaults.font.family = "'Inter', 'sans-serif'";
    Chart.defaults.color = '#64748b';
    Chart.defaults.scale.grid.color = '#f1f5f9';

    // Initialiser les composants
    initDashboard();
    initQuickActions();
    loadDashboardStats();

    // Auto-refresh toutes les 30s
    setInterval(loadDashboardStats, 30000);
});

let charts = {}; // Stocker les instances de charts

// Charger les statistiques depuis l'API
function loadDashboardStats() {
    fetch('/api/admin/stats')
        .then(response => response.json())
        .then(data => {
            console.log('📊 Données reçues:', data);

            updateUsersChart(data.users);
            updateCrasStatusChart(data.cras_status);
            updateActivitiesChart(data.activities_status); // New chart
            updateEvolutionChart(data.cras_evolution);
            updateRecentActivities(data.recent_activity);
        })
        .catch(error => {
            console.error('❌ Erreur chargement stats:', error);
            // Fallback pour la démo si API erreur
            // showNotification('Impossible de charger les statistiques', 'error');
        });
}

// 1. Chart Utilisateurs (Doughnut)
function updateUsersChart(data) {
    const ctx = document.getElementById('usersChart').getContext('2d');

    if (charts.users) charts.users.destroy();

    charts.users = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: data.colors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// 2. Chart Statut CRA (Pie)
function updateCrasStatusChart(data) {
    const ctx = document.getElementById('crasStatusChart').getContext('2d');

    if (charts.cras) charts.cras.destroy();

    charts.cras = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: data.colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            }
        }
    });
}

// 3. Chart Statut Activités (Doughnut)
function updateActivitiesChart(data) {
    const ctx = document.getElementById('activitiesChart').getContext('2d');

    if (charts.activities) charts.activities.destroy();

    charts.activities = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: data.colors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// 4. Chart Évolution (Line)
function updateEvolutionChart(data) {
    const ctx = document.getElementById('crasEvolutionChart').getContext('2d');

    if (charts.evolution) charts.evolution.destroy();

    charts.evolution = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: data.datasets.map(ds => ({
                ...ds,
                tension: 0.4, // Courbe lisse
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Fonctions utilitaires (gardées de l'ancien fichier)
function initDashboard() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const clockElement = document.getElementById('current-time');
    if (clockElement) {
        const now = new Date();
        clockElement.textContent = now.toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit'
        });
    }
}

function updateRecentActivities(activities) {
    // Cette fonction n'est plus utilisée pour l'affichage (remplacée par les charts)
    // Mais on peut l'utiliser pour loguer ou mettre à jour un autre élément si besoin
    console.log('Activités récentes:', activities);
}

function initQuickActions() {
    const quickActions = document.querySelectorAll('.quick-action-btn');
    quickActions.forEach(btn => {
        btn.addEventListener('click', function () {
            // Effet de clic
            this.style.transform = 'scale(0.95)';
            setTimeout(() => { this.style.transform = 'scale(1)'; }, 150);
        });
    });
}

// Fonction utilitaire pour notifications
function showNotification(message, type = 'info') {
    // Implémentation basique si nécessaire
    console.log(`[${type.toUpperCase()}] ${message}`);
}
