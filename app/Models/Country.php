<?php

namespace App\Models;

use App\Traits\UuidTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Country extends Model
{
    use HasFactory, UuidTrait, SoftDeletes;

    protected $fillable = [
        'name',
        'iso2',
        'iso3',
        'numeric_code',
        'phone_code',
        'capital',
        'default_currency',
        'currency_code',
        'region',
        'subregion',
        'flag_icon',
        'languages',
        'timezones',
        'latitude',
        'longitude',
        'is_active',
    ];

    protected $casts = [
        'languages' => 'array',
        'timezones' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_active' => 'boolean',
    ];

    /**
     * Get the currency for this country
     */
    public function currency()
    {
        return $this->belongsTo(Currency::class, 'default_currency');
    }

    /**
     * Get the states/provinces for this country
     */
    public function states()
    {
        return $this->hasMany(State::class);
    }

    /**
     * Scope to get only active countries
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
