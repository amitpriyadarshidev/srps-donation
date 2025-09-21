<?php

namespace App\Models;

use App\Traits\UuidTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Currency extends Model
{
    use HasFactory, UuidTrait, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'symbol',
        'symbol_native',
        'decimal_digits',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'decimal_digits' => 'integer',
    ];

    /**
     * Get the countries that use this currency
     */
    public function countries()
    {
        return $this->hasMany(Country::class, 'default_currency');
    }

    /**
     * Scope to get only active currencies
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
