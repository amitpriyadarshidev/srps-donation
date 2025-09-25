<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$d = App\Models\Donation::orderBy('created_at', 'desc')->first();
if ($d) {
    echo $d->id, "\n";
} else {
    fwrite(STDERR, "no donations\n");
    exit(2);
}
