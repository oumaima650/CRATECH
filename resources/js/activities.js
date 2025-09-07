// CRATECH - Gestion des Activités

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation
    initActivitiesPage();
    initSearchAndFilters();
    initTableActions();
    initModal();
    fetchActivitiesAndRender();
});

// Données des activités (chargées via API)
let activitiesData = [];
let filteredActivities = [];
let currentPage = 1;
const activitiesPerPage = 10;

// Initialisation de la page
function initActivitiesPage() {
    console.log('🚀 CRATECH - Page activités initialisée !');

    // Animation d'entrée
    const cards = document.querySelectorAll('.stat-card, .filters-section, .users-table-container');
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

// Normaliser une chaîne (minuscules, sans accents)
function normalizeString(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Recherche et filtres
function initSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const sortBy = document.getElementById('sortBy');

    if (searchInput) {
        searchInput.addEventListener('input', filterAndRenderActivities);
        searchInput.addEventListener('keyup', filterAndRenderActivities);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterAndRenderActivities);
    }
    if (sortBy) {
        sortBy.addEventListener('change', filterAndRenderActivities);
    }
}

// Filtrer et rendre les activités
function filterAndRenderActivities() {
    const searchTerm = normalizeString(document.getElementById('searchInput').value.trim());
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    filteredActivities = activitiesData.filter(activity => {
        const nom = normalizeString(activity.nom_act || '');
        const description = normalizeString(activity.description || '');
        const id = normalizeString(activity.id_activité || '');
        const status = normalizeString(activity.status || '');

        const matchesSearch = !searchTerm ||
            nom.includes(searchTerm) ||
            description.includes(searchTerm) ||
            id.includes(searchTerm);

        const matchesStatus = !statusFilter || normalizeString(activity.status) === normalizeString(statusFilter);

        return matchesSearch && matchesStatus;
    });

    // Trier les résultats
    if (sortBy) {
        filteredActivities.sort((a, b) => {
            switch(sortBy) {
                case 'nom_act':
                    return a.nom_act.localeCompare(b.nom_act);
                case 'created_at':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });
    }

    currentPage = 1; // Reset to first page on filter/search
    renderActivitiesTable();
    updatePagination();
    updateStats();
}

// Actions du tableau
function initTableActions() {
    const selectAll = document.getElementById('selectAll');
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');

    if (selectAll) {
        // Sélection globale
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }

    if (refreshBtn) {
        // Rafraîchir
        refreshBtn.addEventListener('click', function() {
            this.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                this.style.transform = '';
                fetchActivitiesAndRender();
                showNotification('Liste des activités actualisée', 'success');
            }, 500);
        });
    }

    if (exportBtn) {
        // Exporter
        exportBtn.addEventListener('click', function() {
            showNotification('Export des activités en cours...', 'info');
            // Simuler l'export
            setTimeout(() => {
                showNotification('Export terminé !', 'success');
            }, 2000);
        });
    }
}

// Charger les activités depuis l'API et les rendre
function fetchActivitiesAndRender() {
    fetch('/api/public/activities', { credentials: 'same-origin' })
        .then(res => res.json())
        .then(data => {
            activitiesData = (data.activities || []).map(a => ({
                id_activité: a.id_activité,
                nom_act: a.nom_act,
                description: a.description,
                status: a.status,
                created_at: a.created_at,
                assigned_users: a.assigned_users || 0
            }));
            filterAndRenderActivities();
        })
        .catch(err => {
            console.error('Erreur de chargement des activités:', err);
            showNotification("Impossible de charger les activités", 'error');
        });
}

