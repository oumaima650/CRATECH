<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JourActivite extends Model
{
    protected $table = 'jour_activites';
    protected $primaryKey = 'id_day';
    protected $fillable = [
        'id_CRA',
        'date',
        'id_activité',
        'type',
        'description',
        
    ];
    protected $casts = [
        'date' => 'date',
    ];

    public function cra()
    {
        return $this->belongsTo(CRA::class, 'id_CRA');
    }
    public function activite() : BelongsTo
    {
        return $this->belongsTo(Activité::class, 'id_activité');
    }
      public function scopeTravailles($query)
    {
        return $query->whereIn('type', ['1', '0.5']);
    }

    /**
     * Scope : filtrer les absences
     */
    public function scopeAbsences($query)
    {
        return $query->where('type', '0');
    }

}
