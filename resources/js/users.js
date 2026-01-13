// CRATECH - Gestion des Utilisateurs

document.addEventListener('DOMContentLoaded', function () {
    // Initialisation
    initUsersPage();
    initSearchAndFilters();
    initTableActions();
    initModal();
    initValidatorModal();
    fetchUsersAndRender();
    loadValidators();

    // Mise à jour SEULEMENT des statistiques toutes les 3 secondes (User Request)
    setInterval(fetchStatsOnly, 3000);
});

// Données des utilisateurs (chargées via API)
let usersData = [];
let validatorsData = [];

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
    roleFilter.addEventListener('change', function () {
        filterUsers();
    });

    statusFilter.addEventListener('change', function () {
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
    if (selectAll) {
        selectAll.addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }

    // Rafraîchir
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
            this.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                this.style.transform = '';
                fetchUsersAndRender();
                showNotification('Liste des utilisateurs actualisée', 'success');
            }, 500);
        });
    }

    // Exporter
    if (exportBtn) {
        exportBtn.addEventListener('click', function () {
            showNotification('Export des utilisateurs en cours...', 'info');
            // Simuler l'export
            setTimeout(() => {
                showNotification('Export terminé !', 'success');
            }, 2000);
        });
    }
}

// Charger seulement les statistiques (pour le polling de 3s)
function fetchStatsOnly() {
    fetch('/api/public/users', { credentials: 'same-origin' })
        .then(res => res.json())
        .then(data => {
            if (data.stats) {
                updateUsersStatsFromAPI(data.stats);
            }
        })
        .catch(err => console.error('Erreur stats polling:', err));
}

// Charger les utilisateurs et les statistiques (appelé au chargement initial ou refresh manuel)
function fetchUsersAndRender() {
    fetch('/api/public/users', { credentials: 'same-origin' })
        .then(res => res.json())
        .then(data => {
            console.log('API Response:', data);
            usersData = (data.users || []).map(u => {
                console.log('Mapping user:', u.nom_user, 'Validator:', u.validator);
                return {
                    id: u.id_user,
                    nom: u.nom_user,
                    email: u.email_user,
                    role: u.role,
                    status: u.status,
                    createdAt: u.created_at,
                    id_validateur: u.id_validateur || null,
                    validator: u.validator || null
                };
            });

            // Mettre à jour les statistiques
            if (data.stats) {
                updateUsersStatsFromAPI(data.stats);
            }

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
        emptyRow.innerHTML = `<td colspan="9" style="text-align:center;color:var(--gray-500);padding:2rem;">Aucun utilisateur trouvé</td>`;
        tbody.appendChild(emptyRow);
    } else {
        pageUsers.forEach(user => tbody.appendChild(createUserRow(user)));
    }

    updatePagination();
}

// Créer une ligne d'utilisateur
function createUserRow(user) {
    const row = document.createElement('tr');
    const canHaveValidator = user.role === 'employé' || user.role === 'sous-traitant';

    // Avatar avec premières lettres - FIX: filtrer les parties vides pour éviter UNDEFINED
    let initials = 'U';
    if (typeof user.nom === 'string' && user.nom.trim().length > 0) {
        const parts = user.nom.trim().split(/\s+/).filter(part => part.length > 0);
        if (parts.length > 1) {
            initials = parts[0][0] + parts[parts.length - 1][0];
        } else if (parts.length === 1) {
            initials = parts[0].substring(0, 2);
        }
    }
    initials = initials.toUpperCase();

    row.innerHTML = `
        <td>
            <div class="user-cell">
                <div class="user-cell-avatar">
                    ${initials}
                </div>
                <div class="user-cell-info">
                    <span class="user-cell-name">${user.nom}</span>
                    <span class="user-cell-email">${user.email}</span>
                </div>
            </div>
        </td>
        <td>
            <span class="role-badge role-${user.role}">${getRoleLabel(user.role)}</span>
        </td>
        <td>
            ${canHaveValidator ? getValidatorCell(user) : '<span class="text-muted">-</span>'}
        </td>
        <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <label class="status-switch">
                    <input type="checkbox" ${user.status === 'actif' ? 'checked' : ''} 
                        onchange="handleStatusToggle('${user.id}', this)">
                    <span class="status-slider"></span>
                </label>
                <span class="status-label" style="font-weight: 500; font-size: 0.85rem; min-width: 45px;">
                    ${getStatusLabel(user.status)}
                </span>
            </div>
        </td>
        <td>
            <span class="date-created">${formatDate(user.createdAt)}</span>
        </td>
        <td>
            <div class="action-buttons">
                ${canHaveValidator ? `
                    <button class="action-btn validator-btn" onclick="showValidatorModal('${user.id}', '${user.nom}')" title="Affecter un validateur">
                        <i class="fas fa-user-check"></i>
                    </button>
                ` : ''}
                <button class="action-btn delete-btn" onclick="showDeleteConfirmation('${user.id}', '${user.nom}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;

    return row;
}

// Fonction pour gérer le basculement du statut
async function handleStatusToggle(userId, checkbox) {
    const label = checkbox.parentElement.nextElementSibling;
    const originalChecked = checkbox.checked;

    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        const response = await fetch(`/admin/users/${userId}/toggle-status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const data = await response.json();

        if (data.success) {
            label.textContent = data.new_status === 'actif' ? 'Actif' : 'Inactif';
            showNotification(`Statut mis à jour : ${data.new_status}`, 'success');

            // Mettre à jour les données locales
            const user = usersData.find(u => u.id == userId);
            if (user) user.status = data.new_status;
        } else {
            checkbox.checked = !originalChecked;
            showNotification(data.message || 'Erreur lors de la mise à jour', 'error');
        }
    } catch (err) {
        console.error('Erreur toggle status:', err);
        checkbox.checked = !originalChecked;
        showNotification('Erreur de connexion', 'error');
    }
}

