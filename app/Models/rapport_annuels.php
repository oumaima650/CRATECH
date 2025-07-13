<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class rapport_annuels extends Model
{
    protected $fillable = [
        'id_user',
        'annee',
        'chemin_fichier',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_user');
    }
}
