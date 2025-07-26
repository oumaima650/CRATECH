<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class validateur extends Model
{
    protected $table = 'validateurs';
    protected $primaryKey = 'id_val';
    protected $fillable = [
        'nom_val',
        'email_val',
        'motdepasse_val',
        'status',
        'id_groupe',
    ];
    protected $hidden = [
        'motdepasse_val',
    ];

    public function destinataire()
    {
        return $this->morphMany(notifs::class, 'destinataire');
    }
    public function groupe()
    {
        return $this->hasOne(groupes::class, 'id_groupe');
    }
    public function affections()
    {
        return $this->hasMany(cra_affectation::class, 'id_val');
    }
}
