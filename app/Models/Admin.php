<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    protected $fillable = [
        'nom_admin',
        'email_admin',
        'motDePasse_admin',
    ];

    public function destinataire()
    {
        return $this->morphMany(notifs::class, 'destinataire');
    }
    
}
