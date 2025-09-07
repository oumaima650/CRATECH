# 🧪 Test Admin Simple

## 🔍 Vérifier l'Admin

```bash
# Aller dans le dossier du projet
cd C:\Users\hp\CRATECH\cratech

# Vérifier que l'admin existe
php test_admin.php
```

## 🧪 Test de Connexion

### ✅ Test 1: Connexion Admin Valide
- **Section**: Administrateurs
- **Identifiant**: `Admin CRATECH`
- **Mot de passe**: `admin123`
- **Résultat attendu**: ✅ Redirection vers `/admin/dashboard`

### ❌ Test 2: Mot de Passe Incorrect
- **Section**: Administrateurs
- **Identifiant**: `Admin CRATECH`
- **Mot de passe**: `wrongpassword`
- **Résultat attendu**: ❌ "Identifiant ou mot de passe incorrect"

## 🔧 Débogage

### Console du Navigateur (F12)
1. Aller dans l'onglet Console
2. Tenter une connexion admin
3. Voir les messages de débogage

### Logs Laravel
```bash
# Voir les logs en temps réel
tail -f storage/logs/laravel.log
```

## 📋 Si l'Admin n'existe pas

```bash
# Créer les utilisateurs de test
php artisan db:seed --class=UtilisateurSeeder
```

## 🎯 Messages Attendus

- **Succès**: "Connexion admin réussie ! Redirection..."
- **Erreur**: "Identifiant ou mot de passe incorrect"

**Teste maintenant avec `Admin CRATECH` + `admin123` !** 🚀
