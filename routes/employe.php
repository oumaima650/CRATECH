<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Utilisateur;
use App\Models\CRA;
use App\Models\JourActivite;

// Get user info for dashboard (no auth middleware for testing)
Route::get('/employe/user-info', function (Request $request) {
    try {
        // Return mock user data for testing
        return response()->json([
            'success' => true,
            'user' => [
                'id_user' => 1,
                'id' => 1,
                'nom' => 'Test User',
                'name' => 'Test User',
                'email' => 'test@example.com',
                'role' => 'employe'
            ]
        ]);
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des informations utilisateur'
        ], 500);
    }
});

// Get user activities
Route::get('/employe/activities', function (Request $request) {
    try {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non connecté'
            ], 401);
        }
        
        // Get activities assigned to user from user_acts table
        $activities = DB::table('user__acts')
            ->join('activités', 'user__acts.id_activité', '=', 'activités.id_activité')
            ->where('user__acts.id_user', $user->id_user)
            ->select('activités.id_activité', 'activités.nom_act', 'activités.description')
            ->get();
        
        return response()->json([
            'success' => true,
            'activities' => $activities
        ]);
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des activités: ' . $e->getMessage()
        ], 500);
    }
});

// Create new CRA
Route::post('/employe/cra/create', function (Request $request) {
    try {
        $data = $request->validate([
            'year' => 'required|integer',
            'month' => 'required|integer|min:1|max:12',
            'status' => 'string|in:en_attente,valide,refuse',
            'excel_path' => 'nullable|string'
        ]);
        
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non connecté'
            ], 401);
        }
        $userId = $user->id_user;
        
        // Create date for the month
        $dateMois = sprintf('%04d-%02d-01', $data['year'], $data['month']);
        
        // Check if CRA already exists for this month
        $existingCRA = DB::table('c_r_a_s')
            ->where('id_user', $userId)
            ->where('dateMois', $dateMois)
            ->first();
            
        if ($existingCRA) {
            return response()->json([
                'success' => true,
                'cra_id' => $existingCRA->id_CRA,
                'message' => 'CRA existant récupéré'
            ]);
        }
        
        // Create new CRA
        $craId = DB::table('c_r_a_s')->insertGetId([
            'id_user' => $userId,
            'dateMois' => $dateMois,
            'status' => $data['status'] ?? 'en_attente',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        // Add entry to rapport_mensuels table if excel_path is provided
        if (isset($data['excel_path']) && !empty($data['excel_path'])) {
            DB::table('rapport_mensuels')->insert([
                'id_CRA' => $craId,
                'chemin_fichier' => $data['excel_path'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        return response()->json([
            'success' => true,
            'cra_id' => $craId,
            'message' => 'CRA créé avec succès'
        ]);
        
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la création du CRA: ' . $e->getMessage()
        ], 500);
    }
});

// Get user's CRA list (simplified for testing)
Route::get('/employe/mes-cra', function () {
    try {
        // Return mock CRA data for testing
        $mockCras = [
            [
                'id_CRA' => 1,
                'dateMois' => '2025-01-01',
                'status' => 'en_attente',
                'is_submitted' => false,
                'submittedAT' => null,
                'created_at' => '2025-01-01 10:00:00',
                'updated_at' => '2025-01-01 10:00:00'
            ],
            [
                'id_CRA' => 2,
                'dateMois' => '2024-12-01',
                'status' => 'valide',
                'is_submitted' => true,
                'submittedAT' => '2024-12-31 15:30:00',
                'created_at' => '2024-12-01 09:00:00',
                'updated_at' => '2024-12-31 15:30:00'
            ],
            [
                'id_CRA' => 3,
                'dateMois' => '2024-11-01',
                'status' => 'refuse',
                'is_submitted' => true,
                'submittedAT' => '2024-11-30 14:20:00',
                'created_at' => '2024-11-01 08:00:00',
                'updated_at' => '2024-11-30 14:20:00'
            ]
        ];
        
        return response()->json([
            'success' => true,
            'cras' => $mockCras
        ]);
        
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des CRA: ' . $e->getMessage()
        ], 500);
    }
});

