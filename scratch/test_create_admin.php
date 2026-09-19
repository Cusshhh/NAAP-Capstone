<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

User::where('email', 'hradmin@naap.edu.ph')->delete();

$u = User::create([
    'name' => 'PhilSCA HR Admin',
    'email' => 'hradmin@naap.edu.ph',
    'password' => Hash::make('PasswordAdmin'),
    'email_verified_at' => now(),
    'profile_data' => [
        'role' => 'super_admin',
        'is_admin' => true,
    ],
]);

echo 'SUCCESS! ID: '.$u->id.' IsAdmin: '.($u->isAdmin() ? 'YES' : 'NO')."\n";
