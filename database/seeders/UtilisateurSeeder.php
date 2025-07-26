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
            'nom_user' => 'oumaima',
            'email_user' => 'oumaima.ameziane@gmail.com',
            'motdepasse_user' => 'lovexo2004',
            'role' => 'employé',
            'id_groupe' => 1,
        ]); // Assuming 'employé' is a role defined in your application
        
    }
}
