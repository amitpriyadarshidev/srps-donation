<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('donation_id');
            $table->unsignedBigInteger('payment_gateway_id');
            $table->string('gateway_transaction_id')->nullable();
            $table->string('gateway_token')->nullable();
            $table->decimal('amount', 10, 2);
            $table->unsignedBigInteger('currency_id');
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded', 'aborted', 'cancelled'])->default('pending');
            $table->json('gateway_response')->nullable();
            $table->timestamps();

            $table->foreign('donation_id')->references('id')->on('donations');
            $table->foreign('payment_gateway_id')->references('id')->on('payment_gateways');
            $table->foreign('currency_id')->references('id')->on('currencies');
            $table->index(['donation_id', 'status']);
            $table->index('gateway_transaction_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
