<?php

namespace App\Services\Payment;

use App\Services\PaymentGateways\PaymentGatewayInterface;

class GatewayFactory
{
    public function make(string $code, string $environment = 'test'): ?PaymentGatewayInterface
    {
        $code = strtolower($code);
        switch ($code) {
            case 'worldline':
                return new \App\Services\PaymentGateways\WorldlineGateway($environment);
            case 'easebuzz':
                return new \App\Services\PaymentGateways\EasebuzzGateway($environment);
            // case 'easebuzz': return new ...
            // case 'cashfree': return new ...
            // case 'payu': return new ...
            default:
                return null;
        }
    }
}
