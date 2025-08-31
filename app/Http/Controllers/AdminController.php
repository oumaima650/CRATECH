<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Models\CRA;
use App\Models\Activité;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    

    public function index()
    {
        // Statistiques pour le tableau de bord
        $stats = [
            'total_users' => Utilisateur::count(),
            'active_projects' => Activité::where('status', 'actif')->count(),
            'pending_cras' => CRA::where('status', 'en_attente')->count(),
            'validators' => Utilisateur::where('role', 'validateur')->count(),
        ];

        // Activité récente
        $recent_activity = $this->getRecentActivity();

        return view('admin.dashboard', compact('stats', 'recent_activity'));
    }

    private function getRecentActivity()
    {
        // Récupérer les dernières activités (CRA soumis, utilisateurs créés, etc.)
        $activities = collect();

        // CRA récents
        $recent_cras = CRA::with('utilisateur')
            ->latest('created_at')
            ->take(5)
            ->get();

        foreach ($recent_cras as $cra) {
            $activities->push([
                'action' => 'CRA soumis',
                'user' => $cra->utilisateur,
                'date' => $cra->created_at->format('d/m/Y'),
                'status' => $cra->status,
                'type' => 'cra'
            ]);
        }

        // Utilisateurs récents
        $recent_users = Utilisateur::latest('created_at')
            ->take(3)
            ->get();

        foreach ($recent_users as $user) {
            $activities->push([
                'action' => 'Utilisateur créé',
                'user' => $user,
                'date' => $user->created_at->format('d/m/Y'),
                'status' => $user->status,
                'type' => 'user'
            ]);
        }

        return $activities->sortByDesc('date')->take(5);
    }

    public function users()
    {
        $users = Utilisateur::with('validateur')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('admin.users.index', compact('users'));
    }

    public function createUser()
    {
        return view('admin.users.create');
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'nom_user' => 'required|string|max:255',
            'email_user' => 'required|email|unique:utilisateurs,email_user',
            'role' => 'required|in:administrateur,validateur,employé,sous-traitant',
            'status' => 'required|in:actif,inactif',
        ]);

        Utilisateur::create([
            'nom_user' => $request->nom_user,
            'email_user' => $request->email_user,
            'role' => $request->role,
            'status' => $request->status,
        ]);

        return redirect()->route('admin.users')->with('success', 'Utilisateur créé avec succès');
    }

    public function editUser($id)
    {
        $user = Utilisateur::findOrFail($id);
        return view('admin.users.edit', compact('user'));
    }

    public function updateUser(Request $request, $id)
    {
        $user = Utilisateur::findOrFail($id);
        
        $request->validate([
            'nom_user' => 'required|string|max:255',
            'email_user' => 'required|email|unique:utilisateurs,email_user,' . $id . ',id_user',
            'role' => 'required|in:administrateur,validateur,employé,sous-traitant',
            'status' => 'required|in:actif,inactif',
        ]);

        $user->update($request->only(['nom_user', 'email_user', 'role', 'status']));

        return redirect()->route('admin.users')->with('success', 'Utilisateur mis à jour avec succès');
    }

    public function deleteUser($id)
    {
        $user = Utilisateur::findOrFail($id);
        $user->delete();

        return redirect()->route('admin.users')->with('success', 'Utilisateur supprimé avec succès');
    }
}
