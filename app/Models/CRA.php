<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CRA extends Model
{
    protected $fillable = [
        'id_user',
        'dateMois',
        'statut',
        'submittedAt',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_user');
    }
    public function jourActivite(): HasMany
    {
        return $this->hasMany(JourActivite::class, 'id_CRA');
    }

    public function rapport_mensuels(): HasOne
    {
        return $this->hasOne(rapport_mensuels::class, 'id_CRA');
    }

}
