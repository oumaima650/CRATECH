<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User_Act extends Model
{
    protected $table = 'user__acts';
    protected $primaryKey = 'id_assignement';

    protected $fillable = [
        'id_user',
        'id_activité',
        'role_projet',
        'status',
        'total_travaille',
    ];
    protected $casts = [
        'total_travaille' => 'integer',
    ];
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_user');
    }
    public function activite()
    {
        return $this->belongsTo(Activité::class, 'id_activité');
    }
        public function scopeActifs($query)
    {
        return $query->where('status', 'actif');
    }


    public function scopeInactifs($query)
    {
        return $query->where('status', 'inactif');
    }

}
