<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    /**
     * Redirection vers Keycloak login
     */
    public function redirectToKeycloak(Request $request)
    {
        if ($request->has('id')) {
        session(['expected_id' => $request->input('id')]);
    }
        return redirect()->route('keycloak.login');
    }

    /**
     * Callback après login Keycloak
     */
   public function handleCallback(Request $request)
{
    $user = Auth::user();
    $expectedId = session('expected_id'); // récupéré depuis la session

    // Récupération ou création de l'utilisateur
    $record = Utilisateur::where('email_user', $user->email)->first();

    if ($record) {
        // Mise à jour si l'utilisateur existe
        $record->update([
            'nom_user' => $user->name,
            'role' => $user->roles[0] ?? 'employe',
            'status' => 'actif',
            'id_validateur' => $expectedId,
        ]);
    } else {
        // Création si l'utilisateur n'existe pas
        $record = Utilisateur::create([
            'email_user' => $user->email,
            'nom_user' => $user->name,
            'role' => $user->roles[0] ?? 'employe',
            'status' => 'actif',
            'id_validateur' => $expectedId,
        ]);
    }

    // Vérification de l’ID pour les admins
    $role = $record->role;
    if ($role === 'admin' && $expectedId && $record->id_validateur != $expectedId) {
        Auth::logout();
        return redirect()->route('login')->withErrors(['id' => 'ID administrateur invalide']);
    }

    // Redirection selon le rôle
    return match ($role) {
        'admin', 'administrateur' => redirect()->route('admin.dashboard'),
        'validateur' => redirect()->route('validateur.dashboard'),
        default => redirect()->route('user.dashboard'),
    };
}


    /**
     * Inscription d’un admin
     */
    public function inscription(Request $request)
    {
        // Validation
        $request->validate([
            'nom_user'        => 'required|string|max:255',
            'email_user'      => 'required|string|email|max:255|unique:utilisateurs',
            'motdepasse_user' => 'required|string|min:8|confirmed',
        ]);

        // Création du compte dans Keycloak
        $response = Http::withToken(env('KEYCLOAK_ADMIN_TOKEN'))
            ->post(env('KEYCLOAK_BASE_URL') . '/admin/realms/' . env('KEYCLOAK_REALM') . '/users', [
                'username'   => $request->email_user,
                'email'      => $request->email_user,
                'enabled'    => true,
                'firstName'  => $request->nom_user,
                'credentials' => [[
                    'type'      => 'password',
                    'value'     => $request->motdepasse_user,
                    'temporary' => false,
                ]],
            ]);

        if (!$response->successful()) {
            return response()->json(['error' => 'Échec de création Keycloak'], 500);
        }

        // Récupération de l’ID Keycloak
        $keycloakId = basename($response->header('Location'));

        // Création du compte dans ta DB
        $user = Utilisateur::create([
            'nom_user'     => $request->nom_user,
            'email_user'   => $request->email_user,
            'motdepasse_user' => bcrypt($request->motdepasse_user),
            'role'         => 'admin',
            'status'       => 'actif',
            'id_validateur'=> null,
            'keycloak_id'  => $keycloakId,
        ]);

        return redirect()->route('admin.dashboard');
    }
    public function motDePasseOublie()
{
    return redirect()->away(env('KEYCLOAK_BASE_URL') . '/realms/' . env('KEYCLOAK_REALM') . '/account/password');
}

}
