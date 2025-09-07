// CRATECH - JavaScript pour la page de Login Professionnelle

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation
    initAuthInterface();
    initUserTypeSwitching();
    initAdminFormSwitching();
    initFormValidation();
    initCSRFToken();
    initAnimations();
    initInteractiveElements();
});

// Interface d'authentification principale
function initAuthInterface() {
    console.log('🚀 CRATECH - Interface d\'authentification professionnelle initialisée !');
    
    // Animation d'entrée
    const formWrapper = document.querySelector('.form-wrapper');
    if (formWrapper) {
        formWrapper.style.opacity = '0';
        formWrapper.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            formWrapper.style.transition = 'all 0.6s ease';
            formWrapper.style.opacity = '1';
            formWrapper.style.transform = 'translateY(0)';
        }, 100);
    }
}
    
    // Récupération du token CSRF
    async function initCSRFToken() {
        try {
            const response = await fetch('/csrf-token', {
                method: 'GET',
                credentials: 'same-origin'
            });
            const data = await response.json();
            const token = data.token;
            
            if (token) {
                // Mettre à jour tous les champs _token
                document.querySelectorAll('input[name="_token"]').forEach(input => {
                    input.value = token;
                });
                
                // Mettre à jour les champs spécifiques
                const employeeToken = document.getElementById('csrf-token-employee');
                const adminToken = document.getElementById('csrf-token-admin');
                const signupToken = document.getElementById('csrf-token-signup');
                
                if (employeeToken) employeeToken.value = token;
                if (adminToken) adminToken.value = token;
                if (signupToken) signupToken.value = token;
                
                console.log('✅ Token CSRF initialisé pour tous les formulaires');
            }
        } catch (error) {
            console.error('❌ Erreur CSRF:', error);
        }
    }
    
    // Basculement entre types d'utilisateurs
    function initUserTypeSwitching() {
        const typeOptions = document.querySelectorAll('.type-option');
    const authForms = document.querySelectorAll('.auth-form');
        
        typeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const type = this.dataset.type;
                
            // Mettre à jour les boutons
                typeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
            // Afficher le formulaire correspondant
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${type}LoginForm`) {
                    form.classList.add('active');
                }
            });
            
            // Afficher/masquer les boutons admin
            const adminButtons = document.querySelector('.admin-switch-buttons');
            if (adminButtons) {
                adminButtons.style.display = type === 'admin' ? 'flex' : 'none';
                }
            });
        });
}

// Basculement entre login et signup admin
function initAdminFormSwitching() {
    const switchToLogin = document.getElementById('switchToAdminLogin');
    const switchToSignup = document.getElementById('switchToAdminSignup');
    const authForms = document.querySelectorAll('.auth-form');
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function() {
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === 'adminLoginForm') {
                    form.classList.add('active');
                }
            });
            
            // Mettre à jour les boutons
            document.querySelectorAll('.switch-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    }
    
    if (switchToSignup) {
        switchToSignup.addEventListener('click', function() {
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === 'adminSignupForm') {
                    form.classList.add('active');
                }
            });
            
            // Mettre à jour les boutons
            document.querySelectorAll('.switch-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    }
        }
    
    // Validation des formulaires
    function initFormValidation() {
    const forms = document.querySelectorAll('.auth-form');
        
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
                e.preventDefault();
                
            const formId = this.id;
            const submitBtn = this.querySelector('.submit-btn');
            
            // Activer l'état de chargement
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            }
            
            // Validation côté client
            if (validateForm(this)) {
                if (formId === 'employeeLoginForm') {
                    submitEmployeeLogin(this);
                } else if (formId === 'adminLoginForm') {
                    submitAdminLogin(this);
                } else if (formId === 'adminSignupForm') {
                    submitAdminSignup(this);
                }
            } else {
                // Désactiver l'état de chargement en cas d'erreur
                if (submitBtn) {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }
            }
                });
            });
        }
        
// Validation d'un formulaire
function validateForm(form) {
    const requiredFields = form.querySelectorAll('input[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'Ce champ est obligatoire');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
                
                // Validation email
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            showFieldError(emailField, 'Adresse email invalide');
            isValid = false;
        }
    }
    
    // Validation mot de passe
    const passwordField = form.querySelector('input[type="password"]');
    if (passwordField && passwordField.value && passwordField.value.length < 8) {
        showFieldError(passwordField, 'Le mot de passe doit contenir au moins 8 caractères');
        isValid = false;
    }
    
    return isValid;
}

// Afficher une erreur de champ
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--error)';
    errorDiv.style.fontSize = '0.75rem';
    errorDiv.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = 'var(--error)';
}

// Effacer une erreur de champ
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '';
}

// Soumission du formulaire employé
async function submitEmployeeLogin(form) {
    const formData = new FormData(form);
    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        remember: formData.get('remember') ? true : false
    };
    
    // Log des données pour déboguer
    console.log('Données envoyées:', {
        username: data.username,
        email: data.email,
        password: '***',
        remember: data.remember
    });
    
        try {
            showFormMessage('Connexion en cours...', 'success');
            
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.getElementById('csrf-token-employee').value,
                },
                body: JSON.stringify(data)
            });

        // Lire la réponse JSON
        const result = await response.json();
        
        // Vérifier le statut de la réponse
        if (response.ok && result.success) {
            // Succès - redirection immédiate
                showFormMessage('Connexion réussie ! Redirection...', 'success');
                setTimeout(() => {
                window.location.href = result.redirect;
            }, 1000);
            } else {
            // Erreur - afficher le message d'erreur
            showFormMessage(result.error || 'Erreur de connexion', 'error');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            showFormMessage('Erreur de connexion au serveur', 'error');
    } finally {
        // Désactiver l'état de chargement
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }
}

// Soumission du formulaire admin
async function submitAdminLogin(form) {
    const formData = new FormData(form);
    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        admin_section: formData.get('admin_section'),
        remember: formData.get('remember') ? true : false
    };
    
    // Log des données pour déboguer
    console.log('Données admin envoyées:', {
        username: data.username,
        email: data.email,
        password: '***',
        admin_section: data.admin_section,
        remember: data.remember
    });
    
    try {
        showFormMessage('Connexion admin en cours...', 'success');
        
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.getElementById('csrf-token-admin').value,
            },
            body: JSON.stringify(data)
        });

        // Vérifier le statut de la réponse
        if (response.ok) {
            // Lire la réponse JSON
        const result = await response.json();

            if (result.success) {
                // Succès - redirection immédiate
            showFormMessage('Connexion admin réussie ! Redirection...', 'success');
            setTimeout(() => {
                    window.location.href = result.redirect;
                }, 1000);
        } else {
                // Erreur - afficher le message d'erreur
                showFormMessage(result.error || 'Erreur de connexion', 'error');
            }
            } else {
            // Erreur HTTP - essayer de lire le JSON
            try {
                const result = await response.json();
                showFormMessage(result.error || 'Erreur de connexion', 'error');
            } catch (e) {
                // Si ce n'est pas du JSON, afficher un message générique
                showFormMessage('Identifiant ou mot de passe incorrect', 'error');
            }
        }
    } catch (error) {
        console.error('Erreur de connexion admin:', error);
        showFormMessage('Erreur de connexion au serveur', 'error');
    } finally {
        // Désactiver l'état de chargement
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }
}

// Soumission du formulaire d'inscription admin
async function submitAdminSignup(form) {
    const formData = new FormData(form);
    const data = {
        nom: formData.get('nom'),
        email: formData.get('email'),
        password: formData.get('password'),
        password_confirmation: formData.get('password_confirmation')
    };
    
    try {
        showFormMessage('Création du compte en cours...', 'success');
        
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.getElementById('csrf-token-signup').value,
            },
            body: JSON.stringify(data)
        });
            
            if (response.ok) {
            showFormMessage('Compte admin créé avec succès !', 'success');
                setTimeout(() => {
                    window.location.href = '/admin/dashboard';
            }, 2000);
            } else {
                const textResponse = await response.text();
            if (textResponse.includes('email déjà utilisé')) {
                showFormMessage('Cette adresse email est déjà utilisée', 'error');
            } else {
                showFormMessage('Erreur lors de la création du compte', 'error');
            }
        }
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        showFormMessage('Erreur de connexion au serveur', 'error');
    } finally {
        // Désactiver l'état de chargement
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }
}

// Fonction pour afficher les messages
function showFormMessage(message, type) {
    // Supprimer les anciens messages
    const existingMessages = document.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Créer le nouveau message
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Trouver le conteneur approprié pour insérer le message
    let container = document.querySelector('.auth-form.active');
    if (!container) {
        container = document.querySelector('.form-wrapper');
    }
    if (!container) {
        container = document.querySelector('.auth-container');
    }
    if (!container) {
        container = document.body;
    }
    
    // Insérer le message au début du conteneur
    container.insertBefore(messageDiv, container.firstChild);
    
    // Animation d'apparition
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 10);
    
    // Supprimer le message après 5 secondes
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Animations
function initAnimations() {
    // Animation des éléments au scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    // Observer les éléments d'info
    const infoElements = document.querySelectorAll('.feature-item, .stat');
    infoElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Éléments interactifs
function initInteractiveElements() {
    // Boutons clear input
    const clearButtons = document.querySelectorAll('.clear-input');
    clearButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentNode.querySelector('input');
            if (input) {
                input.value = '';
                input.focus();
                clearFieldError(input);
            }
        });
    });
    
    // Animation des boutons
    const buttons = document.querySelectorAll('.submit-btn, .type-option, .switch-btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Animation des cartes d'info
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

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
    
    // Debounce pour les inputs
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        let timeout;
        input.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                clearFieldError(this);
            }, 500);
        });
    });
}