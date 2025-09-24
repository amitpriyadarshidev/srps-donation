<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentGatewayConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_gateway_id', 'key', 'value', 'type', 'is_sensitive', 'environment', 'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_sensitive' => 'boolean',
    ];

    public function gateway()
    {
        return $this->belongsTo(PaymentGateway::class, 'payment_gateway_id');
    }
}
