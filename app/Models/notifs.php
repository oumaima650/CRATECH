<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class notifs extends Model
{
    protected $table = 'notifs';
    protected $primaryKey = 'id_notif';
     protected $fillable = [
        'message',
        'dateEnvoi',
        'destinataire_id',
        'destinataire_type',
    ];

    protected $casts = [
        'dateEnvoi' => 'datetime',
    ];


    public function destinataire()
    {
        return $this->morphTo();
    }
}
