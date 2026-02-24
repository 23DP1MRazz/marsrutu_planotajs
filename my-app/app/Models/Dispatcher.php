<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Dispatcher extends Model
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
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
