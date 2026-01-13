<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Models\CRA;
use App\Models\Activité;
use App\Models\cra_affectation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use App\Mail\CompteCreeMail;

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

        return response()->file(resource_path('views/admin/dashboard.html'));
    }

    public function getDashboardStats()
    {
        // 1. Répartition des utilisateurs par rôle (Sans les administrateurs)
        $usersByRole = [
            'labels' => ['Validateurs', 'Employés', 'Sous-traitants'],
            'data' => [
                Utilisateur::where('role', 'validateur')->count(),
                Utilisateur::where('role', 'employé')->count(),
                Utilisateur::where('role', 'sous-traitant')->count(),
            ],
            'colors' => ['#10B981', '#6366F1', '#F59E0B']
        ];

        // 2. Statut des CRA (Global)
        $crasByStatus = [
            'labels' => ['Validés', 'En attente', 'Refusés'],
            'data' => [
                CRA::where('status', 'valide')->count(),
                CRA::where('status', 'en_attente')->count(),
                CRA::where('status', 'refuse')->count(),
            ],
            'colors' => ['#10B981', '#F59E0B', '#EF4444']
        ];

        // 3. Statut des Activités
        $activitiesByStatus = [
            'labels' => ['Actives', 'Inactives'],
            'data' => [
                Activité::where('status', 'actif')->count(),
                Activité::where('status', 'inactif')->count(),
            ],
            'colors' => ['#3B82F6', '#94A3B8']
        ];

        // 4. Évolution des CRA sur les 6 derniers mois
        $months = [];
        $validatedData = [];
        $submittedData = [];

        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthName = $date->translatedFormat('M Y'); // ex: Jan 2024
            $months[] = $monthName;

            $submittedData[] = CRA::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();
                
            $validatedData[] = CRA::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->where('status', 'valide')
                ->count();
        }

        $crasEvolution = [
            'labels' => $months,
            'datasets' => [
                [
                    'label' => 'Total Soumis',
                    'data' => $submittedData,
                    'borderColor' => '#6366F1',
                    'backgroundColor' => 'rgba(99, 102, 241, 0.1)',
                ],
                [
                    'label' => 'Validés',
                    'data' => $validatedData,
                    'borderColor' => '#10B981',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.1)',
                ]
            ]
        ];

        return response()->json([
            'users' => $usersByRole,
            'cras_status' => $crasByStatus,
            'activities_status' => $activitiesByStatus,
            'cras_evolution' => $crasEvolution,
            'recent_activity' => $this->getRecentActivity()
        ]);
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

    // App\Http\Controllers\AdminController.php
