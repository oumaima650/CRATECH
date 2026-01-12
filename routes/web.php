<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AcceuilController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\ValidateurController;
use App\Models\Utilisateur;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

// Route d'accueil
Route::get('/', [AcceuilController::class, 'index'])->name('accueil');

// Page utilisateurs HTML publique (pas d'auth)
Route::get('/admin/users.html', function () {
    $path = resource_path('views/admin/users.html');
    if (file_exists($path)) {
        $content = file_get_contents($path);
        // Remplacer le token CSRF
        $content = str_replace('{{ csrf_token() }}', csrf_token(), $content);
        return response($content)->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// Page création utilisateur HTML publique (pas d'auth)
Route::get('/admin/users/create.html', function () {
    $path = resource_path('views/admin/users/create.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// Page activités HTML publique (pas d'auth)
Route::get('/admin/activities.html', function () {
    $path = resource_path('views/admin/activities.html');
    if (file_exists($path)) {
        $content = file_get_contents($path);
        // Remplacer le token CSRF
        $content = str_replace('{{ csrf_token() }}', csrf_token(), $content);
        return response($content)->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// Page création activité HTML publique (pas d'auth)
Route::get('/admin/activities/create.html', function () {
    $path = resource_path('views/admin/activities/create.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// Page dashboard HTML publique (pas d'auth)
Route::get('/admin/dashboard.html', function () {
    $path = resource_path('views/admin/dashboard.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// Page compte admin HTML publique (pas d'auth)
Route::get('/admin/account.html', function () {
    $path = resource_path('views/admin/account.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// Page Admin voir-cra HTML (pas d'auth)
Route::get('/admin/voir-cra.html', function () {
    $path = resource_path('views/admin/voir-cra.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// Page Admin voir-cra-admin HTML (pas d'auth)
Route::get('/admin/voir-cra-admin.html', function () {
    $path = resource_path('views/admin/voir-cra-admin.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// API non-authentifiée pour les détails CRA admin (pour les pages HTML statiques)
Route::get('/admin/api/cra/{id}/details-public', function ($id) {
    try {
        $cra = DB::table('c_r_a_s')
            ->join('utilisateurs', 'c_r_a_s.id_user', '=', 'utilisateurs.id_user')
            ->where('c_r_a_s.id_CRA', $id)
            ->select('c_r_a_s.*', 'utilisateurs.nom_user', 'utilisateurs.email_user')
            ->first();

        if (!$cra) {
            return response()->json(['success' => false, 'message' => 'CRA introuvable'], 404);
        }

        // Récupérer les activités utilisées dans ce CRA
        $activities = DB::table('jour_activites')
            ->join('activités', 'jour_activites.id_activité', '=', 'activités.id_activité')
            ->where('jour_activites.id_CRA', $id)
            ->select('activités.id_activité', 'activités.nom_act', 'activités.description')
            ->distinct()
            ->get();

        $projects = $activities->map(function($a){ 
            return [
                'id' => $a->id_activité, 
                'name' => $a->nom_act, 
                'code' => substr($a->nom_act,0,5)
            ]; 
        });

        // Récupérer les données jour par jour
        $journal = DB::table('jour_activites')->where('id_CRA', $id)->get();

        $data = [];
        foreach ($journal as $item) {
            $data[$item->id_activité . '_' . $item->date] = $item->type;
        }

        return response()->json([
            'success' => true,
            'cra' => [
                'id_CRA' => $cra->id_CRA,
                'dateMois' => $cra->dateMois,
                'status' => $cra->status,
                'submittedAT' => $cra->submittedAT,
                'user' => [
                    'nom_user' => $cra->nom_user,
                    'email_user' => $cra->email_user
                ]
            ],
            'projects' => $projects,
            'data' => $data
        ]);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
});

// Export Excel pour admin (non-authentifié)
Route::get('/admin/cra/export-excel-public', function () {
    try {
        $craId = request('cra');
        $month = request('month', 9);
        $year = request('year', 2025);
        
        if (!$craId) {
            return response()->json(['error' => 'CRA ID manquant'], 400);
        }

        // Récupérer les informations du CRA
        $cra = DB::table('c_r_a_s')
            ->join('utilisateurs', 'c_r_a_s.id_user', '=', 'utilisateurs.id_user')
            ->where('c_r_a_s.id_CRA', $craId)
            ->select('c_r_a_s.*', 'utilisateurs.nom_user', 'utilisateurs.email_user')
            ->first();

        if (!$cra) {
            return response()->json(['error' => 'CRA introuvable'], 404);
        }

        // Récupérer les activités utilisées dans ce CRA
        $activities = DB::table('jour_activites')
            ->join('activités', 'jour_activites.id_activité', '=', 'activités.id_activité')
            ->where('jour_activites.id_CRA', $craId)
            ->select('activités.id_activité', 'activités.nom_act')
            ->distinct()
            ->get();

        // Récupérer les données jour par jour
        $journal = DB::table('jour_activites')->where('id_CRA', $craId)->get();

        $data = [];
        foreach ($journal as $item) {
            $data[$item->id_activité . '_' . $item->date] = $item->type;
        }

        // Générer le contenu Excel
        $monthNames = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril', 
            5 => 'Mai', 6 => 'Juin', 7 => 'Juillet', 8 => 'Août',
            9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
        ];
        
        $monthName = $monthNames[$month + 1] ?? 'Mois';
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month + 1, $year);
        
        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
        th, td { border: 1px solid #000; padding: 5px; text-align: center; }
        .header { background-color: #E6E6FA; font-weight: bold; }
        .project { background-color: #F0F8FF; text-align: left; font-weight: bold; }
        .weekend { background-color: #F5F5F5; }
        .total { background-color: #FFE4B5; font-weight: bold; }
    </style>
</head>
<body>
    <h2>CRA - ' . $monthName . ' ' . $year . ' - ' . $cra->nom_user . '</h2>
    <table>
        <thead>
            <tr class="header">
                <th class="project">Projet</th>';
        
        // Header days
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $dayDate = mktime(0, 0, 0, $month + 1, $day, $year);
            $isWeekend = date('w', $dayDate) == 0 || date('w', $dayDate) == 6;
            $weekendClass = $isWeekend ? ' weekend' : '';
            $html .= '<th class="header' . $weekendClass . '">' . $day . '</th>';
        }
        
        $html .= '<th class="header total">Total</th></tr></thead><tbody>';
        
        // Project rows
        foreach ($activities as $activity) {
            $html .= '<tr><td class="project">' . $activity->nom_act . '</td>';
            
            $rowTotal = 0;
            for ($day = 1; $day <= $daysInMonth; $day++) {
                $dateKey = $year . '-' . str_pad($month + 1, 2, '0', STR_PAD_LEFT) . '-' . str_pad($day, 2, '0', STR_PAD_LEFT);
                $cellKey = $activity->id_activité . '_' . $dateKey;
                $value = $data[$cellKey] ?? '0';
                $rowTotal += floatval($value);
                
                $dayDate = mktime(0, 0, 0, $month + 1, $day, $year);
                $isWeekend = date('w', $dayDate) == 0 || date('w', $dayDate) == 6;
                $weekendClass = $isWeekend ? ' weekend' : '';
                
                $html .= '<td class="' . $weekendClass . '">' . $value . '</td>';
            }
            
            $html .= '<td class="total">' . number_format($rowTotal, 1) . '</td></tr>';
        }
        
        $html .= '</tbody></table></body></html>';
        
        $filename = 'CRA_' . $monthName . '_' . $year . '_' . $cra->nom_user . '_ID' . $craId . '.xls';
        
        return response($html)
            ->header('Content-Type', 'application/vnd.ms-excel;charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
            
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Page CRA HTML publique (pas d'auth)
Route::get('/admin/cra.html', function () {
    $path = resource_path('views/admin/cra.html');
    if (!file_exists($path)) {
        abort(404);
    }
    $html = file_get_contents($path);

    // Charger seulement les CRA soumis
    $cras = DB::table('c_r_a_s')
        ->leftJoin('utilisateurs', 'c_r_a_s.id_user', '=', 'utilisateurs.id_user')
        ->whereNotNull('c_r_a_s.submittedAt')
        ->orderByDesc('c_r_a_s.created_at')
        ->select(
            'c_r_a_s.id_CRA',
            'c_r_a_s.dateMois',
            'c_r_a_s.status',
            'c_r_a_s.created_at',
            'c_r_a_s.submittedAt',
            'utilisateurs.nom_user',
            'utilisateurs.email_user'
        )
        ->get();

   // Générer le HTML du tableau
    $rowsHtml = '';
    if ($cras->isEmpty()) {
        $rowsHtml = '<tr><td colspan="6" class="empty-state"><i class="fas fa-file-alt"></i> Aucun CRA</td></tr>';
    } else {
        foreach ($cras as $r) {
            $id = htmlspecialchars($r->id_CRA);
            $userName = htmlspecialchars($r->nom_user ?? 'N/A');
            $userEmail = htmlspecialchars($r->email_user ?? '');
            $dateObj = \Carbon\Carbon::parse($r->dateMois);
            $monthIndex = (int)$dateObj->format('n');
            $year = (int)$dateObj->format('Y');
            $period = $monthIndex . '/' . $year; // Format MM/YYYY
            $statusKey = htmlspecialchars($r->status ?? '');
            $statusText = ($statusKey === 'en_attente' ? 'En attente' : ($statusKey === 'valide' ? 'Validé' : ($statusKey === 'refuse' ? 'Refusé' : $statusKey)));
            $createdAt = htmlspecialchars($r->created_at);
            $monthZero = max(0, $monthIndex - 1); // 0-based month for URL
            $rowsHtml .= '<tr>'
                . "<td><span class='id-number'>#$id</span></td>"
                . '<td>'
                    . '<div class="user-cell">'
                        . '<div class="user-cell-avatar" style="background: linear-gradient(135deg, var(--primary-blue), var(--primary-violet)); color: white;">'
                            . '<i class="fas fa-user"></i>'
                        . '</div>'
                        . '<div class="user-cell-info">'
                            . '<span class="user-cell-name" style="font-weight: 600; color: var(--gray-900);">' . $userName . '</span>'
                            . '<span class="user-cell-email" style="font-size: 0.8rem; color: var(--gray-500);">' . $userEmail . '</span>'
                        . '</div>'
                    . '</div>'
                . '</td>'
                . '<td>'
                    . '<div style="display: flex; align-items: center; gap: 0.5rem;">'
                        . '<i class="far fa-calendar-alt" style="color: var(--primary-blue);"></i>'
                        . '<span class="period-month" style="font-weight: 500;">' . $period . '</span>'
                    . '</div>'
                . '</td>'
                . '<td><span class="status-badge ' . $statusKey . '"><i class="fas ' . ($statusKey === 'valide' ? 'fa-check-circle' : ($statusKey === 'refuse' ? 'fa-times-circle' : 'fa-clock')) . '"></i>' . $statusText . '</span></td>'
                . '<td>'
                    . '<div style="display: flex; flex-direction: column;">'
                        . '<span class="date-created" style="font-size: 0.9rem; font-weight: 500;">' . \Carbon\Carbon::parse($r->submittedAt)->format('d/m/Y') . '</span>'
                        . '<span style="font-size: 0.75rem; color: var(--gray-400);">' . \Carbon\Carbon::parse($r->submittedAt)->format('H:i') . '</span>'
                    . '</div>'
                . '</td>'
                . '<td>'
                    . '<div class="action-buttons" style="display:flex; gap:10px; justify-content: center;">'
                        . '<button class="btn-action btn-view" title="Voir les détails" data-id="' . $id . '" data-period="' . $period . '">'
                            . '<i class="fas fa-eye"></i>'
                        . '</button>'
                        . (($statusKey === 'en_attente') ? (
                            '<button class="btn-action btn-validate action-validate" title="Valider le CRA" data-id="' . $id . '" style="border-color: var(--success); color: var(--success);">'
                                . '<i class="fas fa-check"></i>'
                            . '</button>' .
                            '<button class="btn-action btn-reject action-reject" title="Refuser le CRA" data-id="' . $id . '" style="border-color: var(--danger); color: var(--danger);">'
                                . '<i class="fas fa-times"></i>'
                            . '</button>'
                        ) : '')
                    . '</div>'
                . '</td>'
            . '</tr>';
        }
    }

    // Remplacer le contenu du tbody
    $html = preg_replace('/<tbody id="craTbody">.*?<\/tbody>/s', '<tbody id="craTbody">' . $rowsHtml . '</tbody>', $html);

    return response($html)->header('Content-Type', 'text/html; charset=utf-8');
});
// API pour les statistiques du dashboard admin (Chart.js)
Route::get('/api/admin/stats', [AdminController::class, 'getDashboardStats']);

// API pour les statistiques du dashboard admin
Route::get('/api/admin/dashboard-stats', function () {
    try {
        // Statistiques des utilisateurs avec requêtes directes
        $totalUsers = DB::select("SELECT COUNT(*) as count FROM utilisateurs")[0]->count ?? 0;
        $activeUsers = DB::select("SELECT COUNT(*) as count FROM utilisateurs WHERE status = 'actif'")[0]->count ?? 0;
        
        // Statistiques des CRA avec requêtes directes
        $totalCRA = DB::select("SELECT COUNT(*) as count FROM c_r_a_s")[0]->count ?? 0;
        $pendingCRA = DB::select("SELECT COUNT(*) as count FROM c_r_a_s WHERE status = 'en_attente'")[0]->count ?? 0;
        $approvedCRA = DB::select("SELECT COUNT(*) as count FROM c_r_a_s WHERE status = 'validé'")[0]->count ?? 0;

        // Statistiques des activités
        $totalActivities = DB::select("SELECT COUNT(*) as count FROM activités")[0]->count ?? 0;
        $activeActivities = DB::select("SELECT COUNT(*) as count FROM activités WHERE status = 'actif'")[0]->count ?? 0;

        // Taux de validation calculé
        $validationRate = $totalCRA > 0 ? round(($approvedCRA / $totalCRA) * 100, 1) : 0;
        
        // Calcul de croissance réaliste basé sur les données
        $userGrowth = $activeUsers > 0 ? '+' . round(($activeUsers / max($totalUsers, 1)) * 100, 0) . '%' : '0%';
        $craGrowth = $totalCRA > 10 ? '+8%' : ($totalCRA > 0 ? '+' . ($totalCRA * 10) . '%' : '0%');
        
        // Activités récentes avec gestion d'erreur
        $recentActivities = [];
        try {
            $recentActivities = DB::select("
                SELECT c.*, u.nom_user, c.created_at, c.status, c.periode
                FROM c_r_a_s c 
                JOIN utilisateurs u ON c.id_utilisateur = u.id_utilisateur 
                ORDER BY c.created_at DESC 
                LIMIT 5
            ");
        } catch (Exception $e) {
            // Ignorer l'erreur et continuer avec un tableau vide
        }
        
        // CRA en attente avec gestion d'erreur
        $pendingApprovals = [];
        try {
            $pendingApprovals = DB::select("
                SELECT c.id_CRA, u.nom_user, c.periode, c.created_at
                FROM c_r_a_s c 
                JOIN utilisateurs u ON c.id_utilisateur = u.id_utilisateur 
                WHERE c.status = 'en_attente'
                ORDER BY c.created_at DESC 
                LIMIT 10
            ");
        } catch (Exception $e) {
            // Ignorer l'erreur et continuer avec un tableau vide
        }
        
        $response = [
            'success' => true,
            'stats' => [
                'users' => [
                    'total' => (int)$totalUsers,
                    'active' => (int)$activeUsers,
                    'growth' => $userGrowth
                ],
                'cra' => [
                    'total' => (int)$totalCRA,
                    'pending' => (int)$pendingCRA,
                    'approved' => (int)$approvedCRA,
                    'growth' => $craGrowth
                ],
                'activities' => [
                    'total' => (int)$totalActivities,
                    'active' => (int)$activeActivities
                ],
                'validation_rate' => (float)$validationRate
            ],
            'recent_activities' => $recentActivities,
            'pending_approvals' => $pendingApprovals
        ];
        
        return response()->json($response);
        
    } catch (Exception $e) {
        // Données de fallback avec calculs réalistes
        return response()->json([
            'success' => false,
            'stats' => [
                'users' => ['total' => 15, 'active' => 12, 'growth' => '+20%'],
                'cra' => ['total' => 45, 'pending' => 3, 'approved' => 38, 'growth' => '+15%'],
                'activities' => ['total' => 8, 'active' => 6],
                'validation_rate' => 84.4
            ],
            'recent_activities' => [
                (object)[
                    'nom_user' => 'Jean Dupont',
                    'periode' => 'Janvier 2024',
                    'statut' => 'validé',
                    'created_at' => date('Y-m-d H:i:s', strtotime('-15 minutes'))
                ],
                (object)[
                    'nom_user' => 'Marie Martin',
                    'periode' => 'Janvier 2024',
                    'statut' => 'en_attente',
                    'created_at' => date('Y-m-d H:i:s', strtotime('-1 hour'))
                ]
            ],
            'pending_approvals' => [
                (object)[
                    'id_CRA' => '1',
                    'nom_user' => 'Pierre Durand',
                    'periode' => 'Janvier 2024',
                    'created_at' => date('Y-m-d H:i:s', strtotime('-2 hours'))
                ]
            ],
            'error' => 'Utilisation des données de test: ' . $e->getMessage()
        ]);
    }
});
// API pour vérifier si un email existe déjà
Route::post('/admin/check-email', function (Request $request) {
    try {
        $email = $request->input('email');
        
        if (!$email) {
            return response()->json(['exists' => false]);
        }
        
        $exists = DB::table('utilisateurs')
            ->where('email_user', $email)
            ->exists();
            
        return response()->json(['exists' => $exists]);
        
    } catch (Exception $e) {
        return response()->json(['exists' => false, 'error' => $e->getMessage()]);
    }
});
// API pour changer le statut d'une activité (actif/inactif)
Route::put('/admin/activities/{id}/status', function (Request $request, $id) {
    try {
        $status = $request->input('status');
        
        if (!in_array($status, ['actif', 'inactif'])) {
            return response()->json(['success' => false, 'message' => 'Statut invalide']);
        }
        
        $updated = DB::table('activites')
            ->where('id_activité', $id)
            ->update(['status' => $status]);
            
        if ($updated) {
            return response()->json(['success' => true, 'message' => 'Statut mis à jour']);
        } else {
            return response()->json(['success' => false, 'message' => 'Activité non trouvée']);
        }
        
    } catch (Exception $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()]);
    }
});
// Page employe dashboard HTML publique (pas d'auth)
Route::get('/employe/dashboard.html', function () {
    $path = resource_path('views/employe/dashboard.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// Page employe mes-cra HTML publique (pas d'auth)
Route::get('/employe/mes-cra.html', function () {
    $path = resource_path('views/employe/mes-cra.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// API employe activities (avec authentification)
Route::get('/employe/activities', function () {
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

// API pour charger les données CRA (même logique que dans employe.php)
Route::get('/employe/cra/load', function (Request $request) {
    try {
        $year = $request->get('year');
        $month = $request->get('month');
        
        if (!$year || !$month) {
            return response()->json([]);
        }
        
        $user = Auth::user();
        if (!$user) {
            return response()->json([]);
        }
        
        // Find or create CRA for this month/year
        $cra = DB::table('c_r_a_s')
            ->where('id_user', $user->id_user)
            ->whereYear('dateMois', $year)
            ->whereMonth('dateMois', $month)
            ->first();
        
        if (!$cra) {
            return response()->json([]);
        }
        
        // Get CRA data from jour_activites table
        $craData = [];
        $journalActivites = DB::table('jour_activites')
            ->where('id_CRA', $cra->id_CRA)
            ->get();
        
        foreach ($journalActivites as $item) {
            $key = $item->id_activité . '_' . $item->date;
            $craData[$key] = $item->type;
        }
        
        return response()->json($craData);
        
    } catch (Exception $e) {
        return response()->json([]);
    }
});

// Page employe voir-cra HTML publique (pas d'auth)
Route::get('/employe/voir-cra.html', function () {
    $path = resource_path('views/employe/voir-cra.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// API pour voir un CRA spécifique - Version simplifiée
Route::get('/employe/cra/view/{craId}', function ($craId) {
    return response()->json([
        'success' => false,
        'message' => 'Route temporairement désactivée pour debug'
    ], 500);
});

// API pour voir un CRA spécifique - Version de test ultra simple
Route::get('/employe/cra/test/{craId}', function ($craId) {
    try {
        return response()->json([
            'success' => true,
            'message' => 'Test basique réussi',
            'craId' => $craId,
            'timestamp' => now()
        ]);
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
});

// API pour voir un CRA spécifique - Version sans auth pour debug
Route::get('/employe/cra/testdb/{craId}', function ($craId) {
    try {
        // Test direct sans authentification
        $cra = DB::table('c_r_a_s')
            ->where('id_CRA', $craId)
            ->first();
        
        if (!$cra) {
            return response()->json([
                'success' => false,
                'message' => 'CRA non trouvé avec ID: ' . $craId
            ], 404);
        }
        
        // Récupérer uniquement les activités utilisées dans ce CRA
        $activities = DB::table('jour_activites')
            ->join('activités', 'jour_activites.id_activité', '=', 'activités.id_activité')
            ->where('jour_activites.id_CRA', $craId)
            ->select('activités.id_activité', 'activités.nom_act', 'activités.description')
            ->distinct()
            ->get();
        
        $projects = [];
        foreach ($activities as $activity) {
            $projects[] = [
                'id' => $activity->id_activité,
                'name' => $activity->nom_act,
                'code' => substr($activity->nom_act, 0, 5)
            ];
        }
        
        // Récupérer TOUTES les données du CRA depuis jour_activites
        $journalActivites = DB::table('jour_activites')
            ->where('id_CRA', $craId)
            ->get();
        
        $craData = [];
        foreach ($journalActivites as $item) {
            $key = $item->id_activité . '_' . $item->date;
            $craData[$key] = $item->type;
        }
        
        return response()->json([
            'success' => true,
            'cra' => $cra,
            'projects' => $projects,
            'data' => $craData,
            'debug' => [
                'craId' => $craId,
                'cra_user_id' => $cra->id_user,
                'projects_count' => count($projects),
                'data_entries' => count($craData),
                'journal_entries' => $journalActivites->count(),
                'sample_data' => array_slice($craData, 0, 5, true),
                'all_journal_data' => $journalActivites->toArray()
            ]
        ]);
        
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// API pour exporter un CRA spécifique
Route::get('/employe/cra/export/{craId}', function ($craId) {
    try {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non connecté'
            ], 401);
        }
        
        // Récupérer les informations du CRA
        $cra = DB::table('c_r_a_s')
            ->where('id_CRA', $craId)
            ->where('id_user', $user->id_user)
            ->first();
        
        if (!$cra) {
            return response()->json([
                'success' => false,
                'message' => 'CRA non trouvé'
            ], 404);
        }
        
        // Récupérer les activités de l'utilisateur
        $activities = DB::table('user__acts')
            ->join('activités', 'user__acts.id_activité', '=', 'activités.id_activité')
            ->where('user__acts.id_user', $user->id_user)
            ->select('activités.id_activité', 'activités.nom_act', 'activités.description')
            ->get();
        
        $projects = $activities->map(function($activity) {
            return [
                'id' => $activity->id_activité,
                'name' => $activity->nom_act,
                'code' => substr($activity->nom_act, 0, 5)
            ];
        });
        
        // Récupérer les données du CRA
        $craData = DB::table('jour_activites')
            ->where('id_CRA', $craId)
            ->get()
            ->mapWithKeys(function($item) {
                return [$item->id_activité . '_' . $item->date => $item->type];
            });
        
        return response()->json([
            'success' => true,
            'craData' => [
                'projects' => $projects,
                'data' => $craData,
                'cra' => $cra
            ]
        ]);
        
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de l\'export du CRA: ' . $e->getMessage()
        ], 500);
    }
});

// API employe user-info (avec authentification)
Route::get('/employe/user-info', function () {
    try {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non connecté'
            ], 401);
        }
        
        return response()->json([
            'success' => true,
            'user' => [
                'id_user' => $user->id_user,
                'id' => $user->id_user,
                'nom' => $user->nom,
                'name' => $user->nom,
                'email' => $user->email,
                'role' => $user->role
            ]
        ]);
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des informations utilisateur'
        ], 500);
    }
});

// API employe mes-cra (avec données réelles de la base)
Route::get('/employe/mes-cra', function () {
    try {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non connecté'
            ], 401);
        }
        
        $userId = $user->id_user;
        
        // Récupérer tous les CRA de cet utilisateur depuis la table c_r_a_s
        $cras = DB::table('c_r_a_s')
            ->where('id_user', $userId)
            ->orderBy('dateMois', 'desc')
            ->get()
            ->map(function($cra) {
                // Un CRA est soumis uniquement si submittedAT n'est pas NULL
                $isSubmitted = !is_null($cra->submittedAT);
                
                return [
                    'id_CRA' => $cra->id_CRA,
                    'dateMois' => $cra->dateMois,
                    'status' => $cra->status,
                    'is_submitted' => $isSubmitted,
                    'submittedAT' => $cra->submittedAT,
                    'created_at' => $cra->created_at,
                    'updated_at' => $cra->updated_at
                ];
            });
        
        return response()->json([
            'success' => true,
            'cras' => $cras
        ]);
        
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des CRA: ' . $e->getMessage()
        ], 500);
    }
});
// API publique pour lister les utilisateurs (lecture seule)
Route::get('/api/public/users', function () {
    try {
        $query = Utilisateur::orderBy('created_at', 'desc');
        
        // Filtrer par rôle si spécifié
        if (request('role')) {
            $query->where('utilisateurs.role', request('role'));
          
        }
        
        $users = $query->leftJoin('utilisateurs as validators', 'utilisateurs.id_validateur', '=', 'validators.id_user')
            ->select(
                'utilisateurs.id_user',
                'utilisateurs.nom_user',
                'utilisateurs.email_user', 
                'utilisateurs.role',
                'utilisateurs.status',
                'utilisateurs.created_at',
                'utilisateurs.id_validateur',
                'validators.nom_user as validator_nom',
                'validators.email_user as validator_email'
            )
            ->get();
            

    
    // Ajouter les informations du validateur
    $users->each(function ($user) {
        if ($user->id_validateur && $user->validator_nom) {
            $user->validator = [
                'id' => $user->id_validateur,
                'nom' => $user->validator_nom,
                'email' => $user->validator_email
            ];
        } else {
            $user->validator = null;
        }
        // Nettoyer les champs temporaires
        unset($user->validator_nom, $user->validator_email);
    });
    
    // Calculer les statistiques seulement si pas de filtre
    $stats = null;
    if (!request('role')) {
        $allUsers = Utilisateur::all();
        $totalUsers = $allUsers->count();
        $administrators = $allUsers->where('role', 'administrateur')->count();
        $validators = $allUsers->where('role', 'validateur')->count();
        $employees = $allUsers->whereIn('role', ['employé', 'sous-traitant'])->count();
        $activeUsers = $allUsers->where('status', 'actif')->count();
        
        $stats = [
            'total' => $totalUsers,
            'administrators' => $administrators,
            'validators' => $validators,
            'employees' => $employees,
            'active' => $activeUsers
        ];
    }
    
        return response()->json([
            'users' => $users,
            'stats' => $stats
        ]);
        
    } catch (\Exception $e) {
       
        return response()->json([
            'error' => $e->getMessage(),
            'users' => [],
            'stats' => null
        ], 500);
    }
});

// API pour affecter un validateur à un utilisateur
Route::post('/api/assign-validator', function () {
    try {
        $request = request();
        $userId = $request->input('user_id');
        $validatorId = $request->input('id_validateur');
        $note = $request->input('note');
        
        // Vérifier que l'utilisateur existe
        $user = Utilisateur::where('id_user', $userId)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur introuvable'
            ], 404);
        }
        
        // Vérifier que le validateur existe et a le bon rôle
        $validator = Utilisateur::where('id_user', $validatorId)
            ->where('role', 'validateur')
            ->first();
        if (!$validator) {
            return response()->json([
                'success' => false,
                'message' => 'Validateur introuvable ou rôle incorrect'
            ], 404);
        }
        
        // Vérifier que l'utilisateur peut avoir un validateur
        if (!in_array($user->role, ['employé', 'sous-traitant'])) {
            return response()->json([
                'success' => false,
                'message' => 'Seuls les employés et sous-traitants peuvent avoir un validateur'
            ], 400);
        }
        
        // Mettre à jour l'utilisateur
        $user->id_validateur = $validatorId;
        $user->save();
        
        // Optionnel: Enregistrer la note dans une table séparée si nécessaire
        // ValidationAssignment::create([
        //     'user_id' => $userId,
        //     'validator_id' => $validatorId,
        //     'note' => $note,
        //     'assigned_at' => now()
        // ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Validateur affecté avec succès',
            'data' => [
                'user_id' => $userId,
                'validator_id' => $validatorId,
                'validator_name' => $validator->nom_user
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de l\'affectation: ' . $e->getMessage()
        ], 500);
    }
});

// API publique pour lister les activités (lecture seule)
Route::get('/api/public/activities', function () {
    try {
        // Utiliser DB::table au lieu du modèle pour éviter les erreurs
        $activities = DB::table('activites')
            ->select('id_activité', 'nom_act', 'description', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Ajouter le nombre d'utilisateurs assignés (simulé)
        $activities = $activities->map(function ($activity) {
            $activity->assigned_users = rand(0, 5);
            return $activity;
        });
        
        // Calculer les statistiques
        $totalActivities = $activities->count();
        $activeActivities = $activities->where('status', 'actif')->count();
        $inactiveActivities = $activities->where('status', 'inactif')->count();
        $totalAssignments = $activities->sum('assigned_users');
        
        return response()->json([
            'activities' => $activities,
            'stats' => [
                'total' => $totalActivities,
                'active' => $activeActivities,
                'inactive' => $inactiveActivities,
                'assignments' => $totalAssignments
            ]
        ]);
    } catch (Exception $e) {
        return response()->json([
            'activities' => [],
            'stats' => [
                'total' => 0,
                'active' => 0,
                'inactive' => 0,
                'assignments' => 0
            ],
            'error' => $e->getMessage()
        ]);
    }
});

// Routes d'authentification
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register']);
Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.forgot');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');

// Route pour récupérer le token CSRF
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
});

// API publique pour lister les CRA (lecture seule)
Route::get('/api/cra', function () {
    try {
        $page = (int) request('page', 1);
        $perPage = (int) request('per_page', 20);
        $page = max(1, $page);
        $perPage = max(1, min(100, $perPage));

        $total = DB::table('c_r_a_s')->count();
        $rows = DB::table('c_r_a_s')
            ->orderByDesc('created_at')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get()
            ->map(function ($r) {
                return [
                    'id_CRA' => $r->id_CRA ?? null,
                    'dateMois' => $r->dateMois ?? null,
                    'status' => $r->status ?? null,
                    'created_at' => $r->created_at ?? null,
                    'updated_at' => $r->updated_at ?? null,
                    'submittedAT' => $r->submittedAT ?? null,
                    'utilisateur' => [
                        'id_user' => $r->id_user ?? null,
                        'nom_user' => '',
                        'email_user' => '',
                    ],
                ];
            });

        $lastPage = (int) ceil($total / $perPage);
        $from = $total ? (($page - 1) * $perPage) + 1 : 0;
        $to = min($page * $perPage, $total);

        return response()->json([
            'cras' => $rows ?? [],
            'pagination' => [
                'current_page' => $page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
                'total' => $total,
                'from' => $from,
                'to' => $to,
            ],
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'cras' => [],
            'pagination' => [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 20,
                'total' => 0,
                'from' => 0,
                'to' => 0,
            ],
            'error' => 'Erreur lors du chargement des CRA: ' . $e->getMessage(),
        ], 200);
    }
});

// Routes protégées par authentification
Route::middleware(['auth'])->group(function () {
    
   Route::prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
    
    // REMPLACE la fonction anonyme par l'appel à ta méthode du contrôleur
    Route::get('/users', [AdminController::class, 'users'])->name('admin.users');
    
    Route::get('/api/users', [AdminController::class, 'getUsersData'])->name('admin.api.users');
    Route::get('/users/create', [AdminController::class, 'createUser'])->name('admin.users.create');
    Route::post('/users', [AdminController::class, 'storeUser'])->name('admin.users.store');
    Route::get('/users/{id}/edit', [AdminController::class, 'editUser'])->name('admin.users.edit');
    Route::get('/api/users/{id}', [AdminController::class, 'getUserData'])->name('admin.api.user');
    Route::put('/users/{id}', [AdminController::class, 'updateUser'])->name('admin.users.update');
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser'])->name('admin.users.delete');
    
    // Routes pour les activités
    Route::get('/activities', [AdminController::class, 'activities'])->name('admin.activities');
    Route::get('/activities/create', [AdminController::class, 'createActivity'])->name('admin.activities.create');
    Route::post('/activities', [AdminController::class, 'storeActivity'])->name('admin.activities.store');
    Route::get('/activities/{id}/edit', [AdminController::class, 'editActivity'])->name('admin.activities.edit');
    Route::put('/activities/{id}', [AdminController::class, 'updateActivity'])->name('admin.activities.update');
    Route::put('/activities/{id}/status', [AdminController::class, 'updateActivityStatus'])->name('admin.activities.status');
    Route::delete('/activities/{id}', [AdminController::class, 'deleteActivity'])->name('admin.activities.delete');
        
        

        // Routes pour les validateurs
        Route::get('/validators', [AdminController::class, 'validators'])->name('admin.validators');
        Route::get('/api/validators', [AdminController::class, 'getValidatorsData'])->name('admin.api.validators');
        Route::get('/validators/create', [AdminController::class, 'createValidator'])->name('admin.validators.create');
        Route::post('/validators', [AdminController::class, 'storeValidator'])->name('admin.validators.store');
        Route::get('/validators/{id}/edit', [AdminController::class, 'editValidator'])->name('admin.validators.edit');
        Route::get('/api/validators/{id}', [AdminController::class, 'getValidatorData'])->name('admin.api.validator');
        Route::put('/validators/{id}', [AdminController::class, 'updateValidator'])->name('admin.validators.update');
        Route::delete('/validators/{id}', [AdminController::class, 'deleteValidator'])->name('admin.validators.delete');
        
        // CRA management
        Route::get('/api/cra', [AdminController::class, 'getCrasData'])->name('admin.api.cra');
        Route::post('/cra/{id}/validate', [AdminController::class, 'validateCra'])->name('admin.cra.validate');
        Route::post('/cra/{id}/reject', [AdminController::class, 'rejectCra'])->name('admin.cra.reject');
        Route::get('/cra/{id}/view', [AdminController::class, 'viewCra'])->name('admin.cra.view');

        // API: détails d'un CRA pour affichage dans l'interface admin
        Route::get('/api/cra/{id}/details', function ($id) {
            try {
                $user = Auth::user();
                if (!$user || $user->role !== 'administrateur') {
                    return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
                }

                $cra = DB::table('c_r_a_s')
                    ->join('utilisateurs', 'c_r_a_s.id_user', '=', 'utilisateurs.id_user')
                    ->where('c_r_a_s.id_CRA', $id)
                    ->select('c_r_a_s.*', 'utilisateurs.nom_user', 'utilisateurs.email_user')
                    ->first();

                if (!$cra) {
                    return response()->json(['success' => false, 'message' => 'CRA introuvable'], 404);
                }

                // Récupérer les activités utilisées dans ce CRA
                $activities = DB::table('jour_activites')
                    ->join('activités', 'jour_activites.id_activité', '=', 'activités.id_activité')
                    ->where('jour_activites.id_CRA', $id)
                    ->select('activités.id_activité', 'activités.nom_act', 'activités.description')
                    ->distinct()
                    ->get();
                    $projects = $activities->map(function($a){ return ['id' => $a->id_activité, 'name' => $a->nom_act, 'code' => substr($a->nom_act,0,5)]; });

                // Récupérer les données jour par jour
                $journal = DB::table('jour_activites')->where('id_CRA', $id)->get();

                $data = [];
                foreach ($journal as $item) {
                    $data[$item->id_activité . '_' . $item->date] = $item->type;
                }

                return response()->json([
                    'success' => true,
                    'cra' => [
                        'id_CRA' => $cra->id_CRA,
                        'dateMois' => $cra->dateMois,
                        'status' => $cra->status,
                        'submittedAT' => $cra->submittedAT,
                        'user' => [
                            'nom_user' => $cra->nom_user,
                            'email_user' => $cra->email_user
                        ]
                    ],
                    'projects' => $projects,
                    'data' => $data
                ]);
            } catch (\Exception $e) {
                return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
            }
        });
    });

    // Alias API CRA sans préfixe pour fallback frontend (protégé par auth)
    Route::get('/api/cra', [AdminController::class, 'getCrasData'])->name('api.cra');
    
    // Routes pour les employés
    Route::prefix('employe')->group(function () {
        Route::get('/dashboard', [EmployeController::class, 'dashboard'])->name('employe.dashboard');
        Route::post('/cra/save', [EmployeController::class, 'saveCra'])->name('employe.cra.save');
        
        // API routes for CRA system
        Route::get('/user-info', function () {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Non connecté'], 401);
            }
            return response()->json([
                'success' => true,
                'user' => ['id' => $user->id_user, 'nom' => $user->nom_user, 'email' => $user->email_user]
            ]);
        });
        
        Route::get('/activities', function () {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Non connecté'], 401);
            }
            
            $activities = DB::table('user__acts')
                ->join('activités', 'user__acts.id_activité', '=', 'activités.id_activité')
                ->where('user__acts.id_user', $user->id_user)
                ->select('activités.id_activité', 'activités.nom_act', 'activités.description')
                ->get();
            
            return response()->json(['success' => true, 'activities' => $activities]);
        });
        
        Route::post('/cra/create', function () {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Non connecté'], 401);
            }
            
            $data = request()->validate([
                'year' => 'required|integer',
                'month' => 'required|integer|min:1|max:12',
                'status' => 'string|in:en_attente,valide,refuse'
            ]);
            
            $dateMois = sprintf('%04d-%02d-01', $data['year'], $data['month']);
            
            $existingCRA = DB::table('c_r_a_s')
                ->where('id_user', $user->id_user)
                ->where('dateMois', $dateMois)
                ->first();
                
            if ($existingCRA) {
                return response()->json(['success' => true, 'cra_id' => $existingCRA->id_CRA]);
            }
            
            $craId = DB::table('c_r_a_s')->insertGetId([
                'id_user' => $user->id_user,
                'dateMois' => $dateMois,
                'status' => $data['status'] ?? 'en_attente',
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            return response()->json(['success' => true, 'cra_id' => $craId]);
        });
        
        Route::post('/cra/autosave', function () {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Non connecté'], 401);
            }
            
            $data = request()->validate([
                'cra_id' => 'required|integer',
                'data' => 'required|array'
            ]);
            
            foreach ($data['data'] as $key => $value) {
                [$projectId, $date] = explode('_', $key);
                
                DB::table('jour_activites')->updateOrInsert(
                    ['id_CRA' => $data['cra_id'], 'id_activité' => $projectId, 'date' => $date],
                    ['type' => $value, 'updated_at' => now()]
                );
            }
            
            return response()->json(['success' => true]);
        });
        
        Route::post('/cra/submit', function () {
            try {
                $user = Auth::user();
                if (!$user) {
                    return response()->json(['success' => false, 'message' => 'Non connecté'], 401);
                }
                
                $data = request()->validate([
                    'cra_id' => 'required|integer'
                ]);
                
                // Vérifier si ce CRA est déjà soumis
                $cra = DB::table('c_r_a_s')
                    ->where('id_CRA', $data['cra_id'])
                    ->where('id_user', $user->id_user)
                    ->first();
                
                if (!$cra) {
                    return response()->json(['success' => false, 'message' => 'CRA introuvable'], 404);
                }
                
                if (!is_null($cra->submittedAT)) {
                    // Déjà soumis: ne rien faire et ne pas envoyer d'email
                    return response()->json(['success' => false, 'already_submitted' => true, 'message' => 'CRA déjà soumis']);
                }
                
                // Mettre le CRA en attente et enregistrer la date de soumission
                DB::table('c_r_a_s')
                    ->where('id_CRA', $data['cra_id'])
                    ->update(['status' => 'en_attente', 'submittedAT' => now(), 'updated_at' => now()]);
                
                // Récupérer l'id du validateur assigné à cet utilisateur
                $validatorId = DB::table('utilisateurs')
                    ->where('id_user', $user->id_user)
                    ->value('id_validateur');
                
                $emailSent = false;
                if ($validatorId) {
                    $validatorEmail = DB::table('utilisateurs')
                        ->where('id_user', $validatorId)
                        ->value('email_user');
                    
                    if ($validatorEmail) {
                        try {
                            \Illuminate\Support\Facades\Mail::to($validatorEmail)->send(
                                new \App\Mail\CRAEnAttenteMail(
                                    $user->id_user,
                                    $user->nom_user ?? $user->nom ?? 'Utilisateur',
                                    $data['cra_id'],
                                    request()->get('month'),
                                    request()->get('year')
                                )
                            );
                            $emailSent = true;
                        } catch (\Exception $mailEx) {
                           
                        }
                    }
                }
                
                return response()->json(['success' => true, 'email_sent' => $emailSent]);
            } catch (\Exception $e) {
                return response()->json(['success' => false, 'message' => 'Erreur lors de la soumission: ' . $e->getMessage()], 500);
            }
        });
        
        Route::get('/cra/load', function () {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Non connecté'], 401);
            }
            
            $year = request()->get('year');
            $month = request()->get('month');
            
            if (!$year || !$month) {
                return response()->json([]);
            }
            
            $dateMois = sprintf('%04d-%02d-01', $year, $month);
            
            $cra = DB::table('c_r_a_s')
                ->where('id_user', $user->id_user)
                ->where('dateMois', $dateMois)
                ->first();
                
            if (!$cra) {
                return response()->json([]);
            }
            
            $activities = DB::table('jour_activites')
                ->where('id_CRA', $cra->id_CRA)
                ->get();
                
            $data = [];
            foreach ($activities as $activity) {
                $key = $activity->id_activité . '_' . $activity->date;
                $data[$key] = $activity->type;
            }
            
            return response()->json($data);
        });

        // Statut de soumission d'un CRA pour un mois/année
        Route::get('/cra/status', function () {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Non connecté'], 401);
            }
            $year = request()->get('year');
            $month = request()->get('month');
            $craId = request()->get('cra_id');

            $query = DB::table('c_r_a_s')->where('id_user', $user->id_user);
            if ($craId) {
                $query->where('id_CRA', $craId);
            } else if ($year && $month) {
                $query->whereYear('dateMois', $year)->whereMonth('dateMois', $month);
            } else {
                return response()->json(['success' => true, 'submitted' => false]);
            }
            $cra = $query->first();
            if (!$cra) {
                return response()->json(['success' => true, 'submitted' => false]);
            }
            return response()->json([
                'success' => true,
                'submitted' => !is_null($cra->submittedAT),
                'cra_id' => $cra->id_CRA,
                'status' => $cra->status,
                'submittedAT' => $cra->submittedAT
            ]);
        });
    });
    
    // Routes pour les validateurs
    Route::prefix('validateur')->group(function () {
        Route::get('/dashboard', [ValidateurController::class, 'dashboard'])->name('validateur.dashboard');

        // Page validateur voir-cra HTML (garde la barre gauche validateur)
        Route::get('/voir-cra.html', function () {
            $path = resource_path('views/validateur/voir-cra.html');
            if (file_exists($path)) {
                return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
            }
            abort(404);
        });
        // Page Historique (validateur)
        Route::get('/history', function () {
            $path = resource_path('views/validateur/history.html');
            if (file_exists($path)) {
                return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
            }
            abort(404);
        });
        // Page Utilisateurs assignés (validateur)
        Route::get('/assigned', function () {
            $path = resource_path('views/validateur/assigned.html');
            if (file_exists($path)) {
                return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
            }
            abort(404);
        });

        // Page Mon Compte (validateur)
        Route::get('/account.html', function () {
            $path = resource_path('views/validateur/account.html');
            if (file_exists($path)) {
                return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
            }
            abort(404);
        });

        // API: statistiques pour le validateur connecté
        Route::get('/api/stats', function () {
            $user = Auth::user();
            if (!$user || $user->role !== 'validateur') {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
            }

            $assignedUserIds = DB::table('utilisateurs')
                ->where('id_validateur', $user->id_user)
                ->pluck('id_user');

            if ($assignedUserIds->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'stats' => [
                        'pending' => 0,
                        'validated_this_month' => 0,
                        'rejected_this_month' => 0,
                        'active_users' => 0,
                    ]
                ]);
            }

            $now = now();

            $pending = DB::table('c_r_a_s')
                ->whereIn('id_user', $assignedUserIds)
                ->whereNotNull('submittedAT')
                ->where('status', 'en_attente')
                ->count();

            $validatedThisMonth = DB::table('c_r_a_s')
                ->whereIn('id_user', $assignedUserIds)
                ->whereMonth('dateMois', $now->month)
                ->whereYear('dateMois', $now->year)
                ->where('status', 'valide')
                ->count();

            $rejectedThisMonth = DB::table('c_r_a_s')
                ->whereIn('id_user', $assignedUserIds)
                ->whereMonth('dateMois', $now->month)
                ->whereYear('dateMois', $now->year)
                ->where('status', 'refuse')
                ->count();

            $activeUsers = DB::table('utilisateurs')
                ->whereIn('id_user', $assignedUserIds)
                ->where('status', 'actif')
                ->count();

            return response()->json([
                'success' => true,
                'stats' => [
                    'pending' => $pending,
                    'validated_this_month' => $validatedThisMonth,
                    'rejected_this_month' => $rejectedThisMonth,
                    'active_users' => $activeUsers,
                ]
            ]);
        });

        // API: liste des CRA en attente pour le validateur connecté
        Route::get('/api/pending', function () {
            $user = Auth::user();
            if (!$user || $user->role !== 'validateur') {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
            }

            $assignedUserIds = DB::table('utilisateurs')
                ->where('id_validateur', $user->id_user)
                ->pluck('id_user');

            if ($assignedUserIds->isEmpty()) {
                return response()->json(['success' => true, 'cras' => []]);
            }

            $cras = DB::table('c_r_a_s')
                ->join('utilisateurs', 'c_r_a_s.id_user', '=', 'utilisateurs.id_user')
                ->whereIn('c_r_a_s.id_user', $assignedUserIds)
                ->whereNotNull('c_r_a_s.submittedAT')
                ->where('c_r_a_s.status', 'en_attente')
                ->orderByDesc('c_r_a_s.submittedAT')
                ->select(
                    'c_r_a_s.id_CRA as cra_id',
                    'c_r_a_s.dateMois',
                    'c_r_a_s.status',
                    'c_r_a_s.submittedAT',
                    'utilisateurs.id_user',
                    'utilisateurs.nom_user'
                )
                ->get()
                ->map(function ($row) {
                    $date = \Carbon\Carbon::parse($row->dateMois);
                    return [
                        'cra_id' => $row->cra_id,
                        'dateMois' => $row->dateMois,
                        'month' => (int)$date->format('n'),
                        'year' => (int)$date->format('Y'),
                        'status' => $row->status,
                        'submittedAT' => $row->submittedAT,
                        'user' => [
                            'id_user' => $row->id_user,
                            'nom_user' => $row->nom_user
                        ]
                    ];
                });

            return response()->json(['success' => true, 'cras' => $cras]);
        });

        // API: historique des CRA validés/refusés par ce validateur
        Route::get('/api/history', function () {
            $user = Auth::user();
            if (!$user || $user->role !== 'validateur') {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
            }

            $assignedUserIds = DB::table('utilisateurs')
                ->where('id_validateur', $user->id_user)
                ->pluck('id_user');

            if ($assignedUserIds->isEmpty()) {
                return response()->json(['success' => true, 'history' => []]);
            }

            $rows = DB::table('c_r_a_s')
                ->join('utilisateurs', 'c_r_a_s.id_user', '=', 'utilisateurs.id_user')
                ->whereIn('c_r_a_s.id_user', $assignedUserIds)
                ->whereIn('c_r_a_s.status', ['valide', 'refuse'])
                ->orderByDesc('c_r_a_s.updated_at')
                ->limit(100)
                ->select(
                    'c_r_a_s.id_CRA as cra_id',
                    'c_r_a_s.dateMois',
                    'c_r_a_s.status',
                    'c_r_a_s.updated_at',
                    'utilisateurs.id_user',
                    'utilisateurs.nom_user'
                )
                ->get()
                ->map(function ($row) {
                    $date = \Carbon\Carbon::parse($row->dateMois);
                    return [
                        'cra_id' => $row->cra_id,
                        'dateMois' => $row->dateMois,
                        'month' => (int)$date->format('n'),
                        'year' => (int)$date->format('Y'),
                        'status' => $row->status,
                        'actionAt' => $row->updated_at,
                        'user' => [
                            'id_user' => $row->id_user,
                            'nom_user' => $row->nom_user
                        ]
                    ];
                });

            return response()->json(['success' => true, 'history' => $rows]);
        });

        // API: utilisateurs assignés à ce validateur
        Route::get('/api/assigned-users', function () {
            $user = Auth::user();
            if (!$user || $user->role !== 'validateur') {
                return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
            }

            $assigned = DB::table('utilisateurs')
                ->where('id_validateur', $user->id_user)
                ->select('id_user', 'nom_user', 'email_user', 'status', 'created_at')
                ->orderBy('nom_user')
                ->get();

            if ($assigned->isEmpty()) {
                return response()->json(['success' => true, 'users' => []]);
            }

            $ids = $assigned->pluck('id_user');
            $pendingCounts = DB::table('c_r_a_s')
                ->select('id_user', DB::raw("SUM(CASE WHEN status='en_attente' AND submittedAT IS NOT NULL THEN 1 ELSE 0 END) as pending"))
                ->whereIn('id_user', $ids)
                ->groupBy('id_user')
                ->pluck('pending', 'id_user');

            $users = $assigned->map(function ($u) use ($pendingCounts) {
                return [
                    'id_user' => $u->id_user,
                    'nom_user' => $u->nom_user,
                    'email_user' => $u->email_user,
                    'status' => $u->status,
                    'created_at' => $u->created_at,
                    'pending' => (int)($pendingCounts[$u->id_user] ?? 0)
                ];
            });

            return response()->json(['success' => true, 'users' => $users]);
        });

        // API: détails d'un CRA pour affichage dans l'interface validateur
        Route::get('/api/cra/{id}/details', function ($id) {
            try {
                $user = Auth::user();
                if (!$user || $user->role !== 'validateur') {
                    return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
                }

                $assignedUserIds = DB::table('utilisateurs')
                    ->where('id_validateur', $user->id_user)
                    ->pluck('id_user');

                $cra = DB::table('c_r_a_s')
                    ->join('utilisateurs', 'c_r_a_s.id_user', '=', 'utilisateurs.id_user')
                    ->where('c_r_a_s.id_CRA', $id)
                    ->whereIn('c_r_a_s.id_user', $assignedUserIds)
                    ->select('c_r_a_s.*', 'utilisateurs.nom_user', 'utilisateurs.email_user')
                    ->first();

                if (!$cra) {
                    return response()->json(['success' => false, 'message' => 'CRA introuvable'], 404);
                }

                // Récupérer les activités utilisées dans ce CRA
                $activities = DB::table('jour_activites')
                    ->join('activités', 'jour_activites.id_activité', '=', 'activités.id_activité')
                    ->where('jour_activites.id_CRA', $id)
                    ->select('activités.id_activité', 'activités.nom_act', 'activités.description')
                    ->distinct()
                    ->get();

                $projects = $activities->map(function($a){ return ['id' => $a->id_activité, 'name' => $a->nom_act, 'code' => substr($a->nom_act,0,5)]; });

                // Récupérer les données jour par jour
                $journal = DB::table('jour_activites')->where('id_CRA', $id)->get();

                $data = [];
                foreach ($journal as $item) {
                    $data[$item->id_activité . '_' . $item->date] = $item->type;
                }

                return response()->json([
                    'success' => true,
                    'cra' => [
                        'id_CRA' => $cra->id_CRA,
                        'dateMois' => $cra->dateMois,
                        'status' => $cra->status,
                        'submittedAT' => $cra->submittedAT,
                        'user' => [
                            'nom_user' => $cra->nom_user,
                            'email_user' => $cra->email_user
                        ]
                    ],
                    'projects' => $projects,
                    'data' => $data
                ]);
            } catch (\Exception $e) {
                return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
            }
        });

        // API: valider un CRA
        Route::post('/api/cra/{id}/validate', function ($id) {
            try {
                $user = Auth::user();
                if (!$user || $user->role !== 'validateur') {
                    return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
                }

                $assignedUserIds = DB::table('utilisateurs')
                    ->where('id_validateur', $user->id_user)
                    ->pluck('id_user');

                $cra = DB::table('c_r_a_s')
                    ->where('id_CRA', $id)
                    ->whereIn('id_user', $assignedUserIds)
                    ->first();

                if (!$cra) {
                    return response()->json(['success' => false, 'message' => 'CRA introuvable'], 404);
                }

                DB::table('c_r_a_s')
                    ->where('id_CRA', $id)
                    ->update(['status' => 'valide', 'updated_at' => now()]);

                // Envoyer un email à l'utilisateur
                try {
                    $craRow = DB::table('c_r_a_s')
                        ->join('utilisateurs', 'c_r_a_s.id_user', '=', 'utilisateurs.id_user')
                        ->where('c_r_a_s.id_CRA', $id)
                        ->select('c_r_a_s.dateMois', 'utilisateurs.email_user', 'utilisateurs.nom_user')
                        ->first();
                    if ($craRow && $craRow->email_user) {
                        $date = \Carbon\Carbon::parse($craRow->dateMois);
                        $month = (int)$date->format('n');
                        $year = (int)$date->format('Y');
                        $subject = "Notification CRA - Mois {$month}/{$year} - Validé";
                        $body = "Bonjour {$craRow->nom_user},\n\nVotre CRA du mois {$month}/{$year} a été validé.\nStatut actuel: valide.\n\nCordialement,\nL'équipe Validation";
                        \Illuminate\Support\Facades\Mail::raw($body, function ($message) use ($craRow, $subject) {
                            $message->to($craRow->email_user)->subject($subject);
                        });
                    }
                } catch (\Exception $mailEx) {
                    
                }

                return response()->json(['success' => true]);
            } catch (\Exception $e) {
                return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
            }
        });

        // API: rejeter un CRA
        Route::post('/api/cra/{id}/reject', function ($id) {
            try {
                $user = Auth::user();
                if (!$user || $user->role !== 'validateur') {
                    return response()->json(['success' => false, 'message' => 'Non autorisé'], 403);
                }

                $assignedUserIds = DB::table('utilisateurs')
                    ->where('id_validateur', $user->id_user)
                    ->pluck('id_user');

                $cra = DB::table('c_r_a_s')
                    ->where('id_CRA', $id)
                    ->whereIn('id_user', $assignedUserIds)
                    ->first();

                if (!$cra) {
                    return response()->json(['success' => false, 'message' => 'CRA introuvable'], 404);
                }

                DB::table('c_r_a_s')
                    ->where('id_CRA', $id)
                    ->update(['status' => 'refuse', 'updated_at' => now()]);

                // Envoyer un email à l'utilisateur
                try {
                    $craRow = DB::table('c_r_a_s')
                        ->join('utilisateurs', 'c_r_a_s.id_user', '=', 'utilisateurs.id_user')
                        ->where('c_r_a_s.id_CRA', $id)
                        ->select('c_r_a_s.dateMois', 'utilisateurs.email_user', 'utilisateurs.nom_user')
                        ->first();
                    if ($craRow && $craRow->email_user) {
                        $date = \Carbon\Carbon::parse($craRow->dateMois);
                        $month = (int)$date->format('n');
                        $year = (int)$date->format('Y');
                        $subject = "Notification CRA - Mois {$month}/{$year} - Refusé";
                        $body = "Bonjour {$craRow->nom_user},\n\nVotre CRA du mois {$month}/{$year} a été refusé.\nStatut actuel: refusé.\n\nCordialement,\nL'équipe Validation";
                        \Illuminate\Support\Facades\Mail::raw($body, function ($message) use ($craRow, $subject) {
                            $message->to($craRow->email_user)->subject($subject);
                        });
                    }
                } catch (\Exception $mailEx) {
                  
                }

                return response()->json(['success' => true]);
            } catch (\Exception $e) {
                return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
            }
        });
    });

    // Compte (API commune)
    Route::get('/account/me', function () {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Non connecté'], 401);
        }
        return response()->json([
            'success' => true,
            'user' => [
                'id_user' => $user->id_user,
                'nom' => $user->nom_user,
                'email' => $user->email_user,
                'role' => $user->role,
                'status' => $user->status,
            ]
        ]);
    });

    Route::post('/account/update', function () {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Non connecté'], 401);
        }

        $data = request()->validate([
            'nom' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:8|confirmed'
        ]);

        $updates = [];
        if (isset($data['nom']) && $data['nom'] !== '') {
            $updates['nom_user'] = $data['nom'];
        }
        if (isset($data['password']) && $data['password'] !== '') {
            $updates['motdepasse_user'] = Hash::make($data['password']);
        }

        if (!empty($updates)) {
            DB::table('utilisateurs')->where('id_user', $user->id_user)->update(array_merge($updates, ['updated_at' => now()]));
        }

        return response()->json(['success' => true, 'message' => 'Compte mis à jour avec succès']);
    });
});

// Routes pour les vues HTML directes
Route::get('/auth/login', function () {
    return view('auth.login');
})->name('auth.login');

Route::get('/auth/register', function () {
    return view('auth.register');
})->name('auth.register');

// Account page (public HTML shell)
Route::get('/account.html', function () {
    $path = resource_path('views/account.html');
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/html; charset=utf-8');
    }
    abort(404);
});

// Route de fallback
Route::fallback(function () {
    return redirect('/login');
});

// Route de test
Route::get('/admin/test', function () {
    $html = file_get_contents(resource_path('views/admin/test.html'));
    return response($html)->header('Content-Type', 'text/html; charset=utf-8');
});

// Routes pour les ressources statiques
Route::get('/css/{file}', function ($file) {
    $path = resource_path('css/' . $file);
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'text/css');
    }
    abort(404);
});

Route::get('/js/{file}', function ($file) {
    $path = resource_path('js/' . $file);
    if (file_exists($path)) {
        return response(file_get_contents($path))->header('Content-Type', 'application/javascript');
    }
    abort(404);
});

Route::get('/img/{file}', function ($file) {
    $path = resource_path('img/' . $file);
    if (file_exists($path)) {
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        return response(file_get_contents($path))->header('Content-Type', 'image/' . $extension);
    }
    abort(404);
});

// API publique pour lister les activités (lecture seule)
Route::get('/api/public/activities', function () {
    $activities = \App\Models\Activité::withCount(['assignements' => function($query) {
        $query->where('status', 'actif');
    }])
        ->orderBy('created_at', 'desc')
        ->get(['id_activité', 'nom_act', 'description', 'status', 'created_at']);
    
    // Ajouter le nombre d'utilisateurs assignés
    $activities->each(function ($activity) {
        $activity->assigned_users = $activity->assignements_count;
    });
    
    // Calculer les statistiques
    $totalActivities = $activities->count();
    $activeActivities = $activities->where('status', 'actif')->count();
    $inactiveActivities = $activities->where('status', 'inactif')->count();
    $totalAssignments = $activities->sum('assigned_users');
    
    return response()->json([
        'activities' => $activities,
        'stats' => [
            'total' => $totalActivities,
            'active' => $activeActivities,
            'inactive' => $inactiveActivities,
            'assignments' => $totalAssignments
        ]
    ]);
});
// API pour lister les utilisateurs (publique pour le moment pour debug)
// API pour lister les utilisateurs (publique pour le moment pour debug)
Route::get('/api/public/users', function () {
    try {
        $users = DB::table('utilisateurs')
            ->leftJoin('utilisateurs as validateurs', 'utilisateurs.id_validateur', '=', 'validateurs.id_user')
            ->select(
                'utilisateurs.*', 
                'validateurs.nom_user as validator_name',
                'validateurs.email_user as validator_email'
            )
            ->get();
            
        // Stats
        $stats = [
            'total' => $users->count(),
            'administrators' => $users->where('role', 'administrateur')->count(),
            'validators' => $users->where('role', 'validateur')->count(),
            'employees' => $users->where('role', 'employé')->count(),
            'active' => $users->where('status', 'actif')->count()
        ];
        
        return response()->json([
            'users' => $users,
            'stats' => $stats
        ]);
        
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

