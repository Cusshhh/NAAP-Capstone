<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

$apps = \App\Models\Application::all();
foreach ($apps as $a) {
    echo "ID: {$a->id} | Name: {$a->applicant_name} | Status: {$a->status} | Job: {$a->job_title}\n";
}
