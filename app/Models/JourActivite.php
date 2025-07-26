<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JourActivite extends Model
{
    protected $table = 'jour_activites';
    protected $primaryKey = 'id_jour_activite';
    protected $fillable = [
        'id_CRA',
        'date',
        'heuresTravaillées',
        'description',
        'projet',
        'type', 
    ];
    protected $casts = [
        'date' => 'date',
    ];

    public function cra()
    {
        return $this->belongsTo(CRA::class, 'id_CRA');
    }
}
