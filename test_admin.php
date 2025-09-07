<?php
// Script pour tester la connexion admin

require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Configuration de la base de données
$capsule = new Capsule;
$capsule->addConnection([
    'driver' => 'sqlite',
    'database' => __DIR__ . '/database/database.sqlite',
    'prefix' => '',
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "=== TEST ADMIN ===\n\n";

// Vérifier l'admin
$admin = Capsule::table('utilisateurs')
    ->where('nom_user', 'Admin CRATECH')
    ->first();

if ($admin) {
    echo "✅ Admin trouvé:\n";
    echo "ID: " . $admin->id_user . "\n";
    echo "Nom: " . $admin->nom_user . "\n";
    echo "Email: " . $admin->email_user . "\n";
    echo "Rôle: " . $admin->role . "\n";
    echo "Statut: " . $admin->status . "\n";
    
    // Test du mot de passe
    $passwordCheck = password_verify('admin123', $admin->motdepasse_user);
    echo "Mot de passe 'admin123' correct: " . ($passwordCheck ? '✅ OUI' : '❌ NON') . "\n";
    
    if ($admin->role === 'administrateur') {
        echo "✅ Rôle administrateur confirmé\n";
    } else {
        echo "❌ Rôle incorrect: " . $admin->role . "\n";
    }
} else {
    echo "❌ Admin non trouvé!\n";
    echo "Créer l'admin avec: php artisan db:seed --class=UtilisateurSeeder\n";
}

echo "\n=== TOUS LES UTILISATEURS ===\n";
$users = Capsule::table('utilisateurs')->get();
foreach ($users as $user) {
    echo "- " . $user->nom_user . " (" . $user->role . ")\n";
}