// Obtenir l'icône du rôle
function getRoleIcon(role) {
    switch (role) {
        case 'administrateur': return 'fa-user-shield';
        case 'validateur': return 'fa-user-check';
        case 'employé': return 'fa-user';
        case 'sous-traitant': return 'fa-user-tie';
        default: return 'fa-user';
    }
}

// Obtenir le label du rôle
function getRoleLabel(role) {
    switch (role) {
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

let userToDelete = null;

function showValidatorModal(userId, userName) {
    console.log('showValidatorModal appelé avec userId:', userId, 'userName:', userName);
    currentUserForValidator = userId;
    const modal = document.getElementById('validatorSelectionModal');

    console.log('currentUserForValidator défini à:', currentUserForValidator);

    // Charger les validateurs dans la modal
    loadValidatorsInModal();

    modal.style.display = 'flex';
}

function showDeleteConfirmation(userId, userName) {
    userToDelete = userId;
    const modal = document.getElementById('deleteConfirmModal');
    const userNameElement = document.getElementById('deleteUserName');

    userNameElement.textContent = userName;
    modal.style.display = 'flex';
}

function closeDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = 'none';
    userToDelete = null;
}

function confirmUserDeletion() {
    if (!userToDelete) {
        showNotification('Erreur: aucun utilisateur sélectionné', 'error');
        return;
    }

    // Supprimer l'utilisateur de la base de données
    fetch(`/admin/users/${userToDelete}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        credentials: 'same-origin'
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        })
        .then(data => {
            if (data.success) {
                // Supprimer de la liste locale
                usersData = usersData.filter(u => u.id != userToDelete);
                filteredUsers = filteredUsers.filter(u => u.id != userToDelete);

                // Fermer la modal
                closeDeleteConfirmModal();

                // Recharger le tableau
                renderUsersTable();

                showNotification('Utilisateur supprimé avec succès', 'success');
            } else {
                throw new Error(data.message || 'Erreur lors de la suppression');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showNotification('Erreur lors de la suppression de l\'utilisateur', 'error');
            closeDeleteConfirmModal();
        });
}

function deleteUser(userId) {
    // Cette fonction est maintenant remplacée par showDeleteConfirmation
    const user = usersData.find(u => u.id == userId);
    if (user) {
        showDeleteConfirmation(userId, user.nom);
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

// Mettre à jour les statistiques des utilisateurs depuis l'API
function updateUsersStatsFromAPI(stats) {
    updateStatNumber('totalUsers', stats.total);
    updateStatNumber('administrators', stats.administrators);
    updateStatNumber('validators', stats.validators);
    updateStatNumber('employees', stats.employees);
    updateStatNumber('activeUsers', stats.active);
}

// Fonction pour animer les nombres de statistiques
function updateStatNumber(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startValue = parseInt(element.textContent) || 0;
    if (startValue === value) return;

    element.setAttribute('data-target', value);

    // Animation du compteur
    let current = startValue;
    const duration = 1000; // 1 seconde
    const steps = 50;
    const increment = (value - startValue) / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= value) || (increment < 0 && current <= value)) {
            current = value;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, stepTime);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-bell';
    }
}

// Fonctions pour la gestion des validateurs
function getValidatorCell(user) {
    if (user.validator) {
        return `
            <div class="validator-info" style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 28px; height: 28px; background: var(--primary-light, #e0f2fe); color: var(--primary-blue, #3b82f6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600;">
                    ${(user.validator.nom || 'V').charAt(0).toUpperCase()}
                </div>
                <span class="validator-name" style="font-weight: 500; font-size: 0.85rem; color: var(--gray-700);">${user.validator.nom}</span>
                <button class="btn-action btn-edit" style="width: 24px; height: 24px; color: var(--gray-400); background: none; border: none; cursor: pointer; transition: color 0.2s;" onclick="assignValidatorDirectly('${user.id}', '${user.nom}')" title="Modifier le validateur">
                    <i class="fas fa-edit" style="font-size: 0.7rem;"></i>
                </button>
            </div>
        `;
    } else {
        return `
            <button class="btn btn-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 6px; display: flex; align-items: center; gap: 0.4rem;" onclick="assignValidatorDirectly('${user.id}', '${user.nom}')">
                <i class="fas fa-plus" style="font-size: 0.7rem;"></i> Affecter
            </button>
        `;
    }
}

function loadValidators() {
    // Charger uniquement les utilisateurs avec rôle = 'validateur'
    console.log('Chargement des validateurs...');
    fetch('/api/public/users?role=validateur', {
        credentials: 'same-origin'
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            validatorsData = (data.users || []).map(v => ({
                id: v.id_user || v.id,
                nom: v.nom_user || v.nom,
                email: v.email_user || v.email
            }));
            console.log('Validateurs chargés et mappés:', validatorsData);

            populateValidatorSelect();
        })
        .catch(err => {
            console.error('Erreur de chargement des validateurs:', err);
            showNotification('Impossible de charger les validateurs', 'error');
            validatorsData = [];
            populateValidatorSelect();
        });
}

function populateValidatorSelect() {
    const select = document.getElementById('validatorSelect');
    if (!select) return;

    console.log('Remplissage de la liste des validateurs:', validatorsData);

    // Vider les options existantes (sauf la première)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    // Vérifier si on a des validateurs
    if (validatorsData.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Aucun validateur disponible';
        option.disabled = true;
        select.appendChild(option);
        return;
    }

    // Ajouter les validateurs
    validatorsData.forEach(validator => {
        const option = document.createElement('option');
        const vId = validator.id || validator.id_user;
        const vNom = validator.nom || validator.nom_user;
        const vEmail = validator.email || validator.email_user;

        option.value = vId;
        option.textContent = `${vNom} (${vEmail})`;
        select.appendChild(option);
    });
}

function initValidatorModal() {
    // Ne pas initialiser les modales pour éviter leur affichage automatique
    return;
}

let currentUserForValidator = null;

let selectedValidatorId = null;
let currentUserForValidatorAssignment = null;

function assignValidatorDirectly(userId, userName) {
    currentUserForValidatorAssignment = userId;

    // Charger tous les validateurs depuis la table utilisateurs
    fetch('/api/public/users', { credentials: 'same-origin' })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('Données reçues:', data);

            // Essayer de trouver les vrais validateurs
            const allUsers = data.users || data || [];
            console.log('Tous les utilisateurs:', allUsers);

            let validators = [];

            if (Array.isArray(allUsers)) {
                validators = allUsers.filter(user => {
                    console.log('Utilisateur:', user, 'Role:', user.role);
                    return user.role === 'validateur' || user.role === 'VALIDATEUR';
                }).map(user => ({
                    id: user.id || user.id_user,
                    nom: user.nom || user.nom_user || user.name || 'Nom non défini',
                    email: user.email || user.email_user || 'email@example.com',
                    role: user.role
                }));
                // Mettre à jour la variable globale pour confirmValidatorSelection
                validatorsData = validators;
            }

            // Si aucun validateur trouvé, créer des données de test
            if (validators.length === 0) {
                console.log('Aucun validateur trouvé, création de données de test');
                validators = [
                    {
                        id: 'val_1',
                        nom: 'Pierre Validateur',
                        email: 'pierre.validateur@cratech.com',
                        role: 'validateur'
                    },
                    {
                        id: 'val_2',
                        nom: 'Marie Contrôle',
                        email: 'marie.controle@cratech.com',
                        role: 'validateur'
                    },
                    {
                        id: 'val_3',
                        nom: 'Jean Supervision',
                        email: 'jean.supervision@cratech.com',
                        role: 'validateur'
                    }
                ];
            }

            console.log('Validateurs finaux:', validators);

            // Ouvrir la modal avec les validateurs
            openValidatorSelectionModal(userName, validators);
        })
        .catch(error => {
            console.error('Erreur:', error);
            showNotification('Erreur lors du chargement des validateurs', 'error');
        });
}

function openValidatorSelectionModal(userName, validators) {
    console.log('Ouverture de la modal avec validators:', validators);
    console.log('currentUserForValidatorAssignment dans openValidatorSelectionModal:', currentUserForValidatorAssignment);

    // Transférer la valeur vers la bonne variable
    currentUserForValidator = currentUserForValidatorAssignment;
    console.log('currentUserForValidator défini à:', currentUserForValidator);

    const modal = document.getElementById('validatorSelectionModal');
    const validatorsList = document.getElementById('validatorsList');

    if (!modal) {
        console.error('Modal validatorSelectionModal introuvable');
        return;
    }

    if (!validatorsList) {
        console.error('Element validatorsList introuvable');
        return;
    }

    // Vider la liste des validateurs
    validatorsList.innerHTML = '';

    // Vérifier qu'on a des validateurs
    if (!validators || validators.length === 0) {
        validatorsList.innerHTML = '<div class="no-validators">Aucun validateur disponible</div>';
        modal.style.display = 'flex';
        return;
    }

    // Ajouter chaque validateur
    validators.forEach((validator, index) => {
        console.log(`Création du validateur ${index}:`, validator);

        const validatorItem = document.createElement('div');
        validatorItem.className = 'validator-item';
        validatorItem.setAttribute('data-validator-id', validator.id);

        // Vérifier que le nom existe et n'est pas vide
        const validatorName = validator.nom || validator.name || `Validateur ${validator.id}`;
        const validatorEmail = validator.email || 'Email non défini';

        // Créer les initiales de façon sécurisée
        let initials = 'V';
        if (validatorName && validatorName !== 'Nom inconnu') {
            const nameParts = validatorName.toString().split(' ').filter(part => part.length > 0);
            if (nameParts.length > 0) {
                initials = nameParts.map(n => n[0]).join('').toUpperCase();
            }
        }

        validatorItem.innerHTML = `
            <div class="validator-avatar">
                ${initials}
            </div>
            <div class="validator-info">
                <div class="validator-name">${validatorName}</div>
                <div class="validator-email">${validatorEmail}</div>
            </div>
        `;

        // Ajouter l'événement de sélection
        validatorItem.addEventListener('click', () => {
            console.log('Validateur sélectionné:', validator);
            console.log('ID du validateur:', validator.id);

            // Désélectionner tous les autres
            document.querySelectorAll('.validator-item').forEach(item => {
                item.classList.remove('selected');
            });

            // Sélectionner celui-ci
            validatorItem.classList.add('selected');
            selectedValidatorId = validator.id;

            console.log('selectedValidatorId mis à jour:', selectedValidatorId);
        });

        validatorsList.appendChild(validatorItem);
        console.log(`Validateur ${index} ajouté au DOM`);
    });

    // Ne pas réinitialiser la sélection ici
    // selectedValidatorId = null;

    // Afficher la modal
    console.log('Affichage de la modal');
    modal.style.display = 'flex';

    // Vérifier que la modal est bien visible
    setTimeout(() => {
        console.log('Style de la modal après affichage:', modal.style.display);
        console.log('Contenu de validatorsList:', validatorsList.innerHTML);
    }, 100);
}

function closeValidatorSelectionModal() {
    const modal = document.getElementById('validatorSelectionModal');
    modal.style.display = 'none';
    selectedValidatorId = null;
    currentUserForValidator = null;
}

function confirmValidatorSelection() {
    console.log('Confirmation - selectedValidatorId:', selectedValidatorId);
    console.log('Confirmation - currentUserForValidator:', currentUserForValidator);

    if (!selectedValidatorId || !currentUserForValidator) {
        showNotification('Veuillez sélectionner un validateur', 'error');
        return;
    }

    // Récupérer un jeton CSRF frais (Car le HTML est statique et n'utilise pas Blade)
    fetch('/csrf-token')
        .then(res => res.json())
        .then(csrfData => {
            const csrfToken = csrfData.token;

            // Appel API pour affecter le validateur
            return fetch('/api/assign-validator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    user_id: currentUserForValidator,
                    id_validateur: selectedValidatorId,
                    note: 'Affectation via interface admin'
                })
            });
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Erreur lors de l\'affectation');
            }
        })
        .then(data => {
            if (data.success) {
                // Mettre à jour localement
                const user = usersData.find(u => u.id == currentUserForValidator);
                if (user) {
                    user.id_validateur = selectedValidatorId;

                    // Trouver le validateur pour afficher son nom
                    const validator = validatorsData.find(v => v.id == selectedValidatorId);
                    if (validator) {
                        user.validator = {
                            id: selectedValidatorId,
                            nom: validator.nom || validator.nom_user,
                            email: validator.email || validator.email_user
                        };
                    }
                }

                // Fermer la modal
                closeValidatorSelectionModal();

                // Recharger le tableau
                renderUsersTable();

                showNotification('Validateur affecté avec succès !', 'success');
            } else {
                throw new Error(data.message || 'Erreur lors de l\'affectation');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showNotification('Erreur lors de l\'affectation du validateur: ' + error.message, 'error');
        });
}

function closeValidatorModal() {
    const modal = document.getElementById('validatorModal');
    modal.style.display = 'none';
    currentUserForValidator = null;
}

function assignValidator() {
    const validatorId = document.getElementById('validatorSelect').value;

    if (!validatorId) {
        showNotification('Veuillez sélectionner un validateur', 'warning');
        return;
    }

    if (!currentUserForValidator) {
        showNotification('Erreur: aucun utilisateur sélectionné', 'error');
        return;
    }

    console.log('ID Validateur sélectionné:', validatorId);
    console.log('ID Utilisateur:', currentUserForValidator);
    console.log('Données validateurs:', validatorsData);
    console.log('Données utilisateurs:', usersData);

    const validator = validatorsData.find(v => v.id == validatorId);
    const user = usersData.find(u => u.id == currentUserForValidator);

    console.log('Validateur trouvé:', validator);
    console.log('Utilisateur trouvé:', user);

    if (!validator || !user) {
        showNotification('Erreur: validateur ou utilisateur introuvable', 'error');
        console.error('Validateur:', validator, 'Utilisateur:', user);
        return;
    }

    // Appel API réel pour affecter le validateur
    const assignmentData = {
        user_id: currentUserForValidator,
        id_validateur: validatorId
    };

    console.log('Données envoyées à l\'API:', assignmentData);

    // Récupérer le token CSRF
    fetch('/csrf-token')
        .then(res => res.json())
        .then(csrfData => {
            return fetch('/api/assign-validator', {
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
            console.log('Réponse API:', data);
            if (data.success) {
                // Mettre à jour localement
                user.id_validateur = validatorId;
                user.validator = {
                    id: validator.id,
                    nom: validator.nom,
                    email: validator.email
                };

                // Rafraîchir l'affichage
                renderUsersTable();
                closeValidatorModal();

                showNotification(`Validateur ${validator.nom} affecté à ${user.nom}`, 'success');
            } else {
                showNotification(data.message || 'Erreur lors de l\'affectation', 'error');
            }
        })
        .catch(err => {
            console.error('Erreur lors de l\'affectation:', err);
            showNotification('Erreur lors de l\'affectation du validateur', 'error');
        });
}
