<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

// Test pour Juin 2026 (mois 6)
$year = 2026;
$month = 6;

echo "=== Test API /employe/activities pour JUIN 2026 ===\n\n";

// Trouver tous les utilisateurs avec des assignations
$users = DB::table('user__acts')
    ->join('utilisateurs', 'user__acts.id_user', '=', 'utilisateurs.id_user')
    ->select('utilisateurs.*')
    ->distinct()
    ->get();

foreach ($users as $user) {
    echo "Utilisateur: {$user->nom_user} (ID: {$user->id_user})\n";
    
    // Simuler l'appel API exact
    $query = DB::table('user__acts')
        ->join('activités', 'user__acts.id_activité', '=', 'activités.id_activité')
        ->where('user__acts.id_user', $user->id_user);
    
    // Appliquer le filtrage strict (comme dans web.php)
    $query->where('activités.status', 'actif')
          ->where('user__acts.status', 'actif');
    
    $activities = $query->select('activités.id_activité', 'activités.nom_act', 'activités.description')
        ->distinct()
        ->get();
    
    echo "  Activités retournées: " . count($activities) . "\n";
    foreach ($activities as $act) {
        echo "    - [{$act->id_activité}] {$act->nom_act}\n";
    }
    
    // Afficher aussi les assignations inactives pour comparaison
    $allAssignments = DB::table('user__acts')
        ->join('activités', 'user__acts.id_activité', '=', 'activités.id_activité')
        ->where('user__acts.id_user', $user->id_user)
        ->select(
            'activités.id_activité',
            'activités.nom_act',
            'activités.status as act_status',
            'user__acts.status as assign_status'
        )
        ->get();
    
    echo "  Toutes les assignations (actives + inactives):\n";
    foreach ($allAssignments as $act) {
        $status = ($act->act_status == 'actif' && $act->assign_status == 'actif') ? '✓ ACTIVE' : '✗ INACTIVE';
        echo "    - [{$act->id_activité}] {$act->nom_act}: Act={$act->act_status}, Assign={$act->assign_status} => $status\n";
    }
    echo "\n";
}
