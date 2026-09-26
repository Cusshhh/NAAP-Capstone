<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$apps = \App\Models\Application::all();
foreach ($apps as $a) {
    echo "ID: " . $a->id . " | Applicant: " . $a->applicant_name . " | Email: " . $a->email . "\n";
    if (isset($a->dynamic_responses['documents'])) {
        echo "  - Documents: " . json_encode($a->dynamic_responses['documents']) . "\n";
    } else {
        echo "  - Documents: NONE in dynamic_responses\n";
    }
}
