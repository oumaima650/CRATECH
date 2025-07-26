<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GroupeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\groupes::create([
            'nom_groupe' => 'Groupe A',
            'description' => 'Description',
        ]);


        // Add more groups as needed
    }
}
