<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class notifs extends Model
{
     protected $fillable = [
        'message',
        'dateEnvoi',
        'lu',
        'destinataire_id',
        'destinataire_type',
    ];

    public function destinataire()
    {
        return $this->morphTo();
    }
}
