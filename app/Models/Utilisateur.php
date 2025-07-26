<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Utilisateur extends Model
{
    protected $table = 'utilisateurs';
    protected $primaryKey = 'id_user';
    protected $fillable = [
        'nom_user',
        'email_user',
        'motDePasse_user',
        'role',
        'id_groupe',
    ];
    protected $hidden = [
        'motDePasse_user',
    ];
    public function cras(): HasMany
    {
        return $this->hasMany(Cra::class , 'id_user');
    }
    public function accounts(): MorphOne
    {
        return $this->morphOne(Compte::class, 'proprietaire');
    }
    public function notifs(): MorphMany
    {
        return $this->morphMany(Notifs::class, 'destinataire');
    }
    public function rapport_annuel(): HasMany
    {
        return $this->hasMany(Rapport_annuels::class, 'id_user');
    }
    public function groupe()
    {
        return $this->belongsTo(Groupes::class, 'id_groupe');
    }
}
