<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentGateway extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'code', 'logo', 'description', 'display_order', 'is_active', 'is_default'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    public function configs()
    {
        return $this->hasMany(PaymentGatewayConfig::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