public function users()
{
    $filePath = resource_path('views/admin/users.html');
    
    // Debug: vérifie si le fichier existe
    if (!file_exists($filePath)) {
        abort(404, "Le fichier users.html n'existe pas à l'emplacement: " . $filePath);
    }
    
    return response()->file($filePath);
}

    public function getUsersData()
    {
        $users = Utilisateur::with('validateur')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $usersData = [
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
            ],
            'links' => $users->links()->render()
        ];

        return response()->json($usersData);
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
            'password' => 'required|string|min:8',
            'role' => 'required|in:administrateur,validateur,employé,sous-traitant',
        ]);

        try {
        // --- Intégration Keycloak ---
        $keycloakId = null;
        try {
            $keycloakId = $this->createKeycloakUser([
                'nom_user' => $request->nom_user,
                'email_user' => $request->email_user,
                'password' => $request->password,
                'role' => $request->role,
            ]);
            if ($keycloakId) {
                Log::info('Utilisateur créé dans Keycloak avec succès:', ['keycloak_id' => $keycloakId]);
            }
        } catch (\Exception $e) {
            Log::error('Échec de la création Keycloak, on continue en local:', ['error' => $e->getMessage()]);
        }
        // ----------------------------

        // Créer l'utilisateur avec le statut actif par défaut
        $user = Utilisateur::create([
            'nom_user' => $request->nom_user,
            'email_user' => $request->email_user,
            'motdepasse_user' => Hash::make($request->password),
            'role' => $request->role,
            'status' => 'actif', // Statut par défaut
            'id_validateur' => null,
            'keycloak_id' => $keycloakId, // Stocker l'ID Keycloak
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

            // Redirection vers la liste des utilisateurs (version HTML statique)
            return redirect('/admin/users.html')->with('success', 'Utilisateur créé avec succès !');

        } catch (\Exception $e) {
            Log::error('Erreur lors de la création de l\'utilisateur: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['error' => 'Erreur lors de la création de l\'utilisateur. Veuillez réessayer.']);
        }
    }

    public function editUser($id)
    {
        return view('admin.users.edit');
    }

    public function getUserData($id)
    {
        $user = Utilisateur::findOrFail($id);
        return response()->json(['user' => $user]);
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

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => $user
        ]);
    }

    public function toggleUserStatus($id)
    {
        try {
            $user = Utilisateur::where('id_user', $id)->firstOrFail();
            $user->status = $user->status === 'actif' ? 'inactif' : 'actif';
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Statut mis à jour avec succès',
                'new_status' => $user->status
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteUser($id)
    {
        $user = Utilisateur::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }

    // ========== VALIDATORS ==========
    public function validators()
    {
        return view('admin.validators');
    }

    public function getValidatorsData()
    {
        $validators = Utilisateur::validators()
            ->with('validés')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $validatorsData = [
            'validators' => $validators->items(),
            'pagination' => [
                'current_page' => $validators->currentPage(),
                'last_page' => $validators->lastPage(),
                'per_page' => $validators->perPage(),
                'total' => $validators->total(),
                'from' => $validators->firstItem(),
                'to' => $validators->lastItem(),
            ],
            'links' => $validators->links()->render()
        ];

        return response()->json($validatorsData);
    }

    public function createValidator()
    {
        return view('admin.validators.create');
    }

    public function storeValidator(Request $request)
    {
        $request->validate([
            'nom_user' => 'required|string|max:255',
            'email_user' => 'required|email|unique:utilisateurs,email_user',
            'status' => 'required|in:actif,inactif',
        ]);

        $validator = Utilisateur::create([
            'nom_user' => $request->nom_user,
            'email_user' => $request->email_user,
            'role' => 'validateur',
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Validateur créé avec succès',
            'validator' => $validator
        ]);
    }

    public function editValidator($id)
    {
        return view('admin.validators.edit');
    }

    public function getValidatorData($id)
    {
        $validator = Utilisateur::validators()->findOrFail($id);
        return response()->json(['validator' => $validator]);
    }

    public function updateValidator(Request $request, $id)
    {
        $validator = Utilisateur::validators()->findOrFail($id);
        
        $request->validate([
            'nom_user' => 'required|string|max:255',
            'email_user' => 'required|email|unique:utilisateurs,email_user,' . $id . ',id_user',
            'status' => 'required|in:actif,inactif',
        ]);

        $validator->update($request->only(['nom_user', 'email_user', 'status']));

        return response()->json([
            'success' => true,
            'message' => 'Validateur mis à jour avec succès',
            'validator' => $validator
        ]);
    }

    public function deleteValidator($id)
    {
        $validator = Utilisateur::validators()->findOrFail($id);
        $validator->delete();

        return response()->json([
            'success' => true,
            'message' => 'Validateur supprimé avec succès'
        ]);
    }

    // ========== ACTIVITIES ==========

    public function updateActivityStatus($id, Request $request)
    {
        $activity = Activité::findOrFail($id);
        
        $request->validate([
            'status' => 'required|in:actif,inactif',
        ]);

        $activity->status = $request->status;
        $activity->save();

        return response()->json([
            'success' => true,
            'message' => 'Statut de l\'activité mis à jour avec succès',
            'activity' => $activity
        ]);
    }

    // ========== ASSIGNMENTS ==========
    public function assignments()
    {
        return view('admin.assignments');
    }

    public function getAssignmentsData()
    {
        $assignments = cra_affectation::with(['cra.utilisateur', 'validateur'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $assignmentsData = [
            'assignments' => $assignments->items(),
            'pagination' => [
                'current_page' => $assignments->currentPage(),
                'last_page' => $assignments->lastPage(),
                'per_page' => $assignments->perPage(),
                'total' => $assignments->total(),
                'from' => $assignments->firstItem(),
                'to' => $assignments->lastItem(),
            ],
            'links' => $assignments->links()->render()
        ];

        return response()->json($assignmentsData);
    }

    public function createAssignment()
    {
        return view('admin.assignments.create');
    }

    public function storeAssignment(Request $request)
    {
        $request->validate([
            'id_CRA' => 'required|exists:c_r_a_s,id_CRA',
            'id_validateur' => 'required|exists:utilisateurs,id_user',
        ]);

        $assignment = cra_affectation::create([
            'id_CRA' => $request->id_CRA,
            'id_validateur' => $request->id_validateur,
            'date_affectation' => now(),
            'actif' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Affectation créée avec succès',
            'assignment' => $assignment
        ]);
    }

    public function deleteAssignment($id)
    {
        $assignment = cra_affectation::findOrFail($id);
        $assignment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Affectation supprimée avec succès'
        ]);
    }

    // ========== REPORTING ==========
    public function reporting()
    {
        return view('admin.reporting');
    }

    public function getReportingData()
    {
        $stats = [
            'total_users' => Utilisateur::count(),
            'active_users' => Utilisateur::where('status', 'actif')->count(),
            'total_cras' => CRA::count(),
            'pending_cras' => CRA::where('status', 'en_attente')->count(),
            'validated_cras' => CRA::where('status', 'valide')->count(),
            'refused_cras' => CRA::where('status', 'refuse')->count(),
            'total_validators' => Utilisateur::where('role', 'validateur')->count(),
            'active_validators' => Utilisateur::where('role', 'validateur')->where('status', 'actif')->count(),
        ];

        // CRA par mois (6 derniers mois)
        $cras_by_month = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $cras_by_month[] = [
                'month' => $date->format('M Y'),
                'total' => CRA::whereMonth('dateMois', $date->month)
                    ->whereYear('dateMois', $date->year)
                    ->count(),
                'validated' => CRA::whereMonth('dateMois', $date->month)
                    ->whereYear('dateMois', $date->year)
                    ->where('status', 'valide')
                    ->count(),
            ];
        }

        // Utilisateurs par rôle
        $users_by_role = [
            'administrateur' => Utilisateur::where('role', 'administrateur')->count(),
            'validateur' => Utilisateur::where('role', 'validateur')->count(),
            'employé' => Utilisateur::where('role', 'employé')->count(),
            'sous-traitant' => Utilisateur::where('role', 'sous-traitant')->count(),
        ];

        $reportingData = [
            'stats' => $stats,
            'cras_by_month' => $cras_by_month,
            'users_by_role' => $users_by_role,
        ];

        return response()->json($reportingData);
    }

    // ========== CRA MANAGEMENT ==========
    public function cra()
    {
        return view('admin.cra');
    }

    public function getCrasData()
    {
        $cras = CRA::with(['utilisateur', 'cra_affectations.validateur'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $crasData = [
            'cras' => $cras->items(),
            'pagination' => [
                'current_page' => $cras->currentPage(),
                'last_page' => $cras->lastPage(),
                'per_page' => $cras->perPage(),
                'total' => $cras->total(),
                'from' => $cras->firstItem(),
                'to' => $cras->lastItem(),
            ],
            'links' => $cras->links()->render()
        ];

        return response()->json($crasData);
    }

    public function validateCra($id)
    {
        $cra = CRA::findOrFail($id);
        $cra->update(['status' => 'valide', 'updated_at' => now()]);

        // Envoyer un email à l'utilisateur (même logique que l'interface validateur)
        try {
            $row = DB::table('c_r_a_s')
                ->join('utilisateurs', 'c_r_a_s.id_user', '=', 'utilisateurs.id_user')
                ->where('c_r_a_s.id_CRA', $id)
                ->select('c_r_a_s.dateMois', 'utilisateurs.email_user', 'utilisateurs.nom_user')
                ->first();
            if ($row && $row->email_user) {
                $date = \Carbon\Carbon::parse($row->dateMois);
                $month = (int)$date->format('n');
                $year = (int)$date->format('Y');
                $subject = "Notification CRA - Mois {$month}/{$year} - Validé";
                $body = "Bonjour {$row->nom_user},\n\nVotre CRA du mois {$month}/{$year} a été validé.\nStatut actuel: valide.\n\nCordialement,\nL'équipe Validation";
                Mail::raw($body, function ($message) use ($row, $subject) {
                    $message->to($row->email_user)->subject($subject);
                });
            }
        } catch (\Exception $e) {
            Log::error('Erreur envoi email validation CRA (admin): ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'CRA validé avec succès'
        ]);
    }

    public function rejectCra($id)
    {
        $cra = CRA::findOrFail($id);
        $cra->update(['status' => 'refuse', 'updated_at' => now()]);

        // Envoyer un email à l'utilisateur (même logique que l'interface validateur)
        try {
            $row = DB::table('c_r_a_s')
                ->join('utilisateurs', 'c_r_a_s.id_user', '=', 'utilisateurs.id_user')
                ->where('c_r_a_s.id_CRA', $id)
                ->select('c_r_a_s.dateMois', 'utilisateurs.email_user', 'utilisateurs.nom_user')
                ->first();
            if ($row && $row->email_user) {
                $date = \Carbon\Carbon::parse($row->dateMois);
                $month = (int)$date->format('n');
                $year = (int)$date->format('Y');
                $subject = "Notification CRA - Mois {$month}/{$year} - Refusé";
                $body = "Bonjour {$row->nom_user},\n\nVotre CRA du mois {$month}/{$year} a été refusé.\nStatut actuel: refusé.\n\nCordialement,\nL'équipe Validation";
                Mail::raw($body, function ($message) use ($row, $subject) {
                    $message->to($row->email_user)->subject($subject);
                });
            }
        } catch (\Exception $e) {
            Log::error('Erreur envoi email refus CRA (admin): ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'CRA refusé'
        ]);
    }

    public function viewCra($id)
    {
        return view('admin.cra.view');
    }

    public function getCraData($id)
    {
        $cra = CRA::with(['utilisateur', 'jourActivite.activité', 'cra_affectations.validateur'])
            ->findOrFail($id);

        return response()->json(['cra' => $cra]);
    }

    // ========== PROJECTS (ACTIVITIES) ==========
    public function projects()
    {
        return view('admin.projects');
    }

    public function getProjectsData()
    {
        $projects = Activité::with('assignements.utilisateur')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $projectsData = [
            'projects' => $projects->items(),
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
                'from' => $projects->firstItem(),
                'to' => $projects->lastItem(),
            ],
            'links' => $projects->links()->render()
        ];

        return response()->json($projectsData);
    }

    public function createProject()
    {
        return view('admin.projects.create');
    }

    public function storeProject(Request $request)
    {
        $request->validate([
            'nom_act' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|in:actif,inactif',
        ]);

        $project = Activité::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Projet créé avec succès',
            'project' => $project
        ]);
    }

    public function editProject($id)
    {
        return view('admin.projects.edit');
    }

    public function getProjectData($id)
    {
        $project = Activité::findOrFail($id);
        return response()->json(['project' => $project]);
    }

    public function updateProject(Request $request, $id)
    {
        $project = Activité::findOrFail($id);
        
        $request->validate([
            'nom_act' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|in:actif,inactif',
        ]);

        $project->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Projet mis à jour avec succès',
            'project' => $project
        ]);
    }

    public function deleteProject($id)
    {
        $project = Activité::findOrFail($id);
        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Projet supprimé avec succès'
        ]);
    }

    // ========== PROFILE ==========
    public function profile()
    {
        return view('admin.profile');
    }

    public function getProfileData()
    {
        $user = Auth::user();
        
        // Load relationships
        $user->load(['cras', 'notifs', 'assignements.activité']);
        
        $profileData = [
            'user' => [
                'id_user' => $user->id_user,
                'nom_user' => $user->nom_user,
                'email_user' => $user->email_user,
                'role' => $user->role,
                'status' => $user->status,
                'created_at' => $user->created_at->format('d/m/Y'),
                'updated_at' => $user->updated_at->format('d/m/Y H:i'),
            ],
            'stats' => [
                'cras_count' => $user->cras->count(),
                'notifs_count' => $user->notifs->count(),
                'assignements_count' => $user->assignements->count(),
            ],
            'recent_cras' => $user->cras->take(5)->map(function($cra) {
                return [
                    'id_CRA' => $cra->id_CRA,
                    'dateMois' => $cra->dateMois->format('F Y'),
                    'created_at' => $cra->created_at->format('d/m/Y H:i'),
                    'status' => $cra->status,
                ];
            }),
            'recent_assignements' => $user->assignements->take(5)->map(function($assignment) {
                return [
                    'id' => $assignment->id,
                    'nom_act' => $assignment->activité->nom_act,
                    'description' => \Str::limit($assignment->activité->description, 50),
                    'created_at' => $assignment->created_at->format('d/m/Y'),
                    'status' => $assignment->activité->status,
                ];
            }),
        ];
        
        return response()->json($profileData);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'nom_user' => 'required|string|max:255',
            'email_user' => 'required|email|unique:utilisateurs,email_user,' . $user->id_user . ',id_user',
        ]);

        $user->update($request->only(['nom_user', 'email_user']));

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès',
            'user' => [
                'nom_user' => $user->nom_user,
                'email_user' => $user->email_user,
            ]
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->motdepasse_user)) {
            return response()->json([
                'success' => false,
                'message' => 'Mot de passe actuel incorrect',
                'errors' => ['current_password' => 'Mot de passe actuel incorrect']
            ], 422);
        }

        $user->update([
            'motdepasse_user' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe modifié avec succès'
        ]);
    }

    private function envoyerEmailAvecID($user, $password, $userId)
    {
        Mail::to($user->email_user)->send(new CompteCreeMail($user, $password, $userId));
    }

    // ===== MÉTHODES POUR LES ACTIVITÉS =====

    public function activities()
    {
        return response()->file(resource_path('views/admin/activities.html'));
    }

    public function createActivity()
    {
        return response()->file(resource_path('views/admin/activities/create.html'));
    }

    public function storeActivity(Request $request)
    {
        try {
            $request->validate([
                'nom_act' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:actif,inactif',
            ]);

            $activity = Activité::create([
                'nom_act' => $request->nom_act,
                'description' => $request->description,
                'status' => $request->status,
            ]);

            Log::info('Activité créée avec succès', [
                'activity_id' => $activity->id_activité,
                'nom_act' => $activity->nom_act,
                'status' => $activity->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Activité créée avec succès !',
                'activity' => $activity
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la création de l\'activité', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'activité'
            ], 500);
        }
    }

    public function editActivity($id)
    {
        $activity = Activité::findOrFail($id);
        return response()->json([
            'success' => true,
            'activity' => $activity
        ]);
    }

    public function updateActivity(Request $request, $id)
    {
        try {
            $activity = Activité::findOrFail($id);

            $request->validate([
                'nom_act' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:actif,inactif',
            ]);

            $activity->update([
                'nom_act' => $request->nom_act,
                'description' => $request->description,
                'status' => $request->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Activité mise à jour avec succès !',
                'activity' => $activity
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de l\'activité', [
                'activity_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'activité'
            ], 500);
        }
    }

    public function deleteActivity($id)
    {
        try {
            $activity = Activité::findOrFail($id);
            
            // Vérifier s'il y a des assignations liées
            $assignments = $activity->assignements()->count();
            if ($assignments > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer cette activité car elle est assignée à ' . $assignments . ' utilisateur(s)'
                ], 422);
            }

            $activity->delete();

            Log::info('Activité supprimée avec succès', [
                'activity_id' => $id,
                'nom_act' => $activity->nom_act
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Activité supprimée avec succès !'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la suppression de l\'activité', [
                'activity_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'activité'
            ], 500);
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
        $lastName = $nameParts[1] ?? '.'; // Placeholder si pas de nom de famille

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
}