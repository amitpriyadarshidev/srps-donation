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

        // Easebuzz typically returns fields like 'txnid', 'easepayid', 'status', 'hash'
        if ($request->has('txnid') && $request->has('hash')) {
            return 'easebuzz';
        }

        // Add more detections here for other gateways (cashfree, payu, razorpay, etc.)

        return null;
    }
}
