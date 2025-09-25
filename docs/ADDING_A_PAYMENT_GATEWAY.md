# Adding a New Payment Gateway

This guide explains how to implement a new payment gateway end-to-end in this project, covering both backend (Laravel) and frontend (Inertia/React) integration. It builds on the existing gateway abstraction and the dynamic client initializer.

## Overview

- Backend
  - Add a gateway row in `payment_gateways` table
  - Implement a gateway service with `initializePayment` and `verifyPayment`
  - Register the gateway in `GatewayFactory`
- Frontend
  - If the gateway requires client-side JS, add an initializer and register it in `resources/js/payment/init.ts`
  - The payment selection page already initializes gateways dynamically based on the backend response

## Prerequisites

- Laravel 12, PHP 8.2+
- Inertia + React + TypeScript
- Worldline integration exists as a reference implementation

## 1) Database setup

Ensure the gateway exists in the DB. Create a row in `payment_gateways` (via seeder or admin):

- `name`: Human readable name (e.g., "Razorpay")
- `code`: Unique code (lowercase, e.g., `razorpay`)
- `logo`: Optional image filename under `public/images`
- `is_default`: Whether it’s default on the selection page
- `is_active`: Whether selectable by donors

The `DonationController@paymentSelection` renders all active gateways.

## 2) Backend service

Create a class under `app/Services/PaymentGateways` implementing the expected methods:

- `initializePayment(array $params): array`
  - Input params include: `amount`, `currency`, `transaction_id`, `donor_id`, `name`, `email`, `phone`, `phone_country_code`
  - Return shape on success: `{ success: true, data: array, gateway_configs?: array }`
  - The controller will wrap it into a response:
    ```php
    return [
      'ok' => true,
      'gateway' => '{code}',
      'payload' => [
        'form_data' => $response['data'] ?? [],
        'gateway_configs' => $response['gateway_configs'] ?? [],
        'environment' => $env,
        'returnUrl' => route('payment.callback', ['donation_id' => $donation->id]),
      ],
    ];
    ```
  - For retries, controller may pass the same `transaction_id` to reuse gateway references

- `verifyPayment(string $reference, string $date): array`
  - Returns `{ success: bool, status?: string, token_identifier?: string, message?: string }`

Add your service and wire it to the factory:

```php
// app/Services/Payment/GatewayFactory.php
public function make(string $code, string $env): ?object
{
    switch ($code) {
        case 'worldline':
            return new \App\Services\PaymentGateways\WorldlineGateway($env);
        case 'razorpay':
            return new \App\Services\PaymentGateways\RazorpayGateway($env); // <-- add this
        default:
            return null;
    }
}
```

### Return payload contract

The frontend expects `beginPayment` to return JSON like:
```json
{
  "ok": true,
  "gateway": "razorpay",
  "payload": { /* gateway-specific */ }
}
```
The `payload` should include one of the following for client initialization:
- A URL to redirect: `{ url: "https://..." }`
- A form descriptor to auto-submit:
  ```json
  { "form": { "action": "https://...", "method": "POST", "fields": { "k":"v" } } }
  ```
- A gateway-specific object that your client initializer understands

## 3) Frontend client initializer (optional)

If the gateway needs custom JS to launch a payment flow (popups, overlays, SDK), create an initializer under `resources/js/payment/` and register it.

Example: `resources/js/payment/razorpay.ts`:
```ts
export async function initRazorpay(payload: any) {
  // Load SDK if needed, then open checkout
  // const rzp = new (window as any).Razorpay({ /* ...from payload... */ });
  // rzp.open();
  return { ok: true };
}
```

Register in `resources/js/payment/init.ts`:
```ts
import { initRazorpay } from '@/payment/razorpay';
const registry = {
  worldline: initWorldline,
  razorpay: initRazorpay,
};
```

If your gateway just needs a redirect or form-post, you can skip writing a custom initializer; the generic initializer already handles `{ url }` and `{ form }` payloads.

## 4) Payment flow

- Start payment: `POST donation.pay` with `{ gateway: 'razorpay' }`
- Controller resolves the service and returns `gateway` and `payload`
- Frontend calls `initGateway(gateway, payload)` dynamically
- Callback: All gateways hit `route('payment.callback')` where `PaymentCallbackService` normalizes and persists status
- Retry: Removed. For all gateways we always initiate a new transaction reference; `retry_transaction_id` is no longer used.

## 5) Testing checklist

- Begin payment returns `{ ok, gateway, payload }`
- Client initialization runs without errors
- Callback stores status and token
- Retry path verifies current status, reuses reference
- Check status endpoint (`donation.status`) returns correct state and redirects on success

## 6) UX and assets

- Add a logo under `public/images` and set the filename in the `payment_gateways` row
- Provide a short description in the DB for the selection card
- Make it `is_active = 1` to display

## 7) Security/CSRF

- Frontend includes `XSRF-TOKEN` and `csrf-token` meta for POSTs
- Backend uses `VerifyCsrfToken` and session cookies

## 8) Troubleshooting

- If payment selection doesn’t render your gateway, ensure the row exists and `is_active=1`
- If init fails on the frontend, inspect the JSON returned from `beginPayment` (look for `gateway` and `payload`)
- If callback not firing, double-check `returnUrl` and gateway dashboard settings
- Use `donation.checkStatus` endpoint to poll/verify when callbacks are delayed

## 9) Example files to reference

- Backend
  - `app/Http/Controllers/DonationController.php` (beginPayment, paymentCallback, checkStatus)
  - `app/Services/Payment/GatewayFactory.php`
  - `app/Services/PaymentGateways/WorldlineGateway.php`
- Frontend
  - `resources/js/pages/donation/payment-selection.tsx`
  - `resources/js/payment/init.ts`
  - `resources/js/payment/worldline.ts`

That’s it — once your gateway is wired in the factory and (optionally) the client registry, the selection page will handle it dynamically.
