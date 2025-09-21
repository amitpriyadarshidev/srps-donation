<?php

namespace App\Models;

use App\Traits\UuidTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class State extends Model
{
    use HasFactory, UuidTrait, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'country_id',
        'type',
        'latitude',
        'longitude',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_active' => 'boolean',
    ];

    /**
     * Get the country that this state belongs to
     */
    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    /**
     * Scope to get only active states
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
