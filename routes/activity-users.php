<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use App\Models\Utilisateur;
use App\Models\UserAct;

// Route pour la page de gestion des utilisateurs assignés à une activité
Route::get('/admin/activities/{id}/users', function ($id) {
    return view('admin.activity-users');
});

// API pour récupérer les utilisateurs assignés à une activité
Route::get('/api/activities/{id}/assigned-users', function ($id) {
    try {
        // Récupérer les assignations depuis la table user__acts avec les informations utilisateur
        $assignedUsers = UserAct::forActivity($id)
            ->active()
            ->with('utilisateur')
            ->get()
            ->map(function ($assignment) {
                return [
                    'id_assignement' => $assignment->id_assignement,
                    'id_user' => $assignment->id_user,
                    'nom_user' => $assignment->utilisateur->nom_user,
                    'email_user' => $assignment->utilisateur->email_user,
                    'role' => $assignment->utilisateur->role,
                    'role_projet' => $assignment->role_projet,
                    'status' => $assignment->status,
                    'total_travaille' => $assignment->total_travaille,
                    'assigned_at' => $assignment->created_at->format('Y-m-d'),
                    'validator_name' => null // À implémenter si nécessaire
                ];
            })
            ->toArray();
        
        Log::info('Fetching assigned users for activity', [
            'activity_id' => $id,
            'users_count' => count($assignedUsers)
        ]);
        
        return response()->json([
            'success' => true,
            'users' => $assignedUsers
        ]);
    } catch (Exception $e) {
        Log::error('Error fetching assigned users', [
            'activity_id' => $id,
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors du chargement des utilisateurs assignés'
        ], 500);
    }
});

// API pour assigner un utilisateur à une activité
Route::post('/api/assign-user-to-activity', function (Request $request) {
    try {
        $userId = $request->input('user_id');
        $activityId = $request->input('activity_id');
        
        Log::info('Assigning user to activity', [
            'user_id' => $userId,
            'activity_id' => $activityId
        ]);
        
        // Vérifier que l'utilisateur existe
        $user = Utilisateur::where('id_user', $userId)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur introuvable'
            ], 404);
        }
        
        // Vérifier que l'utilisateur est un employé ou sous-traitant
        if (!in_array($user->role, ['employé', 'sous-traitant'])) {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les employés et sous-traitants peuvent être assignés'
            ], 400);
        }
        
        // Vérifier si l'utilisateur n'est pas déjà assigné à cette activité
        $existingAssignment = UserAct::forActivity($activityId)
            ->forUser($userId)
            ->active()
            ->first();
            
        if ($existingAssignment) {
            return response()->json([
                'success' => false,
                'message' => "L'utilisateur {$user->nom_user} est déjà assigné à cette activité"
            ], 400);
        }
        
        // Créer l'assignation dans la base de données
        $assignment = UserAct::create([
            'id_user' => $userId,
            'id_activité' => $activityId,
            'role_projet' => $user->role,
            'status' => 'actif',
            'total_travaille' => 0
        ]);
        
        Log::info('User assigned to activity successfully', [
            'user_id' => $userId,
            'activity_id' => $activityId,
            'user_name' => $user->nom_user,
            'assignment_id' => $assignment->id_assignement
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Utilisateur assigné avec succès'
        ]);
        
    } catch (Exception $e) {
        Log::error('Error assigning user to activity', [
            'error' => $e->getMessage(),
            'request_data' => $request->all()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de l\'assignation'
        ], 500);
    }
});

