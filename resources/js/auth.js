// CRATECH - Interface d'Authentification Élégante
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialisation des composants
    initAuthInterface();
    initUserTypeSwitching();
    initAdminFormSwitching();
    initInteractiveElements();
    initFormValidation();
    initPerformanceOptimizations();
    initCSRFToken();
    
    // Récupération du token CSRF
    async function initCSRFToken() {
        try {
            // Récupérer le token CSRF depuis l'API
            const response = await fetch('/csrf-token');
            const data = await response.json();
            const token = data.token;
            
            if (token) {
                // Mettre à jour tous les champs _token
                document.querySelectorAll('input[name="_token"], #csrf-token').forEach(input => {
                    input.value = token;
                });
                
                console.log('Token CSRF initialisé avec succès');
            } else {
                console.error('Token CSRF non reçu');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du token CSRF:', error);
        }
    }
    
    // Fonction utilitaire pour récupérer un cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
    
    // Interface d'authentification principale
    function initAuthInterface() {
        console.log('🚀 CRATECH - Interface d\'authentification initialisée !');
        
        // Animation d'entrée élégante
        const formSection = document.querySelector('.form-section');
        const logoSection = document.querySelector('.logo-section');
        
        if (formSection && logoSection) {
            formSection.style.opacity = '0';
            formSection.style.transform = 'translateX(-30px)';
            logoSection.style.opacity = '0';
            logoSection.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                formSection.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                logoSection.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                
                formSection.style.opacity = '1';
                formSection.style.transform = 'translateX(0)';
                logoSection.style.opacity = '1';
                logoSection.style.transform = 'translateX(0)';
            }, 100);
        }
    }
    
    // Basculement entre types d'utilisateurs
    function initUserTypeSwitching() {
        const typeOptions = document.querySelectorAll('.type-option');
        const employeeForm = document.getElementById('employeeLoginForm');
        const adminLoginForm = document.getElementById('adminLoginForm');
        const adminSignupForm = document.getElementById('adminSignupForm');
        const adminSwitchButtons = document.querySelector('.admin-switch-buttons');
        
        typeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const type = this.dataset.type;
                
                // Mise à jour de l'état actif
                typeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Animation de transition
                this.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                // Affichage des formulaires appropriés
                if (type === 'employee') {
                    showEmployeeForm();
                } else if (type === 'admin') {
                    showAdminForms();
                }
            });
        });
        
        function showEmployeeForm() {
            employeeForm.style.display = 'flex';
            adminLoginForm.style.display = 'none';
            adminSignupForm.style.display = 'none';
            adminSwitchButtons.style.display = 'none';
            
            // Animation d'apparition
            employeeForm.style.opacity = '0';
            employeeForm.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                employeeForm.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                employeeForm.style.opacity = '1';
                employeeForm.style.transform = 'translateY(0)';
            }, 50);
        }
        
        function showAdminForms() {
            employeeForm.style.display = 'none';
            adminLoginForm.style.display = 'flex';
            adminSignupForm.style.display = 'none';
            adminSwitchButtons.style.display = 'flex';
            
            // Animation d'apparition
            adminLoginForm.style.opacity = '0';
            adminLoginForm.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                adminLoginForm.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                adminLoginForm.style.opacity = '1';
                adminLoginForm.style.transform = 'translateY(0)';
            }, 50);
        }
    }
    
    // Basculement entre connexion et inscription pour les admins
    function initAdminFormSwitching() {
        const switchToAdminLoginBtn = document.getElementById('switchToAdminLogin');
        const switchToAdminSignupBtn = document.getElementById('switchToAdminSignup');
        const adminLoginForm = document.getElementById('adminLoginForm');
        const adminSignupForm = document.getElementById('adminSignupForm');
        
        if (switchToAdminLoginBtn) {
            switchToAdminLoginBtn.addEventListener('click', function() {
                switchAdminForm('login');
            });
        }
        
        if (switchToAdminSignupBtn) {
            switchToAdminSignupBtn.addEventListener('click', function() {
                switchAdminForm('signup');
            });
        }
        
        function switchAdminForm(formType) {
            if (formType === 'signup') {
                adminLoginForm.style.display = 'none';
                adminSignupForm.style.display = 'flex';
                
                // Animation d'apparition
                adminSignupForm.style.opacity = '0';
                adminSignupForm.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    adminSignupForm.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    adminSignupForm.style.opacity = '1';
                    adminSignupForm.style.transform = 'translateY(0)';
                }, 50);
                
            } else {
                adminSignupForm.style.display = 'none';
                adminLoginForm.style.display = 'flex';
                
                // Animation d'apparition
                adminLoginForm.style.opacity = '0';
                adminLoginForm.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    adminLoginForm.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    adminLoginForm.style.opacity = '1';
                    adminLoginForm.style.transform = 'translateY(0)';
                }, 50);
            }
        }
    }
    
    // Éléments interactifs élégants
    function initInteractiveElements() {
        // Boutons avec effet de ripple élégant
        const buttons = document.querySelectorAll('.submit-btn, .switch-btn, .type-option');
        buttons.forEach(button => {
            button.addEventListener('click', createElegantRipple);
        });
        
        // Boutons de suppression des champs
        const clearButtons = document.querySelectorAll('.clear-input');
        clearButtons.forEach(button => {
            button.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                if (input) {
                    input.value = '';
                    input.focus();
                    
                    // Animation de suppression
                    this.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                }
            });
        });
        
        // Effets de hover sur les champs
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.02)';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'scale(1)';
            });
        });
        
        // Animation du logo au hover
        const logoSymbol = document.querySelector('.logo-symbol');
        if (logoSymbol) {
            logoSymbol.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05) rotate(5deg)';
                this.style.filter = 'drop-shadow(0 25px 50px rgba(124, 58, 237, 0.6))';
            });
            
            logoSymbol.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) rotate(0deg)';
                this.style.filter = 'drop-shadow(0 20px 40px rgba(124, 58, 237, 0.4))';
            });
        }
    }
    
    // Effet de ripple élégant sur les boutons
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
        
        // Ajouter l'animation CSS si elle n'existe pas
        if (!document.querySelector('#elegant-ripple')) {
            const style = document.createElement('style');
            style.id = 'elegant-ripple';
            style.textContent = `
                @keyframes elegantRipple {
                    0% { transform: scale(0); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                    100% { transform: scale(2); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    // Affichage des messages
        function showFormMessage(message, type) {
            const existingMessage = document.querySelector('.form-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `form-message ${type}`;
            messageDiv.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i> ${message}`;
            
            const activeForm = document.querySelector('.auth-form[style*="flex"]') || employeeForm;
            activeForm.insertBefore(messageDiv, activeForm.firstChild);
            
            setTimeout(() => {
                messageDiv.remove();
            }, 4000);
        }
    
    // Validation des formulaires
    function initFormValidation() {
        const employeeForm = document.getElementById('employeeLoginForm');
        const adminLoginForm = document.getElementById('adminLoginForm');
        const adminSignupForm = document.getElementById('adminSignupForm');
        
        // Validation du formulaire employés
        if (employeeForm) {
            employeeForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const employeeId = formData.get('username');
                const employeeEmail = formData.get('email');
                const employeePassword = formData.get('password');
                const remember = formData.get('remember');
                
                // Validation basique
                if (!employeeId || !employeeEmail || !employeePassword) {
                    showFormMessage('Veuillez remplir tous les champs obligatoires', 'error');
                    return;
                }
                
                // Validation email
                if (!isValidEmail(employeeEmail)) {
                    showFormMessage('Veuillez entrer une adresse email valide', 'error');
                    return;
                }
                
                // Connexion employé
                submitEmployeeLogin({
                    username: employeeId,
                    email: employeeEmail,
                    password: employeePassword,
                    remember: remember
                });
            });
        }
        
        // Validation du formulaire de connexion admin
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const adminId = formData.get('username');
                const adminPassword = formData.get('password');
                const remember = formData.get('remember');
                
                // Validation basique
                if (!adminId || !adminPassword) {
                    showFormMessage('Veuillez remplir tous les champs obligatoires', 'error');
                    return;
                }
                
                // Connexion admin
                submitAdminLogin({
                    username: adminId,
                    password: adminPassword,
                    remember: remember
                });
            });
        }
        
        // Validation du formulaire d'inscription admin
        if (adminSignupForm) {
            adminSignupForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const adminName = formData.get('nom');
                const adminEmail = formData.get('email');
                const adminPassword = formData.get('password');
                const adminConfirmPassword = formData.get('password_confirmation');
                
                // Validation basique
                if (!adminName || !adminEmail || !adminPassword || !adminConfirmPassword) {
                    showFormMessage('Veuillez remplir tous les champs obligatoires', 'error');
                    return;
                }
                
                // Validation email
                if (!isValidEmail(adminEmail)) {
                    showFormMessage('Veuillez entrer une adresse email valide', 'error');
                    return;
                }
                
                // Validation du mot de passe
                if (adminPassword.length < 8) {
                    showFormMessage('Le mot de passe doit contenir au moins 8 caractères', 'error');
                    return;
                }
                
                // Validation de la confirmation
                if (adminPassword !== adminConfirmPassword) {
                    showFormMessage('Les mots de passe ne correspondent pas', 'error');
                    return;
                }
                
                // Inscription admin
                submitAdminSignup({
                    nom: adminName,
                    email: adminEmail,
                    password: adminPassword,
                    password_confirmation: adminConfirmPassword
                });
            });
        }
        
        // Validation email
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        
        
        
        // Ajouter les styles pour les messages
        if (!document.querySelector('#form-messages')) {
            const style = document.createElement('style');
            style.id = 'form-messages';
            style.textContent = `
                .form-message {
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-family: 'Poppins', sans-serif;
                    font-weight: 500;
                    animation: messageSlideIn 0.3s ease;
                }
                
                .form-message.error {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #fca5a5;
                }
                
                .form-message.success {
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    color: #86efac;
                }
                
                @keyframes messageSlideIn {
                    from { 
                        transform: translateY(-10px); 
                        opacity: 0; 
                    }
                    to { 
                        transform: translateY(0); 
                        opacity: 1; 
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Soumission des formulaires
    async function submitEmployeeLogin(data) {
        try {
            showFormMessage('Connexion en cours...', 'success');
            
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').value,
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showFormMessage('Connexion réussie ! Redirection...', 'success');
                setTimeout(() => {
                    window.location.href = '/employe/dashboard';
                }, 1500);
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    // Afficher les erreurs de validation
                    Object.values(errorData.errors).forEach(error => {
                        showFormMessage(error[0], 'error');
                    });
                } else {
                    showFormMessage(errorData.message || 'Erreur de connexion', 'error');
                }
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            showFormMessage('Erreur de connexion au serveur', 'error');
        }
    }
    
    async function submitAdminLogin(data) {
        try {
            showFormMessage('Connexion administrateur en cours...', 'success');
            
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').value,
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showFormMessage('Connexion admin réussie ! Redirection...', 'success');
                setTimeout(() => {
                    window.location.href = '/admin/dashboard';
                }, 1500);
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    // Afficher les erreurs de validation
                    Object.values(errorData.errors).forEach(error => {
                        showFormMessage(error[0], 'error');
                    });
                } else {
                    showFormMessage(errorData.message || 'Erreur de connexion admin', 'error');
                }
            }
        } catch (error) {
            console.error('Erreur de connexion admin:', error);
            showFormMessage('Erreur de connexion au serveur', 'error');
        }
    }
    
    async function submitAdminSignup(data) {
    try {
        console.log('Début de submitAdminSignup avec données:', data);
        showFormMessage('Création du compte administrateur en cours...', 'success');
        
        // Préparer les données en FormData
        const formData = new FormData();
        formData.append('nom', data.nom);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('password_confirmation', data.password_confirmation);

        // Ajouter le token CSRF
        const token = document.querySelector('input[name="_token"]').value;
        formData.append('_token', token);
        
        console.log('Token CSRF utilisé:', token);

        // Ajouter l'en-tête pour indiquer que nous attendons du JSON
        const headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
        };

        // Requête AJAX vers /register
        console.log('Envoi de la requête vers /register...');
        const response = await fetch('/register', {
            method: 'POST',
            body: formData,
            headers: headers
        });

        console.log('Réponse reçue:', response.status, response.statusText);

        // Vérifier le type de contenu de la réponse
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            // Si c'est du JSON, traiter normalement
            const responseData = await response.json();
            
            if (response.ok) {
                console.log('Inscription réussie !', responseData);
                showFormMessage(responseData.message || 'Compte administrateur créé avec succès ! Redirection...', 'success');
                setTimeout(() => {
                    window.location.href = responseData.redirect || '/admin/dashboard';
                }, 1500);
            } else {
                console.log('Erreur de réponse:', responseData);
                
                if (responseData.errors) {
                    Object.values(responseData.errors).forEach(error => {
                        showFormMessage(error[0], 'error');
                    });
                } else {
                    showFormMessage(responseData.message || 'Erreur lors de la création du compte', 'error');
                }
            }
        } else {
            // Si ce n'est pas du JSON, c'est probablement une redirection ou une page HTML
            console.log('Réponse non-JSON reçue, redirection probable');
            
            if (response.redirected) {
                // Si le serveur a redirigé, suivre la redirection
                window.location.href = response.url;
            } else if (response.ok) {
                // Si la réponse est OK mais pas JSON, rediriger manuellement
                showFormMessage('Compte créé avec succès ! Redirection...', 'success');
                setTimeout(() => {
                    window.location.href = '/admin/dashboard';
                }, 1500);
            } else {
                // Lire le texte de la réponse pour debugger
                const textResponse = await response.text();
                console.error('Réponse HTML reçue:', textResponse.substring(0, 200));
                showFormMessage('Erreur serveur inattendue. Veuillez vérifier la console.', 'error');
            }
        }
    } catch (error) {
        console.error('Erreur d\'inscription admin:', error);
        showFormMessage('Erreur de connexion au serveur', 'error');
    }
}
    
    // Optimisations de performance
    function initPerformanceOptimizations() {
        // Optimisation des animations
        const animatedElements = document.querySelectorAll('.logo-symbol, .submit-btn, .switch-btn, .type-option');
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
    
    // Gestion des erreurs et fallbacks
    window.addEventListener('error', function(e) {
        console.warn('Erreur JavaScript détectée:', e.error);
    });
    
    // Monitoring des performances
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('🚀 CRATECH - Temps de chargement de l\'authentification:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                }
            }, 0);
        });
    }
    
    // Support pour les préférences de réduction de mouvement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition', 'none');
    }
    
    // Fonction de test pour vérifier l'attachement des formulaires
    function testFormAttachment() {
        console.log('🧪 Test d\'attachement des formulaires...');
        
        const forms = {
            'employeeLoginForm': document.getElementById('employeeLoginForm'),
            'adminLoginForm': document.getElementById('adminLoginForm'),
            'adminSignupForm': document.getElementById('adminSignupForm')
        };
        
        Object.entries(forms).forEach(([name, form]) => {
            if (form) {
                console.log(`✅ ${name} trouvé`);
                
                // Vérifier si l'événement submit est attaché
                const submitEvent = form.onsubmit;
                if (submitEvent) {
                    console.log(`✅ ${name} a un événement submit`);
                } else {
                    console.log(`⚠️ ${name} n'a PAS d'événement submit`);
                }
            } else {
                console.error(`❌ ${name} NON TROUVÉ`);
            }
        });
        
        // Test de clic sur le bouton d'inscription admin
        const adminSignupBtn = document.querySelector('#adminSignupForm button[type="submit"]');
        if (adminSignupBtn) {
            console.log('✅ Bouton d\'inscription admin trouvé');
            console.log('Bouton:', adminSignupBtn);
        } else {
            console.error('❌ Bouton d\'inscription admin NON TROUVÉ');
        }
    }
    
    // Initialisation réussie
    console.log('🚀 CRATECH - Interface d\'authentification élégante initialisée avec succès ! ✨');
    
    // Ajouter des styles CSS dynamiques élégants
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
        /* Styles dynamiques pour les interactions élégantes */
        .submit-btn:active,
        .switch-btn:active {
            transform: translateY(1px);
        }
        
        .input-container:focus-within {
            transform: scale(1.02);
        }
        
        /* États de chargement élégants */
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }
        
        /* Effets de hover élégants supplémentaires */
        .type-option:hover {
            transform: translateY(-2px);
        }
        
        .feature-item:hover {
            transform: translateX(10px) scale(1.02);
        }
        
        /* Animation du logo au chargement */
        .logo-symbol {
            animation: logoFloat 3s ease-in-out infinite;
        }
        
        @keyframes logoFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
        }
        
        /* Styles pour les boutons de basculement admin */
        .admin-switch-buttons {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
            justify-content: center;
        }
        
        .admin-switch-buttons .switch-btn {
            flex: 1;
            max-width: 200px;
        }
    `;
    
    document.head.appendChild(dynamicStyles);
});