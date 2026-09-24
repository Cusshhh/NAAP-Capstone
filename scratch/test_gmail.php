<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Sending test email via Gmail SMTP to marcusangelocacacho2525@gmail.com...\n";
    \Illuminate\Support\Facades\Mail::to('marcusangelocacacho2525@gmail.com')->send(
        new \App\Mail\SecurityOtpMail('777123', 'Marcus Cacacho', 'Gmail Verification Test')
    );
    echo "SUCCESS: Email delivered via Gmail SMTP!\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
