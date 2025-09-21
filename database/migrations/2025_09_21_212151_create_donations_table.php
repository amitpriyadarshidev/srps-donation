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
        Schema::create('donations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Personal Information
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('last_name', 100);
            $table->string('email', 255);
            $table->string('phone', 20);
            $table->string('phone_country_code', 10);
            
            // Address Information
            $table->string('address_line_1', 255);
            $table->string('address_line_2', 255)->nullable();
            $table->string('city', 100);
            $table->string('zip_code', 20);
            $table->foreignId('state_id')->nullable()->constrained('states')->onDelete('set null');
            $table->foreignId('country_id')->constrained('countries')->onDelete('cascade');
            
            // Donation Information
            $table->foreignId('currency_id')->constrained('currencies')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->foreignId('purpose_id')->constrained('purposes')->onDelete('cascade');
            
            // KYC and Tax Information
            $table->json('kyc_documents')->nullable();
            $table->boolean('skip_kyc')->default(false);
            $table->boolean('tax_exemption')->default(false);
            $table->string('pan_number', 20)->nullable();
            
            // Payment Method
            $table->boolean('alternative_method')->default(false);
            
            // Status and Payment Information
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('payment_method', 50)->nullable();
            $table->string('payment_reference', 255)->nullable();
            $table->enum('payment_status', ['pending', 'processing', 'completed', 'failed', 'refunded'])->nullable();
            
            // Additional Information
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for better performance
            $table->index(['status', 'created_at']);
            $table->index(['payment_status', 'created_at']);
            $table->index(['email', 'created_at']);
            $table->index(['country_id', 'created_at']);
            $table->index(['purpose_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
