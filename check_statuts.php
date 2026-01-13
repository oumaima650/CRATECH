<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Vérification des statuts dans la base de données ===\n\n";

// Vérifier toutes les activités
echo "Table 'activités':\n";
$activities = DB::table('activités')->get();
foreach ($activities as $act) {
    echo "  - ID {$act->id_activité}: {$act->nom_act} => status='{$act->status}'\n";
}

echo "\nTable 'user__acts' (assignations):\n";
$assignments = DB::table('user__acts')
    ->join('utilisateurs', 'user__acts.id_user', '=', 'utilisateurs.id_user')
    ->join('activités', 'user__acts.id_activité', '=', 'activités.id_activité')
    ->select(
        'user__acts.id_assignement',
        'utilisateurs.nom_user',
        'activités.nom_act',
        'user__acts.status as assign_status',
        'activités.status as activity_status'
    )
    ->get();

foreach ($assignments as $assign) {
    echo "  - Assignation #{$assign->id_assignement}: {$assign->nom_user} → {$assign->nom_act}\n";
    echo "    Assign status='{$assign->assign_status}', Activity status='{$assign->activity_status}'\n";
}

echo "\n=== Test de la requête SQL exacte ===\n";
$user = DB::table('utilisateurs')->where('id_user', 4)->first();
if ($user) {
    echo "Utilisateur: {$user->nom_user} (ID: {$user->id_user})\n\n";
    
    $result = DB::table('user__acts')
        ->join('activités', 'user__acts.id_activité', '=', 'activités.id_activité')
        ->where('user__acts.id_user', $user->id_user)
        ->where('activités.status', 'actif')
        ->where('user__acts.status', 'actif')
        ->select('activités.id_activité', 'activités.nom_act', 'activités.description')
        ->distinct()
        ->get();
    
    echo "Résultat de la requête filtrée (actif+actif): " . $result->count() . " activités\n";
    foreach ($result as $r) {
        echo "  - [{$r->id_activité}] {$r->nom_act}\n";
    }
}
