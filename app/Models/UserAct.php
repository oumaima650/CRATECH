<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAct extends Model
{
    use HasFactory;

    protected $table = 'user__acts';
    protected $primaryKey = 'id_assignement';

    protected $fillable = [
        'id_user',
        'id_activité',
        'role_projet',
        'status',
        'total_travaille'
    ];

    protected $casts = [
        'total_travaille' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relation avec le modèle Utilisateur
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_user', 'id_user');
    }

    // Relation avec le modèle Activité
    public function activité()
    {
        return $this->belongsTo(Activité::class, 'id_activité', 'id_activité');
    }

    // Scope pour les assignations actives
    public function scopeActive($query)
    {
        return $query->where('status', 'actif');
    }

    // Scope pour une activité spécifique
    public function scopeForActivity($query, $activityId)
    {
        return $query->where('id_activité', $activityId);
    }

    // Scope pour un utilisateur spécifique
    public function scopeForUser($query, $userId)
    {
        return $query->where('id_user', $userId);
    }
}
