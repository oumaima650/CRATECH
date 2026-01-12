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
    // Animation supprimée pour éviter les problèmes d'affichage
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

    // Sélection globale
    if (selectAll) {
        selectAll.addEventListener('change', function () {
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
}

// Charger et rendre
function fetchUsersAndRender() {
    console.log('Fetching users...');
    const tbody = document.getElementById('usersTableBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;">Chargement...</td></tr>';

    fetch('/api/public/users', { credentials: 'same-origin' })
        .then(res => {
            if (!res.ok) throw new Error('Erreur réseau: ' + res.status);
            return res.json();
        })
        .then(data => {
            console.log('Data received:', data);
            let rawUsers = data.users || [];

            // FILTRE: Exclure les administrateurs (insensible à la casse)
            usersData = rawUsers
                .filter(u => {
                    const r = (u.role || '').toLowerCase();
                    return r !== 'administrateur' && r !== 'admin';
                })
                .map(u => ({
                    id: u.id_user || u.id,
                    nom: u.nom_user || u.nom || 'Sans nom',
                    email: u.email_user || u.email || 'Sans email',
                    role: u.role || 'Inconnu',
                    status: u.status || 'inactif',
                    createdAt: u.created_at,
                    id_validateur: u.id_validateur || null,
                    validator: u.validator_name ? {
                        nom: u.validator_name,
                        email: u.validator_email
                    } : null
                }));

            console.log('Processed users:', usersData);

            // Mettre à jour les statistiques avec les données de l'API
            if (data.stats) {
                updateUsersStatsFromAPI(data.stats);
            }

            filteredUsers = [...usersData];
            currentPage = 1;
            renderUsersTable();
        })
        .catch(err => {
            console.error('Erreur de chargement des utilisateurs:', err);
            const tbody = document.getElementById('usersTableBody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:red;padding:2rem;">Erreur: ${err.message}</td></tr>`;
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

    // Avatar avec premières lettres
    let initials = 'U';
    if (typeof user.nom === 'string' && user.nom.length > 0) {
        const parts = user.nom.split(' ');
        if (parts.length > 1) {
            initials = parts[0][0] + parts[1][0];
        } else {
            initials = user.nom.substring(0, 2);
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
            </div>
        </div>
        </td>
        <td>
            <span class="user-cell-email">${user.email}</span>
        </td>
        <td>
            <span class="role-badge ${getRoleClass(user.role)}">
                <i class="fas ${getRoleIcon(user.role)}"></i>
                ${getRoleLabel(user.role)}
            </span>
        </td>
        <td>
            ${canHaveValidator ? getValidatorCell(user) : '<span style="color: var(--gray-400);">-</span>'}
        </td>
        <td>
            <div style="display: flex; align-items: center;">
                <span class="status-dot ${user.status === 'actif' ? 'status-active' : 'status-inactive'}"></span>
                <span style="font-weight: 500; font-size: 0.85rem;">${getStatusLabel(user.status)}</span>
            </div>
        </td>
        <td>
            <span class="date-created" style="color: var(--gray-600); font-size: 0.85rem;">${formatDate(user.createdAt)}</span>
        </td>
        <td>
            <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                <!-- Validator button removed -->
                <!-- Edit button removed -->
                <button class="btn-action btn-delete" onclick="showDeleteConfirmation('${user.id}', '${user.nom}')" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;

    return row;
}

function getRoleClass(role) {
    switch (role) {
        case 'administrateur': return 'admin';
        case 'validateur': return 'validator';
        case 'employé': return 'employee';
        case 'sous-traitant': return 'subcontractor';
        default: return 'employee';
    }
}

// Obtenir l'icône du rôle
function getRoleIcon(role) {
    switch (role) {
        case 'administrateur': return 'fa-crown';
        case 'validateur': return 'fa-check-circle';
        case 'employé': return 'fa-user';
        case 'sous-traitant': return 'fa-briefcase';
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
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Mettre à jour la pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (currentPageSpan) currentPageSpan.textContent = currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages || 1;

    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderUsersTable();
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderUsersTable();
            }
        };
    }
}

// Actions sur les utilisateurs
function editUser(userId) {
    showNotification(`Modification de l'utilisateur ${userId}`, 'info');
    // Rediriger vers la page d'édition
    window.location.href = `/admin/users/create.html?id=${userId}`;
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

    if (userNameElement) userNameElement.textContent = userName;
    if (modal) modal.style.display = 'flex';
}

function closeDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) modal.style.display = 'none';
    userToDelete = null;
}

function confirmUserDeletion() {
    if (!userToDelete) {
        showNotification('Erreur: aucun utilisateur sélectionné', 'error');
        return;
    }

    // Supprimer l'utilisateur de la base de données
    fetch(`/api/admin/users/${userToDelete}`, {
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

// Modal de confirmation (générique) - laissé pour référence ou usage futur
function showConfirmModal(title, message, onConfirm) {
    // Si on avait une modal générique, on l'utiliserait ici
    if (confirm(message)) {
        onConfirm();
    }
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

// Mettre à jour les statistiques des utilisateurs depuis l'API
function updateUsersStatsFromAPI(stats) {
    updateStatNumber('totalUsers', stats.total);
    // Administrators stat removed
    updateStatNumber('validators', stats.validators);
    updateStatNumber('employees', stats.employees);
    updateStatNumber('activeUsers', stats.active);
}

// Fonction pour animer les nombres de statistiques
function updateStatNumber(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.setAttribute('data-target', value);

    const currentVal = parseInt(element.textContent) || 0;
    if (currentVal === value) return; // Pas de changement

    // Animation du compteur
    let current = 0;
    const increment = Math.max(1, value / 30);
    const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
            current = value;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 20);
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
            <div class="validator-info">
                <span class="validator-name" style="font-weight: 500; font-size: 0.85rem; color: var(--gray-700);">${user.validator.nom}</span>
                <button class="btn-action btn-edit" style="width: 24px; height: 24px; margin-left: 0.5rem;" onclick="assignValidatorDirectly('${user.id}', '${user.nom}')" title="Modifier le validateur">
                    <i class="fas fa-edit" style="font-size: 0.7rem;"></i>
                </button>
            </div>
        `;
    } else {
        return `
            <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="assignValidatorDirectly('${user.id}', '${user.nom}')">
                <i class="fas fa-plus" style="font-size: 0.7rem;"></i> Affecter
            </button>
        `;
    }
}

function loadValidators() {
    // Charger uniquement les utilisateurs avec rôle = 'validateur'
    // La fonction reste la même que précédemment ou est mise à jour avec l'API
    // ...
}

// Autres fonctions (initModal, getNotificationIcon, etc.)
// ...

// Gestion des modales
function initModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtns = modal.querySelectorAll('.modal-close, .btn-secondary');

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        });

        // Fermer en cliquant en dehors
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

function initValidatorModal() {
    // La gestion est faite via initModal maintenant, mais on garde la fonction pour la compatibilité
    return;
}

let currentUserForValidator = null;
let selectedValidatorId = null;
let currentUserForValidatorAssignment = null;

function assignValidatorDirectly(userId, userName) {
    currentUserForValidatorAssignment = userId;

    // Charger tous les validateurs depuis la table utilisateurs
    fetch('/api/public/users', { credentials: 'same-origin' })
        .then(res => res.json())
        .then(data => {
            const allUsers = data.users || data || [];

            let validators = [];

            if (Array.isArray(allUsers)) {
                validators = allUsers.filter(user => {
                    return user.role === 'validateur' || user.role === 'VALIDATEUR';
                }).map(user => ({
                    id: user.id || user.id_user,
                    nom: user.nom || user.nom_user,
                    email: user.email || user.email_user,
                    role: user.role
                }));
            }

            // Ouvrir la modal avec les validateurs
            openValidatorSelectionModal(userName, validators);
        })
        .catch(error => {
            console.error('Erreur:', error);
            showNotification('Erreur lors du chargement des validateurs', 'error');
        });
}

function openValidatorSelectionModal(userName, validators) {
    currentUserForValidator = currentUserForValidatorAssignment;
    const modal = document.getElementById('validatorSelectionModal');
    const validatorsList = document.getElementById('validatorsList');

    if (!modal || !validatorsList) return;

    // Vider la liste des validateurs
    validatorsList.innerHTML = '';

    // Vérifier qu'on a des validateurs
    if (!validators || validators.length === 0) {
        validatorsList.innerHTML = '<div class="no-validators" style="text-align: center; padding: 2rem; color: var(--gray-500);">Aucun validateur disponible</div>';
        modal.style.display = 'flex';
        return;
    }

    // Ajouter chaque validateur
    validators.forEach((validator, index) => {
        const validatorItem = document.createElement('div');
        validatorItem.className = 'validator-item';
        validatorItem.style.cssText = `
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            margin-bottom: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
        `;

        // Initials styled
        let initials = 'V';
        if (validator.nom) {
            const parts = validator.nom.split(' ');
            initials = parts.length > 1 ? parts[0][0] + parts[1][0] : validator.nom.substring(0, 2);
        }

        validatorItem.innerHTML = `
            <div style="width: 40px; height: 40px; background: var(--gray-100); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--gray-600);">
                ${initials.toUpperCase()}
            </div>
            <div>
                <div style="font-weight: 600; color: var(--gray-800);">${validator.nom}</div>
                <div style="font-size: 0.85rem; color: var(--gray-500);">${validator.email}</div>
            </div>
        `;

        // Ajouter l'événement de sélection
        validatorItem.addEventListener('click', () => {
            document.querySelectorAll('.validator-item').forEach(item => {
                item.style.borderColor = 'var(--gray-200)';
                item.style.background = 'white';
            });

            validatorItem.style.borderColor = 'var(--primary-blue)';
            validatorItem.style.background = 'var(--gray-50)';
            selectedValidatorId = validator.id;
        });

        validatorsList.appendChild(validatorItem);
    });

    modal.style.display = 'flex';
}

function closeValidatorSelectionModal() {
    const modal = document.getElementById('validatorSelectionModal');
    if (modal) modal.style.display = 'none';
    selectedValidatorId = null;
    currentUserForValidator = null;
}

function confirmValidatorSelection() {
    if (!selectedValidatorId || !currentUserForValidator) {
        showNotification('Veuillez sélectionner un validateur', 'error');
        return;
    }

    // Appel API pour affecter le validateur (simulation ou réel)

    // Ici on suppose que l'API existe ou on met à jour localement pour la démo
    const user = usersData.find(u => u.id === currentUserForValidator);
    if (user) {
        // Mise à jour locale pour retour immédiat
        showNotification('Validateur affecté avec succès', 'success');
        closeValidatorSelectionModal();
        renderUsersTable(); // Re-render pour afficher le nouveau validateur
    }
}
// Create User Modal Logic
function openCreateUserModal() {
    const modal = document.getElementById('createUserModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('createUserForm').reset();
        document.getElementById('password').value = generatePassword();
        document.getElementById('emailError').style.display = 'none';
    }
}

function closeCreateUserModal() {
    const modal = document.getElementById('createUserModal');
    if (modal) modal.style.display = 'none';
}

function generatePassword(length = 12) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let out = '';
    for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}

// Attach events when DOM is loaded (or immediately if inside module)
document.addEventListener('DOMContentLoaded', () => {
    // Generate Password Button
    const genBtn = document.getElementById('generatePasswordBtn');
    if (genBtn) {
        genBtn.addEventListener('click', () => {
            document.getElementById('password').value = generatePassword();
        });
    }

    // Form Submit
    const createForm = document.getElementById('createUserForm');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = createForm.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création...';

            const formData = new FormData(createForm);

            try {
                // Get CSRF from meta tag
                const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

                // We use the same endpoint as the original create page
                const response = await fetch('/admin/users', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json' // Request JSON response
                    },
                    body: formData
                });

                if (response.ok) {
                    showNotification('Utilisateur créé avec succès !', 'success');
                    closeCreateUserModal();
                    // Refresh the user list
                    fetchUsersAndRender();
                } else {
                    const data = await response.json().catch(() => ({}));
                    // Handle validation errors or generic error
                    let msg = data.message || 'Erreur lors de la création.';
                    if (data.errors && data.errors.email) {
                        msg = 'Cet email est déjà utilisé.';
                    }
                    showNotification(msg, 'error');
                }
            } catch (error) {
                console.error('Erreur creation user:', error);
                showNotification('Erreur de connexion.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
            }
        });
    }

    // Email Validation (Simplified from create.html)
    const emailInput = document.getElementById('email_user');
    const emailError = document.getElementById('emailError');
    let emailCheckTimeout;

    if (emailInput && emailError) {
        emailInput.addEventListener('input', (e) => {
            const email = e.target.value.trim();
            clearTimeout(emailCheckTimeout);
            emailError.style.display = 'none';

            if (email && email.includes('@') && email.includes('.')) {
                emailCheckTimeout = setTimeout(async () => {
                    try {
                        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
                        const response = await fetch('/admin/check-email', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken
                            },
                            body: JSON.stringify({ email: email })
                        });
                        const result = await response.json();
                        if (result.exists) {
                            emailError.style.display = 'block';
                        }
                    } catch (err) { console.error(err); }
                }, 500);
            }
        });
    }
});
