<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Donation;
use App\Services\Payment\GatewayFactory;

$donation = Donation::orderBy('created_at', 'desc')->first();
if (!$donation) { fwrite(STDERR, "no donations\n"); exit(2); }

$factory = new GatewayFactory();
$service = $factory->make('easebuzz', 'test');

$params = [
    'amount' => (float)$donation->amount * 1.05,
    'currency' => $donation->currency->code ?? 'INR',
    'transaction_id' => 'EAS-' . date('YmdHis') . '-' . strtoupper(bin2hex(random_bytes(3))),
    'donor_id' => $donation->id,
    'name' => trim(($donation->first_name ?? '') . ' ' . ($donation->last_name ?? '')),
    'email' => $donation->email,
    'phone' => $donation->phone,
    'phone_country_code' => $donation->phone_country_code,
];

$result = $service->initializePayment($params);

echo json_encode($result, JSON_PRETTY_PRINT), "\n";
