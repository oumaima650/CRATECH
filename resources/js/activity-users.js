// CRATECH - Gestion des Utilisateurs Assignés à une Activité

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation
    initActivityUsersPage();
    initSearchAndFilters();
    initTableActions();
    initModals();
    loadActivityInfo();
    fetchAssignedUsersAndRender();
    loadAvailableUsers();
});

// Variables globales
let activityId = null;
let assignedUsersData = [];
let availableUsersData = [];
let filteredUsers = [];
let modalFilteredUsers = [];
let selectedUserIds = [];
let currentPage = 1;
const usersPerPage = 10;

// Initialisation de la page
function initActivityUsersPage() {
    console.log('🚀 CRATECH - Page utilisateurs assignés initialisée !');
    
    // Récupérer l'ID de l'activité depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const pathParts = window.location.pathname.split('/');
    activityId = pathParts[pathParts.indexOf('activities') + 1];
    
    console.log('Activity ID:', activityId);
    
    // Animation d'entrée
    const cards = document.querySelectorAll('.activity-info-card, .stat-card, .filters-section, .users-table-container');
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

// Charger les informations de l'activité
function loadActivityInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const activityName = urlParams.get('name');
    
    if (activityName) {
        document.getElementById('activityName').textContent = `Utilisateurs - ${activityName}`;
        document.getElementById('activityTitle').textContent = activityName;
    }
    
    document.getElementById('activityId').textContent = activityId || 'N/A';
}

// Recherche et filtres
function initSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const roleFilter = document.getElementById('roleFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterAndRenderUsers);
        searchInput.addEventListener('keyup', filterAndRenderUsers);
    }
    if (roleFilter) {
        roleFilter.addEventListener('change', filterAndRenderUsers);
    }
}

// Filtrer et rendre les utilisateurs
function filterAndRenderUsers() {
    const searchTerm = normalizeString(document.getElementById('searchInput').value.trim());
    const roleFilter = document.getElementById('roleFilter').value;
    
    filteredUsers = assignedUsersData.filter(user => {
        const nom = normalizeString(String(user.nom_user || ''));
        const email = normalizeString(String(user.email_user || ''));
        const id = normalizeString(String(user.id_user || ''));
        
        const matchesSearch = !searchTerm ||
            nom.includes(searchTerm) ||
            email.includes(searchTerm) ||
            id.includes(searchTerm);
        
        const matchesRole = !roleFilter || user.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });
    
    currentPage = 1;
    renderAssignedUsersTable();
    updatePagination();
    updateStats();
}

// Normaliser une chaîne
function normalizeString(str) {
    if (!str || typeof str !== 'string') {
        return '';
    }
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Actions du tableau
function initTableActions() {
    const selectAll = document.getElementById('selectAll');
    const refreshBtn = document.getElementById('refreshBtn');
    const addUserBtn = document.getElementById('addUserBtn');
    
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                this.style.transform = '';
                fetchAssignedUsersAndRender();
                showNotification('Liste actualisée', 'success');
            }, 500);
        });
    }
    
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            openAssignUserModal();
        });
    }
}

// Charger les utilisateurs assignés
function fetchAssignedUsersAndRender() {
    if (!activityId) {
        showNotification('ID d\'activité manquant', 'error');
        return;
    }
    
    fetch(`/api/activities/${activityId}/assigned-users`, { credentials: 'same-origin' })
        .then(res => res.json())
        .then(data => {
            assignedUsersData = data.users || [];
            console.log('Utilisateurs assignés chargés:', assignedUsersData);
            filterAndRenderUsers();
        })
        .catch(err => {
            console.error('Erreur de chargement des utilisateurs assignés:', err);
            // Données de test
            assignedUsersData = [
                {
                    id_user: 1,
                    nom_user: 'Jean Dupont',
                    email_user: 'jean.dupont@cratech.com',
                    role: 'employé',
                    validator_name: 'Marie Martin',
                    assigned_at: '2024-01-15'
                },
                {
                    id_user: 2,
                    nom_user: 'Pierre Durand',
                    email_user: 'pierre.durand@cratech.com',
                    role: 'sous-traitant',
                    validator_name: 'Paul Bertrand',
                    assigned_at: '2024-01-20'
                }
            ];
            filterAndRenderUsers();
        });
}

