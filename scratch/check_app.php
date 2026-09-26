<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$a = \App\Models\Application::find(4);
if ($a) {
    echo "ID: " . $a->id . "\n";
    echo "Applicant: " . $a->applicant_name . "\n";
    echo "Email: " . $a->email . "\n";
    echo "Dynamic Responses:\n";
    print_r($a->dynamic_responses);
    echo "Custom File Responses:\n";
    print_r($a->custom_file_responses);
    echo "User profile data:\n";
    $u = \App\Models\User::where('email', $a->email)->first();
    if ($u) {
        print_r($u->profile_data);
    }
} else {
    echo "Application ID 4 not found.\n";
}
