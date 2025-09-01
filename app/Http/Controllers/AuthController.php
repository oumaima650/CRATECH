<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
        $request->validate([
            'identifier' => 'required',
            'password' => 'required',
        ]);

        // Récupérer l'utilisateur par ID
        $user = Utilisateur::where('id_user', $request->identifier)->first();

        if ($user) {
            // Vérifier le mot de passe
            if (Hash::check($request->password, $user->motdepasse_user)) {
                // Vérifier le statut
                if ($user->status === 'actif') {
                    // Connexion réussie
                    Auth::login($user, $request->has('remember'));
                    
                    // Redirection selon le rôle
                    if ($user->role === 'administrateur') {
                        return redirect('/admin/dashboard')->with('success', 'Connexion administrateur réussie !');
                    } else {
                        return redirect('/employe/dashboard')->with('success', 'Connexion réussie !');
                    }
                } else {
                    return back()->withErrors(['identifier' => 'Votre compte est désactivé.']);
                }
            } else {
                return back()->withErrors(['password' => 'Mot de passe incorrect.']);
            }
        } else {
            return back()->withErrors(['identifier' => 'Aucun compte trouvé avec cet identifiant.']);
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
     * Traiter la demande de mot de passe oublié
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = Utilisateur::where('email_user', $request->email)->first();
        
        if ($user) {
            // Ici vous pourriez implémenter l'envoi d'email
            // Pour l'instant, on affiche juste un message
            return back()->with('success', 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.');
        } else {
            // Pour des raisons de sécurité, on affiche le même message
            return back()->with('success', 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.');
        }
    }
}