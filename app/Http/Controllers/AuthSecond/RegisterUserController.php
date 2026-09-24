<?php

namespace App\Http\Controllers\AuthSecond;

use App\Http\Controllers\Controller;
use App\Models\User;                          // Fixed capitalization (App vs app)
use Illuminate\Auth\Events\Registered;        // Added for event(new Registered)
use Illuminate\Http\RedirectResponse;         // Added for return type
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;          // Added for Hash::make
use Illuminate\Support\Facades\Hash;              // Added for Password rules
use Illuminate\Validation\Rules;

class RegisterUserController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        if ($request->has('email')) {
            $request->merge([
                'email' => strtolower($request->email),
            ]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $nameParts = explode(' ', trim($request->name));
        $firstName = $nameParts[0] ?? '';
        $lastName = count($nameParts) > 1 ? end($nameParts) : '';
        $cleanEmail = strtolower(trim($request->email));

        $user = User::create([
            'name' => trim($request->name),
            'email' => $cleanEmail,
            'password' => Hash::make($request->password),
            'profile_data' => [
                'firstName' => $firstName,
                'lastName' => $lastName,
                'email' => $cleanEmail,
                'fullName' => trim($request->name),
            ],
        ]);

        try {
            event(new Registered($user));
        } catch (\Throwable $e) {
            \Log::warning('Email verification event skipped: '.$e->getMessage());
        }

        Auth::login($user);

        // If the registered user is an admin, redirect them to admin dashboard, else normal dashboard
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('dashboard');
    }
}
