<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Model;

class Courier extends Model
{
    use HasFactory;

    // One-to-one extension of users table keyed by user_id.
    protected $primaryKey = 'user_id';

    public $incrementing = false;

    /**
     * @var string
     */
    protected $keyType = 'int';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'on_duty',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transportVehicle(): HasOne
    {
        return $this->hasOne(TransportVehicle::class, 'courier_user_id', 'user_id');
    }

    public function routes(): HasMany
    {
        return $this->hasMany(DeliveryRoute::class, 'courier_user_id', 'user_id');
    }
}
