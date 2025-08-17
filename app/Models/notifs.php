<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class notifs extends Model
{
    protected $table = 'notifs';
    protected $primaryKey = 'id_notif';
     protected $fillable = [
        'message',
        'dateEnvoi',
        'id_user',

    ];

    protected $casts = [
        'dateEnvoi' => 'datetime',
    ];


    public function destinataire(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_user');
    }
}
