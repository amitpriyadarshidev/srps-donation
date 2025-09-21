<?php

namespace App\Models;

use App\Traits\UuidTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Donation extends Model
{
    use HasFactory, UuidTrait, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'phone',
        'phone_country_code',
        'address_line_1',
        'address_line_2',
        'state_id',
        'city',
        'zip_code',
        'country_id',
        'currency_id',
        'amount',
        'purpose_id',
        'kyc_documents',
        'skip_kyc',
        'tax_exemption',
        'pan_number',
        'alternative_method',
        'status',
        'payment_method',
        'payment_reference',
        'payment_status',
        'notes'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'skip_kyc' => 'boolean',
        'tax_exemption' => 'boolean',
        'alternative_method' => 'boolean',
        'kyc_documents' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * Get the country associated with the donation.
     */
    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    /**
     * Get the state associated with the donation.
     */
    public function state()
    {
        return $this->belongsTo(State::class);
    }

    /**
     * Get the currency associated with the donation.
     */
    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    /**
     * Get the purpose associated with the donation.
     */
    public function purpose()
    {
        return $this->belongsTo(Purpose::class);
    }

    /**
     * Get the full name of the donor.
     */
    public function getFullNameAttribute()
    {
        $fullName = $this->first_name;
        
        if ($this->middle_name) {
            $fullName .= ' ' . $this->middle_name;
        }
        
        $fullName .= ' ' . $this->last_name;
        
        return $fullName;
    }

    /**
     * Get the formatted amount with currency symbol.
     */
    public function getFormattedAmountAttribute()
    {
        $symbol = $this->currency->symbol ?? '$';
        return $symbol . number_format($this->amount, 2);
    }

    /**
     * Get the full phone number with country code.
     */
    public function getFullPhoneAttribute()
    {
        return $this->phone_country_code . ' ' . $this->phone;
    }

    /**
     * Get the full address.
     */
    public function getFullAddressAttribute()
    {
        $address = $this->address_line_1;
        
        if ($this->address_line_2) {
            $address .= ', ' . $this->address_line_2;
        }
        
        $address .= ', ' . $this->city;
        
        if ($this->state) {
            $address .= ', ' . $this->state->name;
        }
        
        $address .= ' ' . $this->zip_code;
        $address .= ', ' . $this->country->name;
        
        return $address;
    }

    /**
     * Scope for filtering by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for filtering by payment status.
     */
    public function scopeByPaymentStatus($query, $status)
    {
        return $query->where('payment_status', $status);
    }

    /**
     * Scope for filtering by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }
}
