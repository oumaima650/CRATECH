<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Activité extends Model
{
    protected $table ='activités';
    protected $primaryKey = 'id_activité';
    protected $fillable = [
        'nom_act',
        'description',
        'status',
    ];
    public function assignements(): HasMany
    {
        return $this->hasMany(User_Act::class, 'id_activité');
    }
    public function jours(): HasMany
    {
        return $this->hasMany(JourActivite::class, 'id_activité');
    }

}