// Charger les utilisateurs disponibles pour le modal
function loadAvailableUsersForModal() {
    fetch('/api/public/users', { credentials: 'same-origin' })
        .then(res => res.json())
        .then(data => {
            // Filtrer uniquement les employés et sous-traitants
            availableUsersData = (data.users || []).filter(u => 
                u.role === 'employé' || u.role === 'sous-traitant'
            );
            filterAndRenderModalUsers();
        })
        .catch(err => {
            console.error('Erreur de chargement des utilisateurs disponibles:', err);
            availableUsersData = [];
            filterAndRenderModalUsers();
        });
}

// Initialiser les filtres du modal
function initModalFilters() {
    const searchInput = document.getElementById('modalSearchInput');
    const roleFilter = document.getElementById('modalRoleFilter');
    const selectAllCheckbox = document.getElementById('selectAllModalUsers');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterAndRenderModalUsers);
    }
    if (roleFilter) {
        roleFilter.addEventListener('change', filterAndRenderModalUsers);
    }
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', toggleSelectAllModalUsers);
    }
}

// Filtrer et rendre les utilisateurs du modal
function filterAndRenderModalUsers() {
    const searchTerm = normalizeString(document.getElementById('modalSearchInput')?.value.trim() || '');
    const roleFilter = document.getElementById('modalRoleFilter')?.value || '';
    
    // Filtrer les utilisateurs non assignés
    const assignedUserIds = assignedUsersData.map(u => u.id_user);
    const unassignedUsers = availableUsersData.filter(u => !assignedUserIds.includes(u.id_user));
    
    modalFilteredUsers = unassignedUsers.filter(user => {
        const nom = normalizeString(String(user.nom_user || ''));
        const email = normalizeString(String(user.email_user || ''));
        const id = normalizeString(String(user.id_user || ''));
        
        const matchesSearch = !searchTerm ||
            nom.includes(searchTerm) ||
            email.includes(searchTerm) ||
            id.includes(searchTerm);
        
        const matchesRole = !roleFilter || user.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });
    
    renderModalUsersTable();
    updateSelectedCount();
}

