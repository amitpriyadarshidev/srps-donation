<?php

namespace App\Services\Payment;

use Illuminate\Http\Request;

class PaymentCallbackService
{
    protected GatewayResolver $resolver;

    public function __construct(GatewayResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    /**
     * Normalize callback payloads to a standard result.
     * Returns: [success: bool, status: string, transaction_id?: string, amount?: float, gateway?: string, raw?: array]
     */
    public function handle(Request $request): array
    {
        $gateway = $this->resolver->detect($request);

        if ($gateway) {
            $service = $this->getGatewayService($gateway);
            if ($service) {
                return $service->handleCallback($request->all());
            }
        }

        return [
            'success' => false,
            'status' => 'unknown',
            'message' => 'Unknown payment gateway callback',
            'raw' => $request->all(),
        ];
    }

    protected function getGatewayService(string $code)
    {
        // For now only worldline; extend with other gateways
        if ($code === 'worldline') {
            return new \App\Services\PaymentGateways\WorldlineGateway(app()->environment('production') ? 'live' : 'test');
        }
        return null;
    }
}
