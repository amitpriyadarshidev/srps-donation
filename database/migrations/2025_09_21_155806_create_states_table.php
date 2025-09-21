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
        Schema::create('states', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // State/Province name
            $table->string('code')->nullable(); // State/Province code (CA, TX, MH, etc.)
            $table->uuid('country_id'); // Foreign key to countries
            $table->string('type')->default('state'); // state, province, territory, etc.
            $table->decimal('latitude', 10, 8)->nullable(); // Latitude
            $table->decimal('longitude', 11, 8)->nullable(); // Longitude
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            // Foreign key constraint
            $table->foreign('country_id')->references('id')->on('countries')->onDelete('cascade');
            
            // Index for faster queries
            $table->index(['country_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('states');
    }
};