// API pour assigner plusieurs utilisateurs à une activité
Route::post('/api/assign-multiple-users-to-activity', function (Request $request) {
    try {
        $userIds = $request->input('user_ids', []);
        $activityId = $request->input('activity_id');
        
        if (empty($userIds) || !is_array($userIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun utilisateur sélectionné'
            ], 400);
        }
        
        Log::info('Assigning multiple users to activity', [
            'user_ids' => $userIds,
            'activity_id' => $activityId,
            'count' => count($userIds)
        ]);
        
        $assignedUsers = [];
        $errors = [];
        
        foreach ($userIds as $userId) {
            // Vérifier que l'utilisateur existe
            $user = Utilisateur::where('id_user', $userId)->first();
            if (!$user) {
                $errors[] = "Utilisateur ID $userId introuvable";
                continue;
            }
            
            // Vérifier que l'utilisateur est un employé ou sous-traitant
            if (!in_array($user->role, ['employé', 'sous-traitant'])) {
                $errors[] = "L'utilisateur {$user->nom_user} ne peut pas être assigné (rôle: {$user->role})";
                continue;
            }
            
            // Vérifier si l'utilisateur n'est pas déjà assigné à cette activité
            $existingAssignment = UserAct::forActivity($activityId)
                ->forUser($userId)
                ->active()
                ->first();
                
            if ($existingAssignment) {
                $errors[] = "L'utilisateur {$user->nom_user} est déjà assigné à cette activité";
                continue;
            }
            
            // Créer l'assignation dans la base de données
            $assignment = UserAct::create([
                'id_user' => $userId,
                'id_activité' => $activityId,
                'role_projet' => $user->role, // Utiliser le rôle de l'utilisateur par défaut
                'status' => 'actif',
                'total_travaille' => 0
            ]);
            
            $assignedUsers[] = [
                'id' => $user->id_user,
                'name' => $user->nom_user,
                'role' => $user->role,
                'assignment_id' => $assignment->id_assignement
            ];
        }
        
        $successCount = count($assignedUsers);
        $errorCount = count($errors);
        
        Log::info('Multiple users assignment completed', [
            'activity_id' => $activityId,
            'success_count' => $successCount,
            'error_count' => $errorCount,
            'assigned_users' => $assignedUsers,
            'errors' => $errors
        ]);
        
        if ($successCount > 0) {
            $message = $errorCount > 0 
                ? "$successCount utilisateur(s) assigné(s) avec succès, $errorCount erreur(s)"
                : "$successCount utilisateur(s) assigné(s) avec succès";
            
            return response()->json([
                'success' => true,
                'message' => $message,
                'assigned_count' => $successCount,
                'error_count' => $errorCount,
                'errors' => $errors
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Aucun utilisateur n\'a pu être assigné',
                'errors' => $errors
            ], 400);
        }
        
    } catch (Exception $e) {
        Log::error('Error assigning multiple users to activity', [
            'error' => $e->getMessage(),
            'request_data' => $request->all()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de l\'assignation multiple'
        ], 500);
    }
});

// API pour désassigner un utilisateur d'une activité
Route::post('/api/unassign-user-from-activity', function (Request $request) {
    try {
        $userId = $request->input('user_id');
        $activityId = $request->input('activity_id');
        
        Log::info('Unassigning user from activity', [
            'user_id' => $userId,
            'activity_id' => $activityId
        ]);
        
        // Vérifier que l'utilisateur existe
        $user = Utilisateur::where('id_user', $userId)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur introuvable'
            ], 404);
        }
        
        // Trouver l'assignation active pour cet utilisateur et cette activité
        $assignment = UserAct::forActivity($activityId)
            ->forUser($userId)
            ->active()
            ->first();
            
        if (!$assignment) {
            return response()->json([
                'success' => false,
                'message' => "L'utilisateur {$user->nom_user} n'est pas assigné à cette activité"
            ], 404);
        }
        
        // Marquer l'assignation comme inactive au lieu de la supprimer
        $assignment->update(['status' => 'inactif']);
        
        Log::info('User unassigned from activity successfully', [
            'user_id' => $userId,
            'activity_id' => $activityId,
            'user_name' => $user->nom_user,
            'assignment_id' => $assignment->id_assignement
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Utilisateur désassigné avec succès'
        ]);
        
    } catch (Exception $e) {
        Log::error('Error unassigning user from activity', [
            'error' => $e->getMessage(),
            'request_data' => $request->all()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la désassignation'
        ], 500);
    }
});
