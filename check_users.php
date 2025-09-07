<?php
// Script pour vérifier les utilisateurs dans la base de données

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

// Vérifier les utilisateurs
echo "=== VÉRIFICATION DES UTILISATEURS ===\n\n";

$users = Capsule::table('utilisateurs')->get();

if ($users->isEmpty()) {
    echo "❌ Aucun utilisateur trouvé dans la base de données!\n";
    echo "Exécutez: php artisan db:seed --class=UtilisateurSeeder\n";
} else {
    echo "✅ Utilisateurs trouvés:\n\n";
    
    foreach ($users as $user) {
        echo "ID: " . $user->id_user . "\n";
        echo "Nom: " . $user->nom_user . "\n";
        echo "Email: " . $user->email_user . "\n";
        echo "Rôle: " . $user->role . "\n";
        echo "Statut: " . $user->status . "\n";
        echo "Mot de passe hashé: " . substr($user->motdepasse_user, 0, 20) . "...\n";
        echo "---\n";
    }
}

echo "\n=== TEST DE CONNEXION ===\n\n";

// Test avec les identifiants d'employé
$testUser = Capsule::table('utilisateurs')
    ->where('id_user', 'EMP001')
    ->where('email_user', 'jean.dupont@cratech.com')
    ->first();

if ($testUser) {
    echo "✅ Utilisateur EMP001 trouvé\n";
    echo "Rôle: " . $testUser->role . "\n";
    echo "Statut: " . $testUser->status . "\n";
    
    // Test du mot de passe
    $passwordCheck = password_verify('employe123', $testUser->motdepasse_user);
    echo "Mot de passe 'employe123' correct: " . ($passwordCheck ? '✅ OUI' : '❌ NON') . "\n";
} else {
    echo "❌ Utilisateur EMP001 non trouvé\n";
}
