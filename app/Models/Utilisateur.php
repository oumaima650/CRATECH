<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'status',
        'id_validateur',
    ];
    protected $hidden = [
        'motDePasse_user',
    ];
    public function cras(): HasMany
    {
        return $this->hasMany(Cra::class , 'id_user');
    }
    public function notifs(): HasMany
    {
        return $this->hasMany(notifs::class, 'id_user');
    }
    public function assignements(): HasMany 
    {
        return $this->hasMany(User_act::class, 'id_user');
    }
    public function affectations(): HasMany
    {
        return $this->hasMany(Cra_affectation::class, 'id_validateur');
    }
    public function validateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_validateur');
    }
    public function validés(): HasMany
    {
        return $this->hasMany(Utilisateur::class, 'id_validateur'); 
    }

    
   
    public function rapport_annuels(): HasMany
    {
        return $this->hasMany(Rapport_annuels::class, 'id_user');
    }
    public function scopeAdmins($query)
    {
        return $query->where('role', 'administrateur');
    
    }
    public function scopeValidateurs($query)
    {
        return $query->where('role', 'validateur');
    }
    public function scopeEmployes($query)
    {
        return $query->where('role', 'employé');
    }
    public function scopeSousTraitants($query)
    {
        return $query->where('role', 'sous-traitant');
    }

}
