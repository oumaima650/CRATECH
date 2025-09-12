<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Mail\CompteCreeMail;

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

        // Récupérer l'utilisateur par ID ET email pour double vérification
        $user = Utilisateur::where('id_user', $request->username)
                          ->where('email_user', $request->email)
                          ->first();

        Log::info('Utilisateur trouvé:', $user ? [
            'id' => $user->id_user,
            'email' => $user->email_user,
            'role' => $user->role,
            'status' => $user->status
        ] : 'Aucun utilisateur trouvé');

        if (!$user) {
            Log::info('Aucun utilisateur trouvé avec ces identifiants');
            return response()->json(['error' => 'Aucun compte trouvé avec ces identifiants.'], 400);
        }

        // Vérifier le mot de passe
        $passwordCheck = Hash::check($request->password, $user->motdepasse_user);
        Log::info('Vérification mot de passe:', ['correct' => $passwordCheck]);
        
        if (!$passwordCheck) {
            Log::info('Mot de passe incorrect');
            return response()->json(['error' => 'Mot de passe incorrect.'], 400);
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

        // Récupérer l'utilisateur par ID ET email pour double vérification
        $user = Utilisateur::where('id_user', $request->username)
                          ->where('email_user', $request->email)
                          ->first();

        Log::info('Utilisateur admin trouvé:', $user ? [
            'id' => $user->id_user,
            'email' => $user->email_user,
            'role' => $user->role,
            'status' => $user->status
        ] : 'Aucun utilisateur trouvé');

        if (!$user) {
            Log::info('Aucun utilisateur trouvé avec ces identifiants admin');
            return response()->json(['error' => 'Identifiant ou mot de passe incorrect.'], 400);
        }

        // Vérifier le mot de passe
        $passwordCheck = Hash::check($request->password, $user->motdepasse_user);
        Log::info('Vérification mot de passe admin:', ['correct' => $passwordCheck]);
        
        if (!$passwordCheck) {
            Log::info('Mot de passe admin incorrect');
            return response()->json(['error' => 'Identifiant ou mot de passe incorrect.'], 400);
        }

        // Vérifier que l'utilisateur est bien un administrateur
        if ($user->role !== 'administrateur') {
            Log::info('Utilisateur non administrateur tentant de se connecter:', ['role' => $user->role]);
            return response()->json(['error' => 'Identifiant ou mot de passe incorrect.'], 400);
        }

        // Vérifier le statut
        if ($user->status !== 'actif') {
            Log::info('Compte admin désactivé:', ['status' => $user->status]);
            return response()->json(['error' => 'Votre compte est désactivé.'], 400);
        }

        // Connexion réussie
        Log::info('Connexion admin réussie, redirection vers /admin/dashboard');
        Auth::login($user, $request->has('remember'));
        
        return response()->json(['success' => true, 'redirect' => '/admin/dashboard']);
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
            return redirect('/admin/dashboard')->with('success', 'Connexion administrateur réussie !');
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
            
            // Créer l'utilisateur administrateur
            $user = Utilisateur::create([
                'nom_user' => $request->nom,
                'email_user' => $request->email,
                'motdepasse_user' => Hash::make($request->password),
                'role' => 'administrateur',
                'status' => 'actif',
                'id_validateur' => null,
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
                'redirect' => '/admin/dashboard'
            ]);
        }

            // Redirection vers le dashboard admin
            return redirect('/admin/dashboard')->with('success', 'Compte administrateur créé avec succès !');

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
        // Étape 2: si un code OU un nouveau mot de passe sont fournis, on vérifie et on réinitialise
        if ($request->has('code') || $request->has('password')) {
            try {
                $request->validate([
                    'id_user' => 'required|integer',
                    'email' => 'required|email',
                    'code' => 'required|digits:6',
                    'password' => 'required|string|min:8|confirmed',
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

                $cacheKey = 'pwreset:' . $request->id_user . ':' . strtolower($request->email);
                $data = Cache::get($cacheKey);
                if (!$data || !isset($data['code']) || $data['code'] !== $request->code) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Code invalide ou expiré.'
                    ], 400);
                }

                // Mettre à jour le mot de passe
                $user->motdepasse_user = Hash::make($request->password);
                $user->save();

                // Nettoyer le cache et connecter l'utilisateur
                Cache::forget($cacheKey);
                Auth::login($user);

                // Déterminer la redirection selon le rôle
                $redirect = '/login';
                switch ($user->role) {
                    case 'administrateur':
                        $redirect = '/admin/dashboard';
                        break;
                    case 'validateur':
                        $redirect = '/validateur/dashboard';
                        break;
                    case 'employé':
                    case 'sous-traitant':
                        $redirect = '/employe/dashboard';
                        break;
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Mot de passe mis à jour avec succès',
                    'redirect' => $redirect
                ]);
            } catch (\Illuminate\Validation\ValidationException $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $e->errors()
                ], 422);
            } catch (\Exception $e) {
                Log::error('Erreur vérification code / reset: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur interne, veuillez réessayer plus tard.'
                ], 500);
            }
        }

        // Étape 1: générer et envoyer le code
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

            // Générer un code à 6 chiffres
            $code = (string) random_int(100000, 999999);
            $cacheKey = 'pwreset:' . $request->id_user . ':' . strtolower($request->email);
            Cache::put($cacheKey, ['code' => $code], now()->addMinutes(10));

            // Envoyer le code par email
            try {
                $subject = 'CRATECH - Code de réinitialisation (10 min)';
                $body = "Bonjour {$user->nom_user},\n\n" .
                        "Votre code de réinitialisation est: {$code}\n" .
                        "Ce code est valable 10 minutes.\n\n" .
                        "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\n" .
                        "Cordialement,\nL'équipe CRATECH";
                Mail::raw($body, function ($message) use ($user, $subject) {
                    $message->to($user->email_user)->subject($subject);
                });
            } catch (\Exception $mailEx) {
                Log::error('Erreur envoi email code reset: ' . $mailEx->getMessage());
                // On ne bloque pas, le code est quand même stocké en cache
            }

            return response()->json([
                'success' => true,
                'message' => 'Code envoyé à votre adresse email.'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur génération code reset: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur interne, veuillez réessayer plus tard.'
            ], 500);
        }
    }
    
}