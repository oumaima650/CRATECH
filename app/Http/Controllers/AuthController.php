<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Redirection vers Keycloak login
     */
    public function redirectToKeycloak(Request $request)
    {
        Log::info('Redirect to Keycloak initiated');
        
        if ($request->has('id')) {
            session(['expected_id' => $request->input('id')]);
            Log::info('Expected ID set: ' . $request->input('id'));
        }
        
        // Construire l'URL d'authentification Keycloak
        $keycloakBase = env('KEYCLOAK_BASE_URL', 'http://127.0.0.1:8080');
        $realm = env('KEYCLOAK_REALM', 'master');
        $clientId = env('KEYCLOAK_CLIENT_ID', 'cratech-laravel');
        $redirectUri = env('KEYCLOAK_REDIRECT_URI', 'http://127.0.0.1:8000/callback');
        
        $authUrl = $keycloakBase . '/realms/' . $realm . '/protocol/openid-connect/auth?' . http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid profile email',
        ]);
        
        Log::info('Redirecting to Keycloak: ' . $authUrl);
        return redirect()->away($authUrl);
    }

    /**
     * Callback après login Keycloak
     */
    public function handleCallback(Request $request)
    {
        Log::info('Keycloak callback received', ['request' => $request->all()]);
        
        // Vérifier s'il y a une erreur
        if ($request->has('error')) {
            Log::error('Keycloak error: ' . $request->input('error'));
            return redirect()->route('login')->with('error', 'Erreur d\'authentification: ' . $request->input('error'));
        }

        // Récupérer le code d'autorisation
        $code = $request->input('code');
        if (!$code) {
            Log::error('No authorization code received');
            return redirect()->route('login')->with('error', 'Code d\'autorisation manquant');
        }

        try {
            // Échanger le code contre un token
            $keycloakBase = env('KEYCLOAK_BASE_URL', 'http://127.0.0.1:8080');
            $realm = env('KEYCLOAK_REALM', 'master');
            $clientId = env('KEYCLOAK_CLIENT_ID', 'cratech-laravel');
            $clientSecret = env('KEYCLOAK_CLIENT_SECRET', 'XCNGdiCoLn6QXdk2B4T6RIEIZ5ktQdPq');
            $redirectUri = env('KEYCLOAK_REDIRECT_URI', 'http://127.0.0.1:8000/callback');
            
            Log::info('Exchanging code for token', [
                'keycloakBase' => $keycloakBase,
                'realm' => $realm,
                'clientId' => $clientId,
                'redirectUri' => $redirectUri
            ]);
            
            $tokenResponse = Http::asForm()->post($keycloakBase . '/realms/' . $realm . '/protocol/openid-connect/token', [
                'grant_type' => 'authorization_code',
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'redirect_uri' => $redirectUri,
                'code' => $code,
            ]);

            Log::info('Token response status: ' . $tokenResponse->status());
            Log::info('Token response body: ' . $tokenResponse->body());
            
            if (!$tokenResponse->successful()) {
                Log::error('Token exchange failed: ' . $tokenResponse->body());
                return redirect()->route('login')->with('error', 'Échec de l\'échange de token');
            }

            $tokens = $tokenResponse->json();
            $accessToken = $tokens['access_token'];
            
            // Récupérer les informations utilisateur
            $userResponse = Http::withToken($accessToken)->get($keycloakBase . '/realms/' . $realm . '/protocol/openid-connect/userinfo');
            
            Log::info('User info response status: ' . $userResponse->status());
            Log::info('User info response body: ' . $userResponse->body());
            
            if (!$userResponse->successful()) {
                Log::error('User info failed: ' . $userResponse->body());
                return redirect()->route('login')->with('error', 'Échec de la récupération des informations utilisateur');
            }

            $userInfo = $userResponse->json();
            $expectedId = session('expected_id');
            
            Log::info('User info received', ['userInfo' => $userInfo]);
            
            // Trouver ou créer l'utilisateur
            $user = Utilisateur::where('email_user', $userInfo['email'])->first();

            if ($user) {
                // Mise à jour si l'utilisateur existe
                $user->update([
                    'nom_user' => $userInfo['name'] ?? $userInfo['preferred_username'],
                    'status' => 'actif',
                    'id_validateur' => $expectedId,
                ]);
                Log::info('User updated: ' . $userInfo['email']);
            } else {
                // Création si l'utilisateur n'existe pas
                $user = Utilisateur::create([
                    'email_user' => $userInfo['email'],
                    'nom_user' => $userInfo['name'] ?? $userInfo['preferred_username'],
                    'role' => 'employé', // Par défaut
                    'status' => 'actif',
                    'id_validateur' => $expectedId,
                ]);
                Log::info('User created: ' . $userInfo['email']);
            }

            // Connecter l'utilisateur manuellement
            Auth::login($user);
            Log::info('User logged in: ' . $userInfo['email']);

            // Vérification de l'ID pour les admins
            if ($user->role === 'admin' && $expectedId && $user->id_validateur != $expectedId) {
                Auth::logout();
                Log::error('Invalid admin ID');
                return redirect()->route('login')->withErrors(['id' => 'ID administrateur invalide']);
            }

            // Redirection selon le rôle
            return match ($user->role) {
                'admin', 'administrateur' => redirect()->route('admin.dashboard'),
                'validateur' => redirect()->route('validateur.dashboard'),
                default => redirect()->route('employe.dashboard'),
            };

        } catch (\Exception $e) {
            Log::error('Callback error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return redirect()->route('login')->with('error', 'Erreur lors de l\'authentification: ' . $e->getMessage());
        }
    }

    public function motDePasseOublie()
    {
        return redirect()->away(env('KEYCLOAK_BASE_URL') . '/realms/' . env('KEYCLOAK_REALM') . '/account/password');
    }
}