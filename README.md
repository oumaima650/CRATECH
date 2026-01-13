# CRATECH - Plateforme de Gestion de CRA Premium

**CRATECH** est une solution d'entreprise sophistiquée conçue pour simplifier la gestion des Comptes Rendus d'Activité (CRA). Alliant une esthétique moderne et une puissance backend robuste, elle offre une expérience utilisateur fluide tout en garantissant une sécurité de niveau bancaire via Keycloak.

---

##  Identité Visuelle & UX
L'application suit une charte graphique basée sur des dégradés vibrants et une interface épurée :
- **Typographie** : Inter (Google Fonts)
- **Palette** : 
  - `Primary Blue` (#3B82F6) 
  - `Primary Violet` (#8B5CF6)
  - `Gray Scale` (Soft Slate)
- **Design Principles** : Transitions fluides, Glassmorphism léger, Badges d'état colorés et Micro-interactions.

---

## 🛠 Architecture Technique & Stack

###  Core Engine
- **Framework** : Laravel 12.x (dernier cri)
- **PHP** : 8.2+
- **Frontend** : Vanilla JS (système `CRAManager` modulaire), Vite 6.x
- **CSS** : Tailwind 4.x + Design system personnalisé (`admin.css`, `app.css`)

###  Sécurité & Identité (SSO)
- **Authentification** : Intégration complète avec **Keycloak** via OpenID Connect.
- **Synchronisation JIT** : Provisionnement des comptes en "Just-In-Time" lors de la première connexion.
- **Password Sync** : Système de synchronisation bidirectionnelle entre la base locale et l'annuaire Keycloak.
- **Rôles** : Gestion granulaire (ADMIN, EMPLOYE, VALIDATEUR, SOUS_TRAITANT).

---

##  Fonctionnalités Avancées

###  Dashboard Employé Intelligent
- **Saisie en un clic** : Gestion des quarts de journée (0.25), demi-journées (0.5) et journées pleines (1).
- **Filtrage Hybride** : Affichage exclusif des projets **actifs** pour l'initialisation du mois, et vue **historique** complète une fois le CRA créé.
- **Auto-save** : Sauvegarde automatique en arrière-plan pour ne perdre aucune donnée.

###  Supervision Administrateur
- **Validation Contextuelle** : Les boutons d'action (Valider/Refuser) ne sont affichés que pour les CRA en attente, évitant les erreurs de manipulation.
- **Recherche Instantanée** : Filtrage par utilisateur, mois ou statut avec résultats en temps réel.
- **Gestion des Activités** : Affectation précise des projets aux utilisateurs avec contrôle de statut.

###  Reporting
- **Export Excel** : Génération de fichiers `.xls` stylisés avec mise en forme conditionnelle pour les weekends et totaux.

---

## Structure des Données (Models)
L'application repose sur un schéma de base de données relationnel optimisé :
- **Utilisateur** : Profils et identifiants Keycloak.
- **CRA** : Entête des rapports mensuels.
- **Activité** : Catalogue des projets et tâches.
- **User_Act** : Table de liaison pour les affectations projets/utilisateurs.
- **JourActivite** : Logs quotidiens des temps passés.

---

## Installation & Déploiement

1. **Environnement** :
   ```bash
   cp .env.example .env
   composer install
   npm install
   ```

2. **Configuration Keycloak** :
   Renseignez les credentials dans le `.env` pour activer le SSO :
   ```env
   KEYCLOAK_BASE_URL=https://...
   KEYCLOAK_REALM=...
   KEYCLOAK_CLIENT_ID=...
   ```

3. **Lancement en mode Développement** :
   ```bash
   npm run dev
   # Démarre simultanément PHP Serve, Vite et la file d'attente
   ```

---

## 📈 Routes Principales
| Module | Préfixe | Description |
| :--- | :--- | :--- |
| **Général** | `/` | Auth, Account & Public Assets |
| **Employé** | `/employe` | Saisie, Mes CRA, Dashboard |
| **Admin** | `/admin` | Gestion Users, Activités, Supervision |
| **Validateur**| `/validateur`| Revue hiérarchique des rapports |

---


