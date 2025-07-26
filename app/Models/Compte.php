<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compte extends Model
{
    protected $table = 'accounts';
    protected $primaryKey = 'id_account';
    protected $fillable = [
        'proprietaire_id',
        'proprietaire_type',
        'dateCreation',
        'MotdePasseTemp',
        'actif',
    ];
     protected $casts = [
        'actif' => 'boolean',
        'dateCreation' => 'date',
    ];

    public function proprietaire()
    {
        return $this->morphTo();
    }

}
