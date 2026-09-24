<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $cleanEmail = strtolower(trim($input['email']));
        $nameParts = explode(' ', trim($input['name']));
        $firstName = $nameParts[0] ?? '';
        $lastName = count($nameParts) > 1 ? end($nameParts) : '';

        return User::create([
            'name' => trim($input['name']),
            'email' => $cleanEmail,
            'password' => $input['password'],
            'profile_data' => [
                'firstName' => $firstName,
                'lastName' => $lastName,
                'email' => $cleanEmail,
                'fullName' => trim($input['name']),
            ],
        ]);
    }
}
