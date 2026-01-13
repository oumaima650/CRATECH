<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

// On teste pour l'utilisateur ID 4 (employe 2)
$user = DB::table('utilisateurs')->where('id_user', 4)->first();
if (!$user) {
    echo "Utilisateur ID 4 non trouvé.\n";
    exit;
}

echo "Analyse pour l'utilisateur: {$user->nom_user} (ID: {$user->id_user})\n";

// Liste toutes les activités assignées
$assignments = DB::table('user__acts')
    ->join('activités', 'user__acts.id_activité', '=', 'activités.id_activité')
    ->where('user__acts.id_user', $user->id_user)
    ->get();

foreach ($assignments as $act) {
    echo "\nActivite: [{$act->id_activité}] {$act->nom_act} (ProjStatus: {$act->status}, AssignStatus: {$act->status})\n";
    
    // Lister les dates dans jour_activites
    $entries = DB::table('jour_activites')
        ->join('c_r_a_s', 'jour_activites.id_CRA', '=', 'c_r_a_s.id_CRA')
        ->where('c_r_a_s.id_user', $user->id_user)
        ->where('jour_activites.id_activité', $act->id_activité)
        ->select('jour_activites.date')
        ->get();
        
    echo "Entrées trouvées (" . count($entries) . "):\n";
    foreach ($entries as $e) {
        echo "  - {$e->date}\n";
    }
}

// Test de la logique SQL
$year = 2026;
$month = 2;
echo "\nTest de la logique SQL pour Février 2026:\n";

foreach ($assignments as $act) {
    $hasEntries = DB::table('jour_activites')
        ->join('c_r_a_s', 'jour_activites.id_CRA', '=', 'c_r_a_s.id_CRA')
        ->where('c_r_a_s.id_user', $user->id_user)
        ->where('jour_activites.id_activité', $act->id_activité)
        ->whereYear('jour_activites.date', $year)
        ->whereMonth('jour_activites.date', $month)
        ->exists();
    
    $isActive = ($act->status == 'actif'); // Ici act.status vient de activités via le JOIN
    // Note: user__acts a aussi un champ status. 
    // Dans le join, $act->status pourrait être ambigu.
    
    echo "- Activity [{$act->id_activité}] {$act->nom_act}:\n";
    echo "  HasEntriesFeb=" . ($hasEntries ? 'YES' : 'NO') . "\n";
}
