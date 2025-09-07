// CRATECH - Gestion des Utilisateurs

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation
    initUsersPage();
    initSearchAndFilters();
    initTableActions();
    initModal();
    fetchUsersAndRender();
});

// Données des utilisateurs (chargées via API)
let usersData = [];

let filteredUsers = [...usersData];
let currentPage = 1;
const usersPerPage = 10;

// Normaliser une chaîne (minuscules + suppression des accents)
function normalizeString(value) {
    return (value || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}+/gu, '')
        .trim();
}

// Initialisation de la page
function initUsersPage() {
    console.log('🚀 CRATECH - Page utilisateurs initialisée !');
    
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

// Recherche et filtres
function initSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    // Recherche en temps réel (input + keyup pour compatibilité)
    const triggerSearch = () => filterUsers();
    searchInput.addEventListener('input', triggerSearch);
    searchInput.addEventListener('keyup', triggerSearch);
    
    // Filtres par rôle et statut
    roleFilter.addEventListener('change', function() {
        filterUsers();
    });
    
    statusFilter.addEventListener('change', function() {
        filterUsers();
    });
}

// Filtrer les utilisateurs
function filterUsers() {
    const searchTerm = normalizeString(document.getElementById('searchInput').value);
    const roleFilter = normalizeString(document.getElementById('roleFilter').value);
    const statusFilter = normalizeString(document.getElementById('statusFilter').value);
    
    filteredUsers = usersData.filter(user => {
        const nom = normalizeString(user.nom);
        const email = normalizeString(user.email);
        const id = normalizeString(user.id);
        const role = normalizeString(user.role);
        const status = normalizeString(user.status);

        const matchesSearch = !searchTerm ||
            nom.includes(searchTerm) ||
            email.includes(searchTerm) ||
            id.includes(searchTerm) ||
            role.includes(searchTerm) ||
            status.includes(searchTerm);
        
        const matchesRole = !roleFilter || role === roleFilter;
        const matchesStatus = !statusFilter || status === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });
    
    currentPage = 1;
    renderUsersTable();
}

// Actions du tableau
function initTableActions() {
    const selectAll = document.getElementById('selectAll');
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    // Sélection globale
    selectAll.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
    
    // Rafraîchir
    refreshBtn.addEventListener('click', function() {
        this.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.style.transform = '';
            fetchUsersAndRender();
            showNotification('Liste des utilisateurs actualisée', 'success');
        }, 500);
    });
    
    // Exporter
    exportBtn.addEventListener('click', function() {
        showNotification('Export des utilisateurs en cours...', 'info');
        // Simuler l'export
        setTimeout(() => {
            showNotification('Export terminé !', 'success');
        }, 2000);
    });
}

// Charger et rendre
function fetchUsersAndRender() {
    fetch('/api/public/users', { credentials: 'same-origin' })
        .then(res => res.json())
        .then(data => {
            usersData = (data.users || []).map(u => ({
                id: u.id_user,
                nom: u.nom_user,
                email: u.email_user,
                role: u.role,
                status: u.status,
                createdAt: u.created_at
            }));
            filteredUsers = [...usersData];
            currentPage = 1;
            renderUsersTable();
        })
        .catch(err => {
            console.error('Erreur de chargement des utilisateurs:', err);
            showNotification('Impossible de charger les utilisateurs', 'error');
        });
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const pageUsers = filteredUsers.slice(startIndex, endIndex);

    tbody.innerHTML = '';
    if (pageUsers.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="8" style="text-align:center;color:var(--gray-500);padding:2rem;">Aucun utilisateur trouvé</td>`;
        tbody.appendChild(emptyRow);
    } else {
        pageUsers.forEach(user => tbody.appendChild(createUserRow(user)));
    }

    updatePagination();
}

// Créer une ligne d'utilisateur
function createUserRow(user) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <input type="checkbox" class="user-checkbox">
        </td>
        <td>
            <span class="user-id">${user.id}</span>
        </td>
        <td>
            <div class="user-info">
                <div class="user-avatar-small">
                    <i class="fas ${getRoleIcon(user.role)}"></i>
                </div>
                <span class="user-name">${user.nom}</span>
            </div>
        </td>
        <td>
            <span class="user-email">${user.email}</span>
        </td>
        <td>
            <span class="role-badge role-${user.role}">${getRoleLabel(user.role)}</span>
        </td>
        <td>
            <span class="status-badge status-${user.status}">${getStatusLabel(user.status)}</span>
        </td>
        <td>
            <span class="date-created">${formatDate(user.createdAt)}</span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="action-btn edit-btn" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn ${user.status === 'actif' ? 'deactivate-btn' : 'activate-btn'}" 
                        onclick="toggleUserStatus('${user.id}', '${user.status}')">
                    <i class="fas ${user.status === 'actif' ? 'fa-user-slash' : 'fa-user-check'}"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Obtenir l'icône du rôle
function getRoleIcon(role) {
    switch(role) {
        case 'administrateur': return 'fa-user-shield';
        case 'validateur': return 'fa-user-check';
        case 'employé': return 'fa-user';
        case 'sous-traitant': return 'fa-user-tie';
        default: return 'fa-user';
    }
}

// Obtenir le label du rôle
function getRoleLabel(role) {
    switch(role) {
        case 'administrateur': return 'Administrateur';
        case 'validateur': return 'Validateur';
        case 'employé': return 'Employé';
        case 'sous-traitant': return 'Sous-traitant';
        default: return role;
    }
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

// Mettre à jour la pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    // Event listeners pour la pagination
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderUsersTable();
        }
    };
    
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderUsersTable();
        }
    };
}

// Actions sur les utilisateurs
function editUser(userId) {
    showNotification(`Modification de l'utilisateur ${userId}`, 'info');
    // Rediriger vers la page d'édition
    window.location.href = `/admin/users/${userId}/edit`;
}

function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'actif' ? 'inactif' : 'actif';
    const action = newStatus === 'actif' ? 'activer' : 'désactiver';
    
    showConfirmModal(
        `${action.charAt(0).toUpperCase() + action.slice(1)} l'utilisateur`,
        `Êtes-vous sûr de vouloir ${action} cet utilisateur ?`,
        () => {
            // Mettre à jour le statut
            const user = usersData.find(u => u.id === userId);
            if (user) {
                user.status = newStatus;
                loadUsers();
                showNotification(`Utilisateur ${action}é avec succès`, 'success');
            }
        }
    );
}

function deleteUser(userId) {
    showConfirmModal(
        'Supprimer l\'utilisateur',
        'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.',
        () => {
            // Supprimer l'utilisateur
            usersData = usersData.filter(u => u.id !== userId);
            filterUsers();
            showNotification('Utilisateur supprimé avec succès', 'success');
        }
    );
}

// Modal de confirmation
function initModal() {
    const modal = document.getElementById('confirmModal');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelBtn');
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Fermer en cliquant à l'extérieur
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const titleElement = modal.querySelector('h3');
    const messageElement = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmBtn');
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    // Supprimer les anciens event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Ajouter le nouvel event listener
    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        closeModal();
    });
    
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'none';
}

// Fonction pour afficher les notifications (réutilisée du dashboard)
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
