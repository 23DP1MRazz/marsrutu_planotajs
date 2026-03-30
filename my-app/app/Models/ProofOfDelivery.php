<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class ProofOfDelivery extends Model
{
    /** @use HasFactory<\Database\Factories\ProofOfDeliveryFactory> */
    use BelongsToOrganization, HasFactory;

    protected $table = 'proof_of_delivery';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'organization_id',
        'route_stop_id',
        'type',
        'file_url',
        'taken_at',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function routeStop(): BelongsTo
    {
        return $this->belongsTo(RouteStop::class);
    }
}