// Rendre le tableau des activités
function renderActivitiesTable() {
    const tbody = document.getElementById('activitiesTableBody');
    if (!tbody) return;

    const startIndex = (currentPage - 1) * activitiesPerPage;
    const endIndex = startIndex + activitiesPerPage;
    const pageActivities = filteredActivities.slice(startIndex, endIndex);

    tbody.innerHTML = '';
    if (pageActivities.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="8" style="text-align:center;color:var(--gray-500);padding:2rem;">Aucune activité trouvée</td>`;
        tbody.appendChild(emptyRow);
    } else {
        pageActivities.forEach(activity => tbody.appendChild(createActivityRow(activity)));
    }
}

// Créer une ligne d'activité
function createActivityRow(activity) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <input type="checkbox" class="user-checkbox">
        </td>
        <td>
            <span class="user-id">${activity.id_activité}</span>
        </td>
        <td>
            <div class="user-info">
                <div class="user-avatar-small">
                    <i class="fas fa-tasks"></i>
                </div>
                <span class="user-name">${activity.nom_act}</span>
            </div>
        </td>
        <td>
            <span class="user-email">${activity.description || 'Aucune description'}</span>
        </td>
        <td>
            <span class="status-badge status-${activity.status}">${getStatusLabel(activity.status)}</span>
        </td>
        <td>
            <span class="assigned-users">${activity.assigned_users}</span>
        </td>
        <td>
            <span class="date-created">${formatDate(activity.created_at)}</span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="action-btn edit-btn" onclick="editActivity('${activity.id_activité}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn ${activity.status === 'actif' ? 'deactivate-btn' : 'activate-btn'}"
                        onclick="toggleActivityStatus('${activity.id_activité}', '${activity.status}')">
                    <i class="fas ${activity.status === 'actif' ? 'fa-pause' : 'fa-play'}"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteActivity('${activity.id_activité}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;

    return row;
}

// Obtenir le label du statut
function getStatusLabel(status) {
    return status === 'actif' ? 'Actif' : 'Inactif';
}

// Formater la date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

// Mettre à jour les statistiques
function updateStats() {
    const totalActivities = activitiesData.length;
    const activeActivities = activitiesData.filter(a => a.status === 'actif').length;
    const inactiveActivities = activitiesData.filter(a => a.status === 'inactif').length;
    const assignedUsers = activitiesData.reduce((sum, a) => sum + (a.assigned_users || 0), 0);

    document.getElementById('totalActivities').textContent = totalActivities;
    document.getElementById('activeActivities').textContent = activeActivities;
    document.getElementById('inactiveActivities').textContent = inactiveActivities;
    document.getElementById('assignedUsers').textContent = assignedUsers;
}

// Mettre à jour la pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (currentPageSpan) currentPageSpan.textContent = currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    // Event listeners pour la pagination
    if (prevBtn) {
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderActivitiesTable();
                updatePagination();
            }
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderActivitiesTable();
                updatePagination();
            }
        };
    }
}

// Actions sur les activités
function editActivity(activityId) {
    showNotification(`Modification de l'activité ${activityId}`, 'info');
    // Rediriger vers la page d'édition
    window.location.href = `/admin/activities/${activityId}/edit`;
}

function toggleActivityStatus(activityId, currentStatus) {
    const newStatus = currentStatus === 'actif' ? 'inactif' : 'actif';
    const action = newStatus === 'actif' ? 'activer' : 'désactiver';

    showConfirmModal(
        `${action.charAt(0).toUpperCase() + action.slice(1)} l'activité`,
        `Êtes-vous sûr de vouloir ${action} cette activité ?`,
        () => {
            // Mettre à jour le statut
            const activity = activitiesData.find(a => a.id_activité === activityId);
            if (activity) {
                activity.status = newStatus;
                filterAndRenderActivities();
                showNotification(`Activité ${action}ée avec succès`, 'success');
            }
        }
    );
}

function deleteActivity(activityId) {
    showConfirmModal(
        'Supprimer l\'activité',
        'Êtes-vous sûr de vouloir supprimer cette activité ? Cette action est irréversible.',
        () => {
            // Supprimer l'activité
            activitiesData = activitiesData.filter(a => a.id_activité !== activityId);
            filterAndRenderActivities();
            showNotification('Activité supprimée avec succès', 'success');
        }
    );
}

// Modal de confirmation
function initModal() {
    const modal = document.getElementById('confirmModal');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelBtn');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Fermer en cliquant à l'extérieur
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;

    const titleElement = modal.querySelector('h3');
    const messageElement = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmBtn');

    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;

    // Supprimer les anciens event listeners
    if (confirmBtn) {
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // Ajouter le nouvel event listener
        newConfirmBtn.addEventListener('click', () => {
            onConfirm();
            closeModal();
        });
    }

    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'none';
}

// Fonction pour afficher les notifications
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

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-bell';
    }
}