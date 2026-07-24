<?php

namespace App\Http\Controllers\AuthSecond;

use App\Http\Controllers\Controller;
use App\Models\User;                          // Fixed capitalization (App vs app)
use Illuminate\Auth\Events\Registered;        // Added for event(new Registered)
use Illuminate\Http\RedirectResponse;         // Added for return type
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;          // Added for Hash::make
use Illuminate\Validation\Rules;              // Added for Password rules
use Illuminate\Support\Facades\Auth;

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

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        // If the registered user is an admin, redirect them to admin dashboard, else normal dashboard
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('dashboard');
    }
}