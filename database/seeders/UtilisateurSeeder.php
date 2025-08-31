<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UtilisateurSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Utilisateur::create([
    'nom_user' => 'OUM',
    'email_user' => 'oum@example.com',
    'motdepasse_user' => bcrypt('secret'),
    'role' => 'administrateur',
    'status' => 'actif',
]);
 // Assuming 'employé' is a role defined in your application
        
    }
}
