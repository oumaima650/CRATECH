<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\morphMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Utilisateur extends Model
{
    protected $fillable = [
        'nom_user',
        'email_user',
        'motDePasse_user',
        'role',
    ];
    public function cras(): HasMany
    {
        return $this->hasMany(Cra::class , 'id_user');
    }
    public function accounts(): HasOne
    {
        return $this->hasOne(Accounts::class, 'id_user');

    }
    public function notifs(): MorphMany
    {
        return $this->morphMany(notifs::class, 'destinataire');
    }
    public function rapport_annuel(): HasMany
    {
        return $this->hasMany(rapport_annuels::class, 'id_user');
    }
}
