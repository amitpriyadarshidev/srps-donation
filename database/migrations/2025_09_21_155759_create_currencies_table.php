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
        Schema::create('currencies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 3)->unique(); // ISO 4217 currency code (USD, EUR, etc.)
            $table->string('name'); // Currency name (US Dollar, Euro, etc.)
            $table->string('symbol', 10); // Currency symbol ($, €, etc.)
            $table->string('symbol_native', 10)->nullable(); // Native currency symbol
            $table->integer('decimal_digits')->default(2); // Number of decimal digits
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