// Auto-save CRA data
Route::post('/employe/cra/autosave', function (Request $request) {
    try {
        $data = $request->validate([
            'cra_id' => 'required|integer',
            'data' => 'required|array'
        ]);
        
        foreach ($data['data'] as $key => $value) {
            [$projectId, $date] = explode('_', $key);
            
            // Update or create jour_activite record
            DB::table('jour_activites')->updateOrInsert(
                [
                    'id_CRA' => $data['cra_id'],
                    'id_activité' => $projectId,
                    'date' => $date
                ],
                [
                    'type' => $value,
                    'updated_at' => now()
                ]
            );
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Auto-sauvegarde effectuée'
        ]);
        
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de l\'auto-sauvegarde: ' . $e->getMessage()
        ], 500);
    }
});

// Save CRA
Route::post('/employe/cra/save', function (Request $request) {
    try {
        $data = $request->validate([
            'cra_id' => 'required|integer',
            'year' => 'required|integer',
            'month' => 'required|integer',
            'data' => 'required|array',
            'status' => 'string|in:en_attente,valide,refuse'
        ]);
        
        // Update CRA status
        DB::table('c_r_a_s')
            ->where('id_CRA', $data['cra_id'])
            ->update([
                'status' => $data['status'] ?? 'en_attente',
                'updated_at' => now()
            ]);
        
        // Save all day activities
        foreach ($data['data'] as $key => $value) {
            [$projectId, $date] = explode('_', $key);
            
            DB::table('jour_activites')->updateOrInsert(
                [
                    'id_CRA' => $data['cra_id'],
                    'id_activité' => $projectId,
                    'date' => $date
                ],
                [
                    'type' => $value,
                    'description' => null,
                    'updated_at' => now(),
                    'created_at' => now()
                ]
            );
        }
        
        return response()->json([
            'success' => true,
            'message' => 'CRA sauvegardé avec succès'
        ]);
        
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la sauvegarde: ' . $e->getMessage()
        ], 500);
    }
});

// Submit CRA
Route::post('/employe/cra/submit', function (Request $request) {
    try {
        $data = $request->validate([
            'cra_id' => 'required|integer'
        ]);
        
        // Update CRA status and submission time - keep status as 'en_attente'
        DB::table('c_r_a_s')
            ->where('id_CRA', $data['cra_id'])
            ->update([
                'status' => 'en_attente',
                'submittedAT' => now(),
                'updated_at' => now()
            ]);
        
        return response()->json([
            'success' => true,
            'message' => 'CRA soumis avec succès'
        ]);
        
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la soumission: ' . $e->getMessage()
        ], 500);
    }
});

// Load CRA data
Route::get('/employe/cra/load', function (Request $request) {
    try {
        $year = $request->get('year');
        $month = $request->get('month');
        
        if (!$year || !$month) {
            return response()->json([]);
        }
        
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non connecté'
            ], 401);
        }
        $userId = $user->id_user;
        
        // Create date for the month
        $dateMois = sprintf('%04d-%02d-01', $year, $month);
        
        // Get CRA for this month
        $cra = DB::table('c_r_a_s')
            ->where('id_user', $userId)
            ->where('dateMois', $dateMois)
            ->first();
            
        if (!$cra) {
            return response()->json([]);
        }
        
        // Get all jour_activites for this CRA
        $activities = DB::table('jour_activites')
            ->where('id_CRA', $cra->id_CRA)
            ->get();
            
        $data = [];
        foreach ($activities as $activity) {
            $key = $activity->id_activité . '_' . $activity->date;
            $data[$key] = $activity->type;
        }
        
        return response()->json($data);
        
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors du chargement: ' . $e->getMessage()
        ], 500);
    }
});
