<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class rapport_mensuels extends Model
{
    protected $table = 'rapport_mensuels';
    protected $primaryKey = 'id_rapport_mensuel';
    protected $fillable = [
        'id_CRA',
        'chemin_fichier',
    ];

    public function cra()
    {
        return $this->belongsTo(CRA::class, 'id_CRA');
    }
}