// Rendre le tableau des utilisateurs du modal
function renderModalUsersTable() {
    const tbody = document.getElementById('modalUsersTableBody');
    const noUsersMessage = document.getElementById('modalNoUsersMessage');
    const tableContainer = document.querySelector('.modal-users-table-container');
    
    if (!tbody) {
        console.error('Element modalUsersTableBody not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (modalFilteredUsers.length === 0) {
        if (tableContainer) tableContainer.style.display = 'none';
        if (noUsersMessage) noUsersMessage.style.display = 'block';
        return;
    }
    
    if (tableContainer) tableContainer.style.display = 'block';
    if (noUsersMessage) noUsersMessage.style.display = 'none';
    
    modalFilteredUsers.forEach(user => {
        const row = createModalUserRow(user);
        tbody.appendChild(row);
    });
    
    updateSelectAllCheckbox();
}

// Créer une ligne d'utilisateur pour le modal
function createModalUserRow(user) {
    const row = document.createElement('tr');
    const isSelected = selectedUserIds.includes(user.id_user);
    
    if (isSelected) {
        row.classList.add('selected');
    }
    
    row.innerHTML = `
        <td>
            <input type="checkbox" class="modal-user-checkbox" 
                   value="${user.id_user}" ${isSelected ? 'checked' : ''}>
        </td>
        <td>
            <div class="user-info">
                <div class="user-avatar-small">
                    <i class="fas ${getRoleIcon(user.role)}"></i>
                </div>
                <span class="user-name">${user.nom_user}</span>
            </div>
        </td>
        <td>${user.email_user}</td>
        <td>
            <span class="role-badge role-${user.role}">${getRoleLabel(user.role)}</span>
        </td>
    `;
    
    const checkbox = row.querySelector('.modal-user-checkbox');
    checkbox.addEventListener('change', function() {
        toggleUserSelection(user.id_user, this.checked);
    });
    
    return row;
}

// Basculer la sélection d'un utilisateur
function toggleUserSelection(userId, isSelected) {
    if (isSelected) {
        if (!selectedUserIds.includes(userId)) {
            selectedUserIds.push(userId);
        }
    } else {
        selectedUserIds = selectedUserIds.filter(id => id !== userId);
    }
    
    updateSelectedCount();
    updateSelectAllCheckbox();
    updateAssignButton();
    
    // Mettre à jour l'apparence de la ligne
    const checkbox = document.querySelector(`input[value="${userId}"]`);
    if (checkbox) {
        const row = checkbox.closest('tr');
        if (isSelected) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    }
}

// Basculer la sélection de tous les utilisateurs visibles
function toggleSelectAllModalUsers() {
    const selectAllCheckbox = document.getElementById('selectAllModalUsers');
    const isSelectingAll = selectAllCheckbox.checked;
    
    modalFilteredUsers.forEach(user => {
        if (isSelectingAll) {
            if (!selectedUserIds.includes(user.id_user)) {
                selectedUserIds.push(user.id_user);
            }
        } else {
            selectedUserIds = selectedUserIds.filter(id => id !== user.id_user);
        }
    });
    
    renderModalUsersTable();
    updateSelectedCount();
    updateAssignButton();
}

// Mettre à jour la checkbox "Sélectionner tout"
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllModalUsers');
    if (!selectAllCheckbox) return;
    
    const visibleUserIds = modalFilteredUsers.map(u => u.id_user);
    const selectedVisibleUsers = selectedUserIds.filter(id => visibleUserIds.includes(id));
    
    if (selectedVisibleUsers.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedVisibleUsers.length === visibleUserIds.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

// Mettre à jour le compteur de sélection
function updateSelectedCount() {
    const countElement = document.querySelector('.selected-count');
    if (countElement) {
        countElement.textContent = `${selectedUserIds.length} utilisateur(s) sélectionné(s)`;
    }
}

// Mettre à jour le bouton d'assignation
function updateAssignButton() {
    const assignBtn = document.getElementById('assignSelectedBtn');
    if (assignBtn) {
        assignBtn.disabled = selectedUserIds.length === 0;
    }
}

// Rendre le tableau des utilisateurs assignés
function renderAssignedUsersTable() {
    const tbody = document.getElementById('assignedUsersTableBody');
    if (!tbody) return;
    
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const pageUsers = filteredUsers.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    if (pageUsers.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="8" style="text-align:center;color:var(--gray-500);padding:2rem;">Aucun utilisateur assigné</td>`;
        tbody.appendChild(emptyRow);
    } else {
        pageUsers.forEach(user => tbody.appendChild(createUserRow(user)));
    }
}

// Créer une ligne d'utilisateur
function createUserRow(user) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <input type="checkbox" class="user-checkbox">
        </td>
        <td>
            <span class="user-id">${user.id_user}</span>
        </td>
        <td>
            <div class="user-info">
                <div class="user-avatar-small">
                    <i class="fas ${getRoleIcon(user.role)}"></i>
                </div>
                <span class="user-name">${user.nom_user}</span>
            </div>
        </td>
        <td>
            <span class="user-email">${user.email_user}</span>
        </td>
        <td>
            <span class="role-badge role-${user.role}">${getRoleLabel(user.role)}</span>
        </td>
        <td>
            <span class="validator-name">${user.validator_name || '-'}</span>
        </td>
        <td>
            <span class="date-assigned">${formatDate(user.assigned_at)}</span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="action-btn delete-btn" onclick="unassignUser('${user.id_user}', '${user.nom_user}')" title="Désassigner">
                    <i class="fas fa-user-minus"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Obtenir l'icône du rôle
function getRoleIcon(role) {
    switch(role) {
        case 'employé': return 'fa-user';
        case 'sous-traitant': return 'fa-user-tie';
        default: return 'fa-user';
    }
}

// Obtenir le label du rôle
function getRoleLabel(role) {
    switch(role) {
        case 'employé': return 'Employé';
        case 'sous-traitant': return 'Sous-traitant';
        default: return role;
    }
}

// Formater la date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('fr-FR');
}

// Mettre à jour les statistiques
function updateStats() {
    const totalAssigned = assignedUsersData.length;
    const employeesCount = assignedUsersData.filter(u => u.role === 'employé').length;
    const contractorsCount = assignedUsersData.filter(u => u.role === 'sous-traitant').length;
    
    document.getElementById('totalAssigned').textContent = totalAssigned;
    document.getElementById('employeesCount').textContent = employeesCount;
    document.getElementById('contractorsCount').textContent = contractorsCount;
}

// Mettre à jour la pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (currentPageSpan) currentPageSpan.textContent = currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    
    if (prevBtn) {
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderAssignedUsersTable();
                updatePagination();
            }
        };
    }
    
    if (nextBtn) {
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderAssignedUsersTable();
                updatePagination();
            }
        };
    }
}

// Gestion des modals
function initModals() {
    // Ne pas initialiser les modales pour éviter leur affichage automatique
    return;
}

// Ouvrir le modal d'assignation
function openAssignUserModal() {
    const modal = document.getElementById('assignUserModal');
    selectedUserIds = [];
    
    // Charger les utilisateurs disponibles
    loadAvailableUsersForModal();
    
    // Initialiser les filtres du modal
    initModalFilters();
    
    // Afficher le modal
    modal.style.display = 'flex';
    
    // Reset des champs de recherche
    document.getElementById('modalSearchInput').value = '';
    document.getElementById('modalRoleFilter').value = '';
    
    updateSelectedCount();
}

// Fermer le modal d'assignation
function closeAssignUserModal() {
    document.getElementById('assignUserModal').style.display = 'none';
    selectedUserIds = [];
    modalFilteredUsers = [];
    document.getElementById('modalSearchInput').value = '';
    document.getElementById('modalRoleFilter').value = '';
    updateSelectedCount();
}

// Assigner les utilisateurs sélectionnés à l'activité
function assignSelectedUsersToActivity() {
    if (selectedUserIds.length === 0) {
        showNotification('Veuillez sélectionner au moins un utilisateur', 'warning');
        return;
    }
    
    if (!activityId) {
        showNotification('ID d\'activité manquant', 'error');
        return;
    }
    
    const assignmentData = {
        user_ids: selectedUserIds,
        activity_id: activityId
    };
    
    // Récupérer le token CSRF
    fetch('/csrf-token')
        .then(res => res.json())
        .then(csrfData => {
            return fetch('/api/assign-multiple-users-to-activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfData.token
                },
                credentials: 'same-origin',
                body: JSON.stringify(assignmentData)
            });
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                closeAssignUserModal();
                fetchAssignedUsersAndRender();
                const count = selectedUserIds.length;
                showNotification(`${count} utilisateur(s) assigné(s) avec succès`, 'success');
            } else {
                showNotification(data.message || 'Erreur lors de l\'assignation', 'error');
            }
        })
        .catch(err => {
            console.error('Erreur lors de l\'assignation:', err);
            showNotification('Erreur lors de l\'assignation', 'error');
        });
}

// Désassigner un utilisateur
function unassignUser(userId, userName) {
    showConfirmModal(
        'Désassigner l\'utilisateur',
        `Êtes-vous sûr de vouloir désassigner ${userName} de cette activité ?`,
        () => {
            const unassignData = {
                user_id: userId,
                activity_id: activityId
            };
            
            // Récupérer le token CSRF
            fetch('/csrf-token')
                .then(res => res.json())
                .then(csrfData => {
                    return fetch('/api/unassign-user-from-activity', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRF-TOKEN': csrfData.token
                        },
                        credentials: 'same-origin',
                        body: JSON.stringify(unassignData)
                    });
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        fetchAssignedUsersAndRender();
                        showNotification('Utilisateur désassigné avec succès', 'success');
                    } else {
                        showNotification(data.message || 'Erreur lors de la désassignation', 'error');
                    }
                })
                .catch(err => {
                    console.error('Erreur lors de la désassignation:', err);
                    showNotification('Erreur lors de la désassignation', 'error');
                });
        }
    );
}

// Modal de confirmation
function showConfirmModal(title, message, onConfirm) {
    // Ne pas afficher la modal automatiquement
    return;
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
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
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

// Charger les utilisateurs disponibles pour assignation (ancienne fonction pour compatibilité)
function loadAvailableUsers() {
    loadAvailableUsersForModal();
}
