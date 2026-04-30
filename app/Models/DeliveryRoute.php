<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeliveryRoute extends Model
{
    /** @use HasFactory<\Database\Factories\DeliveryRouteFactory> */
    use BelongsToOrganization, HasFactory;

    protected $table = 'routes';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'organization_id',
        'courier_user_id',
        'date',
        'status',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(Courier::class, 'courier_user_id', 'user_id');
    }

    public function routeStops(): HasMany
    {
        return $this->hasMany(RouteStop::class, 'route_id');
    }
}
