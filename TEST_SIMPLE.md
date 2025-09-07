# 🧪 Test Simple - Connexion CRATECH

## 🔍 Étapes de Test

### 1. Vérifier la Base de Données
```bash
# Aller dans le dossier du projet
cd C:\Users\hp\CRATECH\cratech

# Vérifier les utilisateurs
php check_users.php
```

### 2. Créer les Utilisateurs de Test
```bash
# Si aucun utilisateur n'existe
php artisan db:seed --class=UtilisateurSeeder
```

### 3. Tester la Connexion

#### ✅ Test 1: Connexion Valide
- **Section**: Employés & Sous-traitants
- **ID**: `EMP001`
- **Email**: `jean.dupont@cratech.com`
- **Mot de passe**: `employe123`
- **Résultat attendu**: Redirection vers `/employe/dashboard`

#### ❌ Test 2: ID Incorrect
- **Section**: Employés & Sous-traitants
- **ID**: `FAKE001`
- **Email**: `jean.dupont@cratech.com`
- **Mot de passe**: `employe123`
- **Résultat attendu**: "Aucun compte trouvé avec ces identifiants"

#### ❌ Test 3: Email Incorrect
- **Section**: Employés & Sous-traitants
- **ID**: `EMP001`
- **Email**: `fake@email.com`
- **Mot de passe**: `employe123`
- **Résultat attendu**: "Aucun compte trouvé avec ces identifiants"

#### ❌ Test 4: Mot de Passe Incorrect
- **Section**: Employés & Sous-traitants
- **ID**: `EMP001`
- **Email**: `jean.dupont@cratech.com`
- **Mot de passe**: `wrongpassword`
- **Résultat attendu**: "Mot de passe incorrect"

## 📋 Utilisateurs de Test

| ID | Email | Mot de passe | Rôle |
|----|-------|--------------|------|
| EMP001 | jean.dupont@cratech.com | employe123 | employé |
| ST001 | marie.martin@cratech.com | soustraitant123 | sous-traitant |
| VAL001 | pierre.validateur@cratech.com | validateur123 | validateur |
| ADMIN001 | admin@cratech.com | admin123 | administrateur |

## 🔧 Débogage

### Vérifier les Logs
```bash
# Voir les logs Laravel
tail -f storage/logs/laravel.log
```

### Vérifier la Console du Navigateur
- Ouvrir F12 → Console
- Voir les messages de débogage
- Vérifier les requêtes réseau

## ⚠️ Problèmes Courants

1. **Erreur 419**: Token CSRF manquant
2. **Connexion réussie avec fausses données**: Problème de validation
3. **Aucun utilisateur trouvé**: Base de données vide
4. **Mot de passe incorrect**: Problème de hashage
