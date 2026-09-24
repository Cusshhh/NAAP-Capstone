<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Sending test email via Resend SMTP to account email...\n";
    \Illuminate\Support\Facades\Mail::to('fdyc4dtkh5@privaterelay.appleid.com')->send(
        new \App\Mail\SecurityOtpMail('888999', 'Marcus Cacacho', 'Resend Test Verification')
    );
    echo "SUCCESS: Email sent via Resend SMTP!\n";
} catch (\Throwable $e) {
    echo "ERROR sending mail via Resend: " . $e->getMessage() . "\n";
}
