// CRATECH - Gestion des Activités

document.addEventListener('DOMContentLoaded', function () {
    // Initialisation
    initActivitiesPage();
    initSearchAndFilters();
    initTableActions();
    initModal();
    fetchActivitiesAndRender();

    // Actualisation automatique toutes les 10 secondes (Temps réel)
    setInterval(fetchActivitiesAndRender, 1000);
});

// Données des activités (chargées via API)
let activitiesData = [];
let filteredActivities = [];
let currentPage = 1;
const activitiesPerPage = 10;
let isFirstLoad = true;
let isFetchingActivities = false;

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
    if (!str || typeof str !== 'string') {
        return '';
    }
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
        const nom = normalizeString(String(activity.nom_act || ''));
        const description = normalizeString(String(activity.description || ''));
        const id = normalizeString(String(activity.id_activité || ''));
        const status = normalizeString(String(activity.status || ''));

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
            switch (sortBy) {
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
}

// Actions du tableau
function initTableActions() {
    const selectAll = document.getElementById('selectAll');
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');

    if (selectAll) {
        // Sélection globale
        selectAll.addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }

    if (exportBtn) {
        // Exporter
        exportBtn.addEventListener('click', function () {
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
    if (isFetchingActivities) return;
    isFetchingActivities = true;

    console.log('🔄 Fetching activities from API...');
    fetch(`/api/public/activities?t=${Date.now()}`, { credentials: 'same-origin' })
        .then(res => {
            console.log('API Response status:', res.status);
            return res.json();
        })
        .then(data => {
            console.log('Raw API data:', data);
            activitiesData = (data.activities || []).map(a => ({
                id_activité: a.id_activité || '',
                nom_act: a.nom_act || '',
                description: a.description || '',
                status: a.status || 'inactif',
                created_at: a.created_at || '',
                assigned_users: a.assigned_users || 0
            }));

            // Mettre à jour les statistiques avec les données de l'API
            if (data.stats) {
                updateStatsFromAPI(data.stats);
            }

            console.log('✅ Activités chargées:', activitiesData.length, 'items');
            console.log('Activités data:', activitiesData);
            console.log('Statistiques:', data.stats);
            filterAndRenderActivities();
            isFetchingActivities = false;
        })
        .catch(err => {
            console.error('❌ Erreur de chargement des activités:', err);
            showNotification("Impossible de charger les activités", 'error');
            isFetchingActivities = false;

            // Fallback avec données de test
            console.log('🔧 Using fallback test data');
            activitiesData = [
                {
                    id_activité: '1',
                    nom_act: 'Test Activity 1',
                    description: 'Description test 1',
                    status: 'actif',
                    created_at: '2024-01-01',
                    assigned_users: 2
                },
                {
                    id_activité: '2',
                    nom_act: 'Test Activity 2',
                    description: 'Description test 2',
                    status: 'inactif',
                    created_at: '2024-01-02',
                    assigned_users: 1
                }
            ];
            filterAndRenderActivities();
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
        pageActivities.forEach((activity, index) => tbody.appendChild(createActivityRow(activity, index)));
    }
}

// Créer une ligne d'activité
function createActivityRow(activity, index) {
    const row = document.createElement('tr');
    const rowNumber = ((currentPage - 1) * activitiesPerPage) + index + 1;

    row.innerHTML = `
        <td>
            <div class="user-cell">
                <div class="user-cell-avatar" style="background: var(--gray-100); color: var(--primary-blue);">
                    <i class="fas fa-tasks"></i>
                </div>
                <div class="user-cell-info">
                    <span class="user-cell-name" style="font-weight: 600; color: var(--gray-800);">${activity.nom_act || ''}</span>
                </div>
            </div>
        </td>
        <td>
            <span style="color: var(--gray-600); font-size: 0.85rem; display: block; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${activity.description || ''}">
                ${activity.description || '<span style="color: var(--gray-400);">Aucune description</span>'}
            </span>
        </td>
        <td>
            <span class="status-badge status-${activity.status || 'inactif'}" style="padding: 0.4rem 0.75rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em;">
                ${getStatusLabel(activity.status)}
            </span>
        </td>
        <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 28px; height: 28px; border-radius: 6px; background: var(--gray-50); display: flex; align-items: center; justify-content: center; color: var(--gray-500); border: 1px solid var(--gray-200);">
                    <i class="fas fa-users" style="font-size: 0.75rem;"></i>
                </div>
                <span style="font-weight: 600; color: var(--gray-700);">${activity.assigned_users || 0}</span>
                <button class="btn btn-sm" onclick="viewAssignedUsers('${activity.id_activité}', '${activity.nom_act}')" 
                        style="padding: 0.25rem; min-width: auto; background: none; border: none; color: var(--primary-blue); cursor: pointer;" title="Voir les utilisateurs">
                    <i class="fas fa-external-link-alt" style="font-size: 0.8rem;"></i>
                </button>
            </div>
        </td>
        <td>
            <span style="color: var(--gray-500); font-size: 0.85rem;">${formatDate(activity.created_at)}</span>
        </td>
        <td>
            <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                <button class="btn-action ${activity.status === 'actif' ? 'btn-deactivate' : 'btn-activate'}"
                        onclick="toggleActivityStatus('${activity.id_activité}', '${activity.status}')"
                        title="${activity.status === 'actif' ? 'Désactiver' : 'Activer'}"
                        style="width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--gray-200); background: white; color: ${activity.status === 'actif' ? 'var(--warning)' : 'var(--success)'}; cursor: pointer; transition: all 0.2s;">
                    <i class="fas ${activity.status === 'actif' ? 'fa-pause' : 'fa-play'}" style="font-size: 0.85rem;"></i>
                </button>
                <button class="btn-action btn-delete" onclick="showDeleteActivityConfirmation('${activity.id_activité}', '${activity.nom_act}')"
                        title="Supprimer"
                        style="width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--gray-200); background: white; color: var(--danger); cursor: pointer; transition: all 0.2s;">
                    <i class="fas fa-trash" style="font-size: 0.85rem;"></i>
                </button>
            </div>
        </td>
    `;

    return row;
}

// Obtenir le label du statut
function getStatusLabel(status) {
    if (!status) return 'Inactif';
    return status === 'actif' ? 'Actif' : 'Inactif';
}

// Formater la date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('fr-FR');
}

// Mettre à jour les statistiques depuis l'API
function updateStatsFromAPI(stats) {
    updateStatNumber('totalActivities', stats.total);
    updateStatNumber('activeActivities', stats.active);
    updateStatNumber('inactiveActivities', stats.inactive);

    // Après le premier chargement, on active les animations pour les suivants
    isFirstLoad = false;
}

// Mettre à jour les statistiques (calcul local)
function updateStats() {
    const totalActivities = activitiesData.length;
    const activeActivities = activitiesData.filter(a => a.status === 'actif').length;
    const inactiveActivities = activitiesData.filter(a => a.status === 'inactif').length;

    // Mettre à jour les éléments avec animation
    updateStatNumber('totalActivities', totalActivities);
    updateStatNumber('activeActivities', activeActivities);
    updateStatNumber('inactiveActivities', inactiveActivities);
}



// Fonction pour animer les nombres de statistiques
function updateStatNumber(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const targetVal = parseInt(value) || 0;
    const textContent = element.textContent.trim();
    const currentVal = parseInt(textContent) || 0;

    if (currentVal === targetVal && textContent !== "") return; // Pas de changement

    element.setAttribute('data-target', targetVal);

    // Si c'est le premier chargement ou si la différence est petite, on l'affiche directement
    if (isFirstLoad || Math.abs(targetVal - currentVal) < 2) {
        element.textContent = targetVal;
        return;
    }

    // Animation du compteur (commence à partir de la valeur actuelle)
    let current = currentVal;
    const duration = 800; // ms pour une animation plus fluide
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = (targetVal - currentVal) / steps;
    let iterations = 0;

    // Nettoyer l'intervalle précédent si nécessaire
    if (element._statTimer) clearInterval(element._statTimer);

    element._statTimer = setInterval(() => {
        iterations++;
        current += increment;

        if (iterations >= steps) {
            element.textContent = targetVal;
            clearInterval(element._statTimer);
            delete element._statTimer;
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepDuration);
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

let activityToToggle = null;
let newStatusToSet = null;

function showStatusChangeConfirmation(activityId, currentStatus, activityName) {
    activityToToggle = activityId;
    newStatusToSet = currentStatus === 'actif' ? 'inactif' : 'actif';

    const modal = document.getElementById('statusChangeModal');
    const activityNameElement = document.getElementById('statusChangeActivityName');
    const questionElement = document.getElementById('statusChangeQuestion');
    const descriptionElement = document.getElementById('statusChangeDescription');
    const buttonTextElement = document.getElementById('statusChangeButtonText');

    activityNameElement.textContent = activityName;

    if (newStatusToSet === 'actif') {
        questionElement.textContent = 'Êtes-vous sûr de vouloir activer cette activité ?';
        descriptionElement.textContent = 'Cette activité sera disponible pour les employés.';
        buttonTextElement.textContent = 'Activer';
    } else {
        questionElement.textContent = 'Êtes-vous sûr de vouloir désactiver cette activité ?';
        descriptionElement.textContent = 'Cette activité ne sera plus disponible pour les employés.';
        buttonTextElement.textContent = 'Désactiver';
    }

    modal.style.display = 'flex';
}

function closeStatusChangeModal() {
    const modal = document.getElementById('statusChangeModal');
    modal.style.display = 'none';
    activityToToggle = null;
    newStatusToSet = null;
}

function confirmStatusChange() {
    if (!activityToToggle || !newStatusToSet) {
        showNotification('Erreur: aucune activité sélectionnée', 'error');
        return;
    }

    // Appel API pour changer le statut
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    fetch(`/admin/activities/${activityToToggle}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
            status: newStatusToSet
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mettre à jour le statut dans les données locales
                const activity = activitiesData.find(a => a.id_activité === activityToToggle);
                if (activity) {
                    activity.status = newStatusToSet;
                    filteredActivities = filteredActivities.map(a =>
                        a.id_activité === activityToToggle ? { ...a, status: newStatusToSet } : a
                    );
                }

                // Fermer la modal
                closeStatusChangeModal();

                // Recharger le tableau
                renderActivitiesTable();
                updateStats();

                const action = newStatusToSet === 'actif' ? 'activée' : 'désactivée';
                showNotification(`Activité ${action} avec succès`, 'success');
            } else {
                showNotification(data.message || 'Erreur lors du changement de statut', 'error');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showNotification('Erreur lors du changement de statut', 'error');
        });
}

function toggleActivityStatus(activityId, currentStatus) {
    console.log('toggleActivityStatus called with:', activityId, currentStatus);
    console.log('activitiesData:', activitiesData);
    console.log('Looking for activity with id_activité:', activityId);

    // Essayer différentes méthodes de recherche
    let activity = activitiesData.find(a => a.id_activité === activityId);
    if (!activity) {
        activity = activitiesData.find(a => String(a.id_activité) === String(activityId));
    }
    if (!activity) {
        activity = activitiesData.find(a => a.id === activityId);
    }

    console.log('Found activity:', activity);

    if (activity) {
        showStatusChangeConfirmation(activityId, currentStatus, activity.nom_act);
    } else {
        console.error('Activity not found in activitiesData');
        console.log('Available activity IDs:', activitiesData.map(a => a.id_activité));

        // Fallback: utiliser directement l'ID sans chercher l'activité
        showStatusChangeConfirmation(activityId, currentStatus, `Activité ${activityId}`);
    }
}

let activityToDelete = null;

function showDeleteActivityConfirmation(activityId, activityName) {
    activityToDelete = activityId;
    const modal = document.getElementById('deleteActivityModal');
    const activityNameElement = document.getElementById('deleteActivityName');

    activityNameElement.textContent = activityName;
    modal.style.display = 'flex';
}

function closeDeleteActivityModal() {
    const modal = document.getElementById('deleteActivityModal');
    modal.style.display = 'none';
    activityToDelete = null;
}

function confirmActivityDeletion() {
    if (!activityToDelete) {
        showNotification('Erreur: aucune activité sélectionnée', 'error');
        return;
    }

    // Appel API pour supprimer l'activité
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    fetch(`/admin/activities/${activityToDelete}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Supprimer l'activité des données locales
                activitiesData = activitiesData.filter(a => a.id_activité !== activityToDelete);
                filteredActivities = filteredActivities.filter(a => a.id_activité !== activityToDelete);

                // Fermer la modal
                closeDeleteActivityModal();

                // Recharger le tableau
                renderActivitiesTable();
                updatePagination();
                updateStats();

                showNotification('Activité supprimée avec succès', 'success');
            } else {
                showNotification(data.message || 'Erreur lors de la suppression', 'error');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showNotification('Erreur lors de la suppression de l\'activité', 'error');
        });
}

function deleteActivity(activityId) {
    // Cette fonction est maintenant remplacée par showDeleteActivityConfirmation
    const activity = activitiesData.find(a => a.id_activité === activityId);
    if (activity) {
        showDeleteActivityConfirmation(activityId, activity.nom_act);
    }
}

// Modal de confirmation
function initModal() {
    // Ne pas initialiser les modales pour éviter leur affichage automatique
    return;
}

function showConfirmModal(title, message, onConfirm) {
    // Ne pas afficher la modal automatiquement
    return;
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

// Modal de création d'activité
function openCreateActivityModal() {
    const modal = document.getElementById('createActivityModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('createActivityForm').reset();
    }
}

function closeCreateActivityModal() {
    const modal = document.getElementById('createActivityModal');
    if (modal) modal.style.display = 'none';
}

// Initialisation du formulaire de création (soumission)
document.addEventListener('DOMContentLoaded', function () {
    const createForm = document.getElementById('createActivityForm');
    if (createForm) {
        createForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Désactiver le bouton et afficher le loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création...';

            // Récupérer le token CSRF depuis la meta tag de la page parente si nécessaire
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            fetch('/admin/activities', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: formData,
                credentials: 'same-origin'
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showNotification('Activité créée avec succès !', 'success');
                        closeCreateActivityModal();
                        // Rafraîchir la liste
                        fetchActivitiesAndRender();
                    } else {
                        showNotification(data.message || 'Erreur lors de la création de l\'activité', 'error');
                    }
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
                })
                .finally(() => {
                    // Réactiver le bouton
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                });
        });
    }
});

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-bell';
    }
}

// Fonction pour voir les utilisateurs assignés à une activité
function viewAssignedUsers(activityId, activityName) {
    // Rediriger vers la page de gestion des utilisateurs assignés
    window.location.href = `/admin/activities/${activityId}/users?name=${encodeURIComponent(activityName)}`;
}