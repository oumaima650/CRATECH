<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Simuler l'utilisateur ID 4
$user = DB::table('utilisateurs')->where('id_user', 4)->first();
if (!$user) {
    echo "Utilisateur non trouvé.\n";
    exit;
}

echo "Test de l'API /employe/activities pour l'utilisateur: {$user->nom_user} (ID: {$user->id_user})\n\n";

// Simuler la requête avec year et month
$year = 2026;
$month = 2; // Février

echo "=== Test pour Février 2026 ===\n";

$query = DB::table('user__acts')
    ->join('activités', 'user__acts.id_activité', '=', 'activités.id_activité')
    ->where('user__acts.id_user', $user->id_user);

// Appliquer le filtrage strict
$query->where('activités.status', 'actif')
      ->where('user__acts.status', 'actif');

$activities = $query->select('activités.id_activité', 'activités.nom_act', 'activités.description')
    ->distinct()
    ->get();

echo "Activités retournées par l'API : " . count($activities) . "\n";
foreach ($activities as $act) {
    echo "- [{$act->id_activité}] {$act->nom_act}\n";
}

echo "\n=== Vérification des statuts réels ===\n";
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

foreach ($allAssignments as $act) {
    $shouldShow = ($act->act_status == 'actif' && $act->assign_status == 'actif');
    echo "- [{$act->id_activité}] {$act->nom_act}: ";
    echo "ActStatus={$act->act_status}, AssignStatus={$act->assign_status} ";
    echo "=> " . ($shouldShow ? "✓ AFFICHE" : "✗ MASQUE") . "\n";
}
