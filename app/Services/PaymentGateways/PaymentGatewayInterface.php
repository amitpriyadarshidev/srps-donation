<?php

namespace App\Services\PaymentGateways;

interface PaymentGatewayInterface
{
    /** Unique code for the gateway, e.g., 'worldline'. */
    public function getCode(): string;

    /** Initialize payment; returns payload/config for client. */
    public function initializePayment(array $data): array;

    /** Handle gateway callback; normalize to common shape. */
    public function handleCallback(array $data): array;

    /** Optional verification or status check. */
    public function verifyPayment(string $transactionId, ?string $transactionDate = null): array;
}
