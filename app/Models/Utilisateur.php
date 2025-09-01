<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Utilisateur extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'utilisateurs';
    protected $primaryKey = 'id_user';

    protected $fillable = [
        'nom_user',
        'email_user',
        'motdepasse_user',
        'role',
        'status',
        'id_validateur',
        'remember_token',
    ];

    protected $hidden = [
        'motdepasse_user',
        'remember_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Obtenir le nom de l'identifiant d'authentification
     */
    public function getAuthIdentifierName()
    {
        return 'id_user';
    }

    /**
     * Obtenir l'identifiant d'authentification
     */
    public function getAuthIdentifier()
    {
        return $this->getAttribute($this->getAuthIdentifierName());
    }

    /**
     * Obtenir le mot de passe pour l'authentification
     */
    public function getAuthPassword()
    {
        return $this->motdepasse_user;
    }

    /**
     * Obtenir le token "remember me"
     */
    public function getRememberToken()
    {
        return $this->remember_token;
    }

    /**
     * Définir le token "remember me"
     */
    public function setRememberToken($value)
    {
        $this->remember_token = $value;
    }

    /**
     * Obtenir le nom de la colonne "remember me"
     */
    public function getRememberTokenName()
    {
        return 'remember_token';
    }

    /**
     * Vérifier si l'utilisateur est un administrateur
     */
    public function isAdmin()
    {
        return $this->role === 'administrateur';
    }

    /**
     * Vérifier si l'utilisateur est un validateur
     */
    public function isValidator()
    {
        return $this->role === 'validateur';
    }

    /**
     * Vérifier si l'utilisateur est un employé
     */
    public function isEmployee()
    {
        return $this->role === 'employé';
    }

    /**
     * Vérifier si l'utilisateur est un sous-traitant
     */
    public function isSubcontractor()
    {
        return $this->role === 'sous-traitant';
    }

    /**
     * Obtenir le nom complet de l'utilisateur
     */
    public function getFullNameAttribute()
    {
        return $this->nom_user;
    }

    /**
     * Scope pour les utilisateurs actifs
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'actif');
    }

    /**
     * Scope pour les administrateurs
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', 'administrateur');
    }

    /**
     * Scope pour les validateurs
     */
    public function scopeValidators($query)
    {
        return $query->where('role', 'validateur');
    }

    /**
     * Scope pour les employés
     */
    public function scopeEmployees($query)
    {
        return $query->where('role', 'employé');
    }

    /**
     * Scope pour les sous-traitants
     */
    public function scopeSubcontractors($query)
    {
        return $query->where('role', 'sous-traitant');
    }

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
