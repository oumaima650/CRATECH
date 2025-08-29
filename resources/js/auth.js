// CRATECH - Interface d'Authentification Élégante
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialisation des composants
    initAuthInterface();
    initFormSwitching();
    initInteractiveElements();
    initFormValidation();
    initPerformanceOptimizations();
    
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
    
    // Basculement entre connexion et inscription
    function initFormSwitching() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const switchToSignupBtn = document.getElementById('switchToSignup');
        const switchToLoginBtn = document.getElementById('switchToLogin');
        const typeOptions = document.querySelectorAll('.type-option');
        
        // Basculement vers l'inscription
        if (switchToSignupBtn) {
            switchToSignupBtn.addEventListener('click', function() {
                switchForm('signup');
            });
        }
        
        // Basculement vers la connexion
        if (switchToLoginBtn) {
            switchToLoginBtn.addEventListener('click', function() {
                switchForm('login');
            });
        }
        
        // Gestion des types d'utilisateur
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
                
                // Logique spécifique au type
                if (type === 'admin') {
                    // Par défaut, montrer le formulaire de connexion pour admin
                    switchForm('login');
                } else {
                    // Pour les employés, montrer aussi le formulaire de connexion
                    switchForm('login');
                }
            });
        });
        
        // Fonction de basculement
        function switchForm(formType) {
            if (formType === 'signup') {
                loginForm.style.display = 'none';
                signupForm.style.display = 'flex';
                
                // Animation d'apparition
                signupForm.style.opacity = '0';
                signupForm.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    signupForm.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    signupForm.style.opacity = '1';
                    signupForm.style.transform = 'translateY(0)';
                }, 50);
                
                // Mise à jour du bouton
                if (switchToSignupBtn) {
                    switchToSignupBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>Déjà un compte ?</span>';
                    switchToSignupBtn.id = 'switchToLogin';
                    switchToSignupBtn.addEventListener('click', function() {
                        switchForm('login');
                    });
                }
                
            } else {
                signupForm.style.display = 'none';
                loginForm.style.display = 'flex';
                
                // Animation d'apparition
                loginForm.style.opacity = '0';
                loginForm.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    loginForm.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    loginForm.style.opacity = '1';
                    loginForm.style.transform = 'translateY(0)';
                }, 50);
                
                // Mise à jour du bouton
                if (switchToLoginBtn) {
                    switchToLoginBtn.innerHTML = '<i class="fas fa-user-plus"></i><span>Créer un compte</span>';
                    switchToLoginBtn.id = 'switchToSignup';
                    switchToLoginBtn.addEventListener('click', function() {
                        switchForm('signup');
                    });
                }
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
    
    // Validation des formulaires
    function initFormValidation() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        // Validation du formulaire de connexion
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const userId = formData.get('userId');
                const userEmail = formData.get('userEmail');
                const userPassword = formData.get('userPassword');
                const activeType = document.querySelector('.type-option.active').dataset.type;
                
                // Validation basique
                if (!userId || !userEmail || !userPassword) {
                    showFormMessage('Veuillez remplir tous les champs obligatoires', 'error');
                    return;
                }
                
                // Validation email
                if (!isValidEmail(userEmail)) {
                    showFormMessage('Veuillez entrer une adresse email valide', 'error');
                    return;
                }
                
                // Simulation de connexion
                showFormMessage('Connexion en cours...', 'success');
                
                setTimeout(() => {
                    console.log('Tentative de connexion:', {
                        type: activeType,
                        userId: userId,
                        email: userEmail,
                        password: userPassword
                    });
                    
                    // Ici vous pouvez ajouter votre logique de connexion
                    showFormMessage('Connexion réussie ! Redirection...', 'success');
                    
                    setTimeout(() => {
                        // Redirection vers le dashboard ou la page principale
                        window.location.href = '../views/accueil.html';
                    }, 1500);
                }, 1000);
            });
        }
        
        // Validation du formulaire d'inscription
        if (signupForm) {
            signupForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const adminName = formData.get('adminName');
                const adminEmail = formData.get('adminEmail');
                const adminPassword = formData.get('adminPassword');
                const adminConfirmPassword = formData.get('adminConfirmPassword');
                
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
                
                // Simulation d'inscription
                showFormMessage('Création du compte en cours...', 'success');
                
                setTimeout(() => {
                    console.log('Tentative d\'inscription:', {
                        name: adminName,
                        email: adminEmail,
                        password: adminPassword
                    });
                    
                    // Ici vous pouvez ajouter votre logique d'inscription
                    showFormMessage('Compte créé avec succès ! Redirection...', 'success');
                    
                    setTimeout(() => {
                        // Redirection vers le dashboard ou la page principale
                        window.location.href = '../views/accueil.html';
                    }, 1500);
                }, 1000);
            });
        }
        
        // Validation email
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
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
            
            const activeForm = document.querySelector('.auth-form[style*="flex"]') || loginForm;
            activeForm.insertBefore(messageDiv, activeForm.firstChild);
            
            setTimeout(() => {
                messageDiv.remove();
            }, 4000);
        }
        
        // Ajouter les styles pour les messages
        if (!document.querySelector('#form-messages')) {
            const style = document.createElement('style');
            style.id = 'form-messages';
            style.textContent = `
                .form-message {
                    padding: 1rem;
                    border-radius: var(--border-radius);
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
    `;
    
    document.head.appendChild(dynamicStyles);
}); 