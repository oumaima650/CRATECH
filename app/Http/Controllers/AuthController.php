<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Mail\CompteCreeMail;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Afficher le formulaire de connexion
     */
    public function showLogin()
    {
        return view('auth.login');
    }

    /**
     * Traiter la connexion
     */
    public function login(Request $request)
    {
        // Log des données reçues
        Log::info('Données de connexion reçues:', [
            'has_username' => $request->has('username'),
            'has_email' => $request->has('email'),
            'has_nom_user' => $request->has('nom_user'),
            'all_data' => $request->all()
        ]);

        // Déterminer le type de connexion basé sur les champs présents
        $isEmployeeLogin = $request->has('username') && $request->has('email');
        $isAdminLogin = $request->has('username') && $request->has('email') && $request->has('admin_section');

        Log::info('Type de connexion détecté:', [
            'isEmployeeLogin' => $isEmployeeLogin,
            'isAdminLogin' => $isAdminLogin,
            'has_admin_section' => $request->has('admin_section')
        ]);

        if ($isAdminLogin) {
            // Connexion administrateur (même logique que employé mais vérifie admin)
            return $this->handleAdminLogin($request);
        } elseif ($isEmployeeLogin) {
            // Connexion employé/sous-traitant/validateur
            return $this->handleEmployeeLogin($request);
        } else {
            // Fallback pour l'ancien système
            return $this->handleLegacyLogin($request);
        }
    }

    /**
     * Gérer la connexion des employés/sous-traitants/validateurs
     */
    private function handleEmployeeLogin(Request $request)
    {
        // Log des données reçues pour déboguer
        Log::info('Données reçues pour connexion employé:', [
            'username' => $request->username,
            'email' => $request->email,
            'password' => '***',
            'all_data' => $request->all()
        ]);

        // Validation des données
        $request->validate([
            'username' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // --- Tentative d'authentification Keycloak (Direct Grant) ---
        $keycloakResult = $this->verifyKeycloakCredentials($request->email, $request->password);
        $keycloakLogged = $keycloakResult['success'];
        
        if (!$keycloakLogged && isset($keycloakResult['error_description']) && $keycloakResult['error_description'] === 'Account is not fully set up') {
            return response()->json(['error' => 'Votre compte Keycloak nécessite une action (ex: changement de mot de passe obligatoire). Veuillez vous connecter une fois à l\'interface Keycloak ou contacter l\'administrateur.'], 400);
        }

        // Récupérer l'utilisateur par ID ET email pour double vérification
        $user = Utilisateur::where('id_user', $request->username)
                          ->where('email_user', $request->email)
                          ->first();

        if ($user) {
            // Si Keycloak a réussi, on considère le mot de passe valide
            // Sinon, on fait le check local habituel
            if (!$keycloakLogged && !Hash::check($request->password, $user->motdepasse_user)) {
                Log::info('Mot de passe incorrect (Keycloak et Local)');
                return response()->json(['error' => 'Mot de passe incorrect.'], 400);
            }
        } else {
            // Provisionnement JIT si l'utilisateur est valide dans Keycloak mais pas en local
            if ($keycloakLogged) {
                $user = Utilisateur::create([
                    'id_user' => (int)$request->username,
                    'nom_user' => $request->email, // On n'a pas le nom ici, on met l'email par défaut
                    'email_user' => $request->email,
                    'role' => 'employé',
                    'status' => 'actif',
                ]);
                Log::info('JIT: Utilisateur créé en local via Direct Grant Keycloak', ['id' => $user->id_user]);
            } else {
                Log::info('Aucun utilisateur trouvé et échec Keycloak');
                return response()->json(['error' => 'Aucun compte trouvé avec ces identifiants.'], 400);
            }
        }

        // Vérifier si c'est un administrateur (après vérification du mot de passe)
        if ($user->role === 'administrateur') {
            Log::info('Administrateur tentant de se connecter via section employé');
            return response()->json(['error' => 'Cette section est réservée aux employés, sous-traitants et validateurs. Les administrateurs doivent utiliser la section "Administrateurs".'], 400);
        }

        // Vérifier que l'utilisateur a un rôle autorisé pour cette section
        if (!in_array($user->role, ['employé', 'sous-traitant', 'validateur'])) {
            Log::info('Rôle non autorisé:', ['role' => $user->role]);
            return response()->json(['error' => 'Rôle utilisateur non reconnu.'], 400);
        }

        // Vérifier le statut
        if ($user->status !== 'actif') {
            Log::info('Compte désactivé:', ['status' => $user->status]);
            return response()->json(['error' => 'Votre compte est désactivé.'], 400);
        }

        // Connexion réussie
        Log::info('Connexion réussie, redirection vers:', ['role' => $user->role]);
        Auth::login($user, $request->has('remember'));
        
        // Redirection selon le rôle
        if ($user->role === 'validateur') {
            return response()->json(['success' => true, 'redirect' => '/validateur/dashboard']);
        } elseif (in_array($user->role, ['employé', 'sous-traitant'])) {
            return response()->json(['success' => true, 'redirect' => '/employe/dashboard']);
        } else {
            return response()->json(['error' => 'Rôle utilisateur non reconnu.'], 400);
        }
    }

    /**
     * Gérer la connexion des administrateurs
     */
    private function handleAdminLogin(Request $request)
    {
        // Log des données reçues pour déboguer
        Log::info('Données reçues pour connexion admin:', [
            'username' => $request->username,
            'email' => $request->email,
            'password' => '***',
            'all_data' => $request->all()
        ]);

        // Validation des données
        $request->validate([
            'username' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // --- Tentative d'authentification Keycloak (Direct Grant) ---
        $keycloakResult = $this->verifyKeycloakCredentials($request->email, $request->password);
        $keycloakLogged = $keycloakResult['success'];
        
        if (!$keycloakLogged && isset($keycloakResult['error_description']) && $keycloakResult['error_description'] === 'Account is not fully set up') {
            return response()->json(['error' => 'Votre compte administrateur Keycloak n\'est pas entièrement configuré (ex: mot de passe temporaire). Veuillez désactiver l\'option "Temporary" dans Keycloak.'], 400);
        }

        // Récupérer l'utilisateur
        // Si Keycloak a réussi, on est souple sur l'ID (on cherche par email uniquement)
        // Sinon, on cherche par le couple ID + Email pour la sécurité locale stricte
        if ($keycloakLogged) {
            $user = Utilisateur::where('email_user', $request->email)->first();
            if ($user && empty($user->keycloak_id)) {
                // Optionnel : Associer l'ID Keycloak si trouvé par email
                Log::info('Admin trouvé par email après succès Keycloak, association auto possible.');
            }
        } else {
            $user = Utilisateur::where('id_user', $request->username)
                              ->where('email_user', $request->email)
                              ->first();
        }

        if ($user) {
            // Si Keycloak a réussi, le mot de passe est déjà validé
            // Sinon, on check le hash local
            if (!$keycloakLogged && !Hash::check($request->password, $user->motdepasse_user)) {
                Log::info('Mot de passe admin incorrect (Keycloak et Local)');
                return response()->json(['error' => 'Identifiant ou mot de passe incorrect.'], 400);
            }
        } else {
            Log::info('Aucun administrateur local trouvé pour: ' . $request->email);
            return response()->json(['error' => 'Identifiant ou mot de passe incorrect.'], 400);
        }

        // Vérifier que l'utilisateur est bien un administrateur
        if ($user->role !== 'administrateur') {
            Log::info('Utilisateur non administrateur tentant de se connecter via section admin:', ['role' => $user->role]);
            return response()->json(['error' => 'Identifiant ou mot de passe incorrect.'], 400);
        }

        // Vérifier le statut
        if ($user->status !== 'actif') {
            Log::info('Compte admin désactivé:', ['status' => $user->status]);
            return response()->json(['error' => 'Votre compte est désactivé.'], 400);
        }

        // Connexion réussie
        Log::info('Connexion admin réussie pour: ' . $user->email_user);
        Auth::login($user, $request->has('remember'));
        
        return response()->json(['success' => true, 'redirect' => '/admin/dashboard.html']);
    }

    /**
     * Gérer la connexion legacy (fallback)
     */
    private function handleLegacyLogin(Request $request)
    {
        // Récupérer l'utilisateur par ID
        $user = Utilisateur::where('id_user', $request->identifier)->first();

        if (!$user) {
            return back()->withErrors(['identifier' => 'Aucun compte trouvé avec cet identifiant.']);
        }

        // Vérifier le mot de passe
        if (!Hash::check($request->password, $user->motdepasse_user)) {
            return back()->withErrors(['password' => 'Mot de passe incorrect.']);
        }

        // Vérifier le statut
        if ($user->status !== 'actif') {
            return back()->withErrors(['identifier' => 'Votre compte est désactivé.']);
        }

        // Connexion réussie
        Auth::login($user, $request->has('remember'));
        
        // Redirection selon le rôle
        if ($user->role === 'administrateur') {
            return redirect('/admin/dashboard.html')->with('success', 'Connexion administrateur réussie !');
        } elseif ($user->role === 'validateur') {
            return redirect('/validateur/dashboard')->with('success', 'Connexion validateur réussie !');
        } elseif (in_array($user->role, ['employé', 'sous-traitant'])) {
            return redirect('/employe/dashboard')->with('success', 'Connexion réussie !');
        } else {
            return back()->withErrors(['identifier' => 'Rôle utilisateur non reconnu.']);
        }
    }

    /**
     * Afficher le formulaire d'inscription
     */
    public function showRegister()
    {
        return view('auth.register');
    }

    /**
     * Traiter l'inscription
     */
    public function register(Request $request)
    {
        // Log des données reçues
        Log::info('Données reçues pour inscription:', $request->all());
        
        $request->validate([
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:utilisateurs,email_user',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
        Log::info('Validation réussie, création de l\'utilisateur...');

        // --- Intégration Keycloak ---
        $keycloakId = null;
        try {
            $keycloakId = $this->createKeycloakUser([
                'nom_user' => $request->nom,
                'email_user' => $request->email,
                'password' => $request->password,
                'role' => 'administrateur',
            ]);
            if ($keycloakId) {
                Log::info('Administrateur créé dans Keycloak avec succès:', ['keycloak_id' => $keycloakId]);
            }
        } catch (\Exception $e) {
            Log::error('Échec de la création Keycloak pour admin, on continue en local:', ['error' => $e->getMessage()]);
        }
        // ----------------------------
        
        // Créer l'utilisateur administrateur
        $user = Utilisateur::create([
            'nom_user' => $request->nom,
            'email_user' => $request->email,
            'motdepasse_user' => Hash::make($request->password),
            'role' => 'administrateur',
            'status' => 'actif',
            'id_validateur' => null,
            'keycloak_id' => $keycloakId,
            'remember_token' => null,
        ]);
            
        // Récupérer l'ID après la création
       $userId = $user->id_user;

        // Envoyer l'email avec l'ID
        try {
            $this->envoyerEmailAvecID($user, $request->password, $userId);
            Log::info('Email envoyé avec succès à: ' . $user->email_user);
        } catch (\Exception $e) {
            Log::error('Erreur envoi email: ' . $e->getMessage());
            // Continuer même si l'email échoue
        }
        
            

            Log::info('Utilisateur créé avec succès:', ['id' => $user->id_user, 'email' => $user->email_user]);

            // Connecter automatiquement l'utilisateur
            Auth::login($user);
            if ($request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Compte administrateur créé avec succès !',
                'redirect' => '/admin/dashboard.html'
            ]);
        }

            // Redirection vers le dashboard admin
            return redirect('/admin/dashboard.html')->with('success', 'Compte administrateur créé avec succès !');

        } catch (\Exception $e) {
            Log::error('Erreur lors de la création du compte admin: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['error' => 'Erreur lors de la création du compte. Veuillez réessayer.']);
        }
    }

        private function envoyerEmailAvecID($user, $password, $userId)
    {
    Mail::to($user->email_user)->send(new CompteCreeMail($user, $password, $userId));
          }

    

    /**
     * Déconnexion
     */
    public function logout()
    {
        Auth::logout();
        return redirect('/login')->with('success', 'Déconnexion réussie !');
    }

    // ========== KEYCLOAK (OIDC) ==========

    /**
     * Rediriger vers la page de login Keycloak
     */
    public function redirectToKeycloak()
    {
        return Socialite::driver('keycloak')->redirect();
    }

    /**
     * Gérer le retour de Keycloak
     */
    public function handleKeycloakCallback()
    {
        try {
            $keycloakUser = Socialite::driver('keycloak')->user();
            
            Log::info('Tentative de connexion Keycloak:', ['email' => $keycloakUser->email]);

            // Rechercher l'utilisateur par son ID Keycloak ou son Email
            $user = Utilisateur::where('keycloak_id', $keycloakUser->id)
                ->orWhere('email_user', $keycloakUser->email)
                ->first();

            if (!$user) {
                // Création automatique (Just-In-Time Provisioning)
                // Par défaut en tant qu'employé
                $user = Utilisateur::create([
                    'nom_user' => $keycloakUser->getName() ?? $keycloakUser->getNickname() ?? 'Utilisateur Keycloak',
                    'email_user' => $keycloakUser->getEmail(),
                    'keycloak_id' => $keycloakUser->getId(),
                    'role' => 'employé',
                    'status' => 'actif',
                ]);
                Log::info('Nouvel utilisateur créé via Keycloak:', ['id' => $user->id_user]);
            } else {
                // Mise à jour de l'ID Keycloak si l'utilisateur existait déjà par email
                if (empty($user->keycloak_id)) {
                    $user->update(['keycloak_id' => $keycloakUser->id]);
                    Log::info('ID Keycloak associé à l\'utilisateur existant:', ['id' => $user->id_user]);
                }
            }

            // Connecter l'utilisateur
            Auth::login($user);

            // Redirection intelligente selon le rôle
            if ($user->role === 'administrateur') {
                return redirect('/admin/dashboard.html');
            } elseif ($user->role === 'validateur') {
                return redirect('/validateur/dashboard.html');
            } else {
                return redirect('/employe/dashboard.html');
            }

        } catch (\Exception $e) {
            Log::error('Erreur Keycloak Callback: ' . $e->getMessage());
            return redirect('/login')->with('error', 'Échec de la connexion via Keycloak. ' . $e->getMessage());
        }
    }

    /**
     * Afficher le formulaire de mot de passe oublié
     */
    public function showForgotPassword()
    {
        return view('auth.forgot-password');
    }

    /**
     * Mot de passe oublié en 2 étapes sur la même route (POST /forgot-password)
     * Étape 1 (demande de code): id_user, email
     * Étape 2 (vérification + reset): id_user, email, code, password, password_confirmation
     */
    public function forgotPassword(Request $request)
    {
        // Étape 2: Vérifier le mot de passe reçu par email
        if ($request->has('verify_password')) {
            try {
                $request->validate([
                    'id_user' => 'required|integer',
                    'email' => 'required|email',
                    'verify_password' => 'required|string|min:6'
                ]);

                $user = Utilisateur::where('id_user', $request->id_user)
                    ->where('email_user', $request->email)
                    ->first();

                if (!$user) {
                    return response()->json([
                        'success' => false,
                        'message' => "Aucun utilisateur ne correspond à cet identifiant et email."
                    ], 404);
                }

                // Vérifier que le mot de passe saisi correspond à celui enregistré (envoyé par email)
                if (!Hash::check($request->verify_password, $user->motdepasse_user)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Mot de passe incorrect.'
                    ], 400);
                }

                // Succès → redirection vers la page de login
                return response()->json([
                    'success' => true,
                    'message' => 'Vérification réussie. Vous pouvez vous connecter.',
                    'redirect' => '/login'
                ]);
            } catch (\Illuminate\Validation\ValidationException $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $e->errors()
                ], 422);
            } catch (\Exception $e) {
                Log::error('Erreur vérification mot de passe reset: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur interne, veuillez réessayer plus tard.'
                ], 500);
            }
        }

        // Étape 1 (initiale ou renvoi): générer un nouveau mot de passe, mettre à jour en base et envoyer un email (blade)
        try {
            $request->validate([
                'id_user' => 'required|integer',
                'email' => 'required|email',
            ]);

            $user = Utilisateur::where('id_user', $request->id_user)
                ->where('email_user', $request->email)
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => "Aucun utilisateur ne correspond à cet identifiant et email."
                ], 404);
            }

            // Générer un nouveau mot de passe robuste
            $newPassword = Str::random(10);

            // Mettre à jour le mot de passe en base (hashé)
            $user->motdepasse_user = Hash::make($newPassword);
            $user->save();

            // --- Intégration Keycloak ---
            if ($user->keycloak_id) {
                try {
                    $this->updateKeycloakPassword($user->keycloak_id, $newPassword);
                    Log::info('Mot de passe Keycloak synchronisé lors du "Oublié" pour: ' . $user->email_user);
                } catch (\Exception $e) {
                    Log::error('Échec synchronisation mot de passe Keycloak (Oublié): ' . $e->getMessage());
                }
            }
            // ----------------------------

            // Envoyer un email Blade contenant le nouveau mot de passe
            try {
                $subject = 'CRATECH - Nouveau mot de passe';
                $data = [
                    'user' => $user,
                    'password' => $newPassword,
                ];
                Mail::send('emails.password-reset', $data, function ($message) use ($user, $subject) {
                    $message->to($user->email_user)->subject($subject);
                });
            } catch (\Exception $mailEx) {
                Log::error('Erreur envoi email mot de passe régénéré: ' . $mailEx->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Un email avec un nouveau mot de passe a été envoyé. Saisissez-le pour vérification.'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur génération/envoi mot de passe: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur interne, veuillez réessayer plus tard.'
            ], 500);
        }
    }

    /**
     * Mettre à jour les informations du compte (nom et/ou mot de passe)
     */
    public function updateAccount(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Non connecté'], 401);
        }

        $data = $request->validate([
            'nom' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:8|confirmed'
        ]);

        $updates = [];
        $passwordChanged = false;
        $newPassword = null;

        if (isset($data['nom']) && $data['nom'] !== '') {
            $updates['nom_user'] = $data['nom'];
        }
        
        if (isset($data['password']) && $data['password'] !== '') {
            $updates['motdepasse_user'] = Hash::make($data['password']);
            $passwordChanged = true;
            $newPassword = $data['password'];
        }

        if (!empty($updates)) {
            // Mise à jour locale
            Utilisateur::where('id_user', $user->id_user)->update(array_merge($updates, ['updated_at' => now()]));
            
            // --- Intégration Keycloak ---
            if ($passwordChanged && $user->keycloak_id) {
                try {
                    $this->updateKeycloakPassword($user->keycloak_id, $newPassword);
                    Log::info('Mot de passe Keycloak synchronisé via profil pour: ' . $user->email_user);
                } catch (\Exception $e) {
                    Log::error('Échec synchronisation mot de passe Keycloak (Profil): ' . $e->getMessage());
                }
            }
            // ----------------------------
        }

        return response()->json(['success' => true, 'message' => 'Compte mis à jour avec succès']);
    }

    /**
     * Vérifier les identifiants directement auprès de Keycloak (Direct Grant)
     */
    private function verifyKeycloakCredentials($email, $password)
    {
        $services = config('services.keycloak');
        $tokenUrl = "{$services['base_url']}/realms/{$services['realms']}/protocol/openid-connect/token";

        try {
            $response = Http::asForm()->post($tokenUrl, [
                'client_id' => $services['client_id'],
                'client_secret' => $services['client_secret'],
                'grant_type' => 'password',
                'username' => $email,
                'password' => $password,
                'scope' => 'openid'
            ]);

            if (!$response->successful()) {
                Log::error('Échec Keycloak Direct Grant:', [
                    'url' => $tokenUrl,
                    'status' => $response->status(),
                    'body' => $response->json(),
                    'email' => $email
                ]);
                
                $body = $response->json();
                return [
                    'success' => false,
                    'error' => $body['error'] ?? 'unknown_error',
                    'error_description' => $body['error_description'] ?? ''
                ];
            }

            return ['success' => true];
        } catch (\Exception $e) {
            Log::error('Erreur HTTP Keycloak Direct Grant: ' . $e->getMessage());
            return ['success' => false, 'error' => 'http_error'];
        }
    }

    /**
     * Créer un utilisateur dans Keycloak via l'API Admin
     */
    private function createKeycloakUser($userData)
    {
        $services = config('services.keycloak');
        
        // 1. Obtenir le token admin (via client credentials)
        $tokenUrl = "{$services['base_url']}/realms/{$services['realms']}/protocol/openid-connect/token";
        
        $response = Http::asForm()->post($tokenUrl, [
            'client_id' => $services['client_id'],
            'client_secret' => $services['client_secret'],
            'grant_type' => 'client_credentials',
        ]);

        if (!$response->successful()) {
            Log::error('Keycloak Admin Auth Failed:', ['status' => $response->status(), 'body' => $response->json()]);
            return null;
        }

        $token = $response->json('access_token');

        // 2. Créer l'utilisateur
        $nameParts = explode(' ', $userData['nom_user'], 2);
        $firstName = $nameParts[0];
        $lastName = $nameParts[1] ?? '.'; // Placeholder

        $adminUrl = "{$services['base_url']}/admin/realms/{$services['realms']}/users";
        
        $userResponse = Http::withToken($token)->post($adminUrl, [
            'username' => $userData['email_user'],
            'email' => $userData['email_user'],
            'enabled' => true,
            'emailVerified' => true,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'credentials' => [
                [
                    'type' => 'password',
                    'value' => $userData['password'],
                    'temporary' => false
                ]
            ]
        ]);

        if ($userResponse->status() === 201) {
            $location = $userResponse->header('Location');
            if ($location) {
                $parts = explode('/', $location);
                $keycloakId = end($parts);
                return $keycloakId;
            }
        }

        Log::error('Keycloak User Creation Failed:', ['status' => $userResponse->status(), 'body' => $userResponse->json()]);
        return null;
    }

    /**
     * Mettre à jour le mot de passe dans Keycloak via l'API Admin
     */
    private function updateKeycloakPassword($keycloakId, $newPassword)
    {
        $services = config('services.keycloak');
        
        // 1. Obtenir le token admin
        $tokenUrl = "{$services['base_url']}/realms/{$services['realms']}/protocol/openid-connect/token";
        
        $response = Http::asForm()->post($tokenUrl, [
            'client_id' => $services['client_id'],
            'client_secret' => $services['client_secret'],
            'grant_type' => 'client_credentials',
        ]);

        if (!$response->successful()) {
            throw new \Exception('Échec Auth Admin Keycloak pour reset');
        }

        $token = $response->json('access_token');

        // 2. Réinitialiser le mot de passe
        $resetUrl = "{$services['base_url']}/admin/realms/{$services['realms']}/users/{$keycloakId}/reset-password";
        
        $userResponse = Http::withToken($token)->put($resetUrl, [
            'type' => 'password',
            'value' => $newPassword,
            'temporary' => false
        ]);

        if (!$userResponse->successful()) {
            throw new \Exception('Échec Keycloak Reset Password API');
        }

        return true;
    }
}