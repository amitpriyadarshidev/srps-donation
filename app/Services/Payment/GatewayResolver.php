<?php

namespace App\Services\Payment;

use Illuminate\Http\Request;

class GatewayResolver
{
    /**
     * Detect the gateway based on callback payload.
     */
    public function detect(Request $request): ?string
    {
        // Worldline sends a single 'msg' pipe-delimited parameter
        if ($request->has('msg')) {
            return 'worldline';
        }

        // Add more detections here for other gateways (easebuzz, cashfree, payu, razorpay, etc.)

        return null;
    }
}
