<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JourActivite extends Model
{
    protected $fillable = [
        'id_CRA',
        'dateJour',
        'activite',
        'duree',
    ];

    public function cra()
    {
        return $this->belongsTo(CRA::class, 'id_CRA');
    }
}
