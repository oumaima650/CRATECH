<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class groupes extends Model
{
    protected $table = 'groupes';
    protected $primaryKey = 'id_groupe';
    protected $fillable = [
        'nom_groupe',
        'description',
    ];

    public function utilisateurs()
    {
        return $this->hasMany(Utilisateur::class, 'id_groupe');
    }
    public function validateurs()
    {
        return $this->hasOne(validateur::class, 'id_groupe');
    }
}
