<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class cra_affectation extends Model
{
    protected $table = 'cra_affectations';
    protected $primaryKey = 'id_affectation';
    protected $fillable = [
        'id_CRA',
        'id_validateur',
        'date_affectation',
        'actif',
    ];
    public function cra()
    {
        return $this->belongsTo(CRA::class, 'id_CRA');
    }

    public function validateur()
    {
        return $this->belongsTo(Utilisateur::class, 'id_validateur')->where('role', 'validateur');
}
}
