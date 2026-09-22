<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$job = \App\Models\Vacancy::find(1);
if ($job) {
    echo "Job 1 attributes:\n";
    print_r($job->toArray());
}
