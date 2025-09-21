<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // Country name (United States, India, etc.)
            $table->string('iso2', 2)->unique(); // ISO 3166-1 alpha-2 code (US, IN, etc.)
            $table->string('iso3', 3)->unique(); // ISO 3166-1 alpha-3 code (USA, IND, etc.)
            $table->string('numeric_code', 3)->nullable(); // ISO 3166-1 numeric code
            $table->string('phone_code'); // International dialing code (+1, +91, etc.)
            $table->string('capital')->nullable(); // Capital city
            $table->uuid('default_currency')->nullable(); // Default currency ID
            $table->string('currency_code', 3)->nullable(); // Currency code for quick access
            $table->string('region')->nullable(); // Geographic region
            $table->string('subregion')->nullable(); // Geographic subregion
            $table->string('flag_icon')->nullable(); // Flag emoji or icon
            $table->json('languages')->nullable(); // Supported languages
            $table->json('timezones')->nullable(); // Country timezones
            $table->decimal('latitude', 10, 8)->nullable(); // Latitude
            $table->decimal('longitude', 11, 8)->nullable(); // Longitude
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign key constraint
            $table->foreign('default_currency')->references('id')->on('currencies')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};
