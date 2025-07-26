<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class cra_affectation extends Model
{
    protected $table = 'cra_affectations';
    protected $primaryKey = 'id_affectation';
    protected $fillable = [
        'id_CRA',
        'id_val',
        'date_affectation',
        'actif',
    ];
    protected $casts = [
        'date_affectation' => 'date',
        'actif' => 'boolean',
    ];

    public function cra()
    {
        return $this->belongsTo(CRA::class, 'id_CRA');
    }

    public function validateur()
    {
        return $this->belongsTo(Validateur::class, 'id_val');
}
}
