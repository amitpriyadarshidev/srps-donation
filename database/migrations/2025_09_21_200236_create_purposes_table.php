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
        Schema::create('purposes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // Purpose name (Education, Healthcare, etc.)
            $table->string('slug')->unique(); // URL-friendly version for APIs
            $table->text('description')->nullable(); // Detailed description
            $table->string('category')->nullable(); // Category grouping (Social, Environmental, etc.)
            $table->string('icon')->nullable(); // Icon/emoji representation
            $table->integer('sort_order')->default(0); // For ordering purposes
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index(['is_active', 'sort_order']);
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purposes');
    }
};
