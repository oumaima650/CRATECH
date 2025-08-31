<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CRA extends Model
{
    protected $table = 'c_r_a_s';
    protected $primaryKey = 'id_CRA';
    protected $fillable = [
        'id_user',
        'dateMois',
        'status',
        'submittedAt',
    ];
    protected $casts = [
        'dateMois' => 'date',
        'submittedAt' => 'datetime',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_user');
    }
    public function jourActivite(): HasMany
    {
        return $this->hasMany(JourActivite::class, 'id_CRA');
    }

    public function RapportMensuels(): HasOne
    {
        return $this->hasOne(rapport_mensuels::class, 'id_CRA');
    }
    public function cra_affectations(): HasMany
    {
        return $this->hasMany(cra_affectation::class, 'id_CRA');
    }
     public function scopeValides($query)
    {
        return $query->where('status', 'valide');
    }
    public function scopeNonValidés($query)
    {
        return $query->where('status', 'refuse');
    }
    public function scopeEnAttente($query)
    {
        return $query->where('status', 'en_attente');
    }

    /**
     * Scope : filtrer les CRA d’un mois donné
     */
    public function scopeDuMois($query, $mois, $annee)
{
    return $query->whereMonth('dateMois', $mois)->whereYear('dateMois', $annee);
}

}
