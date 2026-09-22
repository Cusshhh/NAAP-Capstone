<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$a = \App\Models\Application::latest()->first();
if (!$a) {
    echo "No application found\n";
    exit;
}
echo "ID: " . $a->id . "\n";
echo "Applicant Name: " . $a->applicant_name . "\n";
echo "Status: " . $a->status . "\n";
echo "to_follow_docs: " . json_encode($a->to_follow_docs) . "\n";
echo "custom_file_responses: " . json_encode($a->custom_file_responses) . "\n";
echo "dynamic_responses: " . json_encode($a->dynamic_responses) . "\n";
