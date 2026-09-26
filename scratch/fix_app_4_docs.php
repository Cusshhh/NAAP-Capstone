<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$a = \App\Models\Application::find(4);
if ($a) {
    $dyn = $a->dynamic_responses ?? [];
    $dyn['documents'] = [];
    $a->dynamic_responses = $dyn;
    $a->save();
    echo "Application 4 dynamic_responses.documents cleaned successfully!\n";
}
