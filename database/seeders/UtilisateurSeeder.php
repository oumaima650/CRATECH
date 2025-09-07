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
        // Administrateur
        \App\Models\Utilisateur::create([
            'id_user' => 'ADMIN001',
            'nom_user' => 'Admin CRATECH',
            'email_user' => 'admin@cratech.com',
            'motdepasse_user' => bcrypt('admin123'),
            'role' => 'administrateur',
            'status' => 'actif',
        ]);

        // Employé
        \App\Models\Utilisateur::create([
            'id_user' => 'EMP001',
            'nom_user' => 'Jean Dupont',
            'email_user' => 'jean.dupont@cratech.com',
            'motdepasse_user' => bcrypt('employe123'),
            'role' => 'employé',
            'status' => 'actif',
        ]);

        // Sous-traitant
        \App\Models\Utilisateur::create([
            'id_user' => 'ST001',
            'nom_user' => 'Marie Martin',
            'email_user' => 'marie.martin@cratech.com',
            'motdepasse_user' => bcrypt('soustraitant123'),
            'role' => 'sous-traitant',
            'status' => 'actif',
        ]);

        // Validateur
        \App\Models\Utilisateur::create([
            'id_user' => 'VAL001',
            'nom_user' => 'Pierre Validateur',
            'email_user' => 'pierre.validateur@cratech.com',
            'motdepasse_user' => bcrypt('validateur123'),
            'role' => 'validateur',
            'status' => 'actif',
        ]);
    }
}
