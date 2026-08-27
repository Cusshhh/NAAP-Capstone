<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'campus_id',
        'profile_data',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'profile_data' => 'array',
        ];
    }

    public function isSuperAdmin(): bool
    {
        $role = is_array($this->profile_data) ? ($this->profile_data['role'] ?? null) : $this->role;

        return $role === 'super_admin' || $this->email === 'admin@naap.edu.ph';
    }

    public function isHrAdmin(): bool
    {
        $role = is_array($this->profile_data) ? ($this->profile_data['role'] ?? null) : $this->role;

        return $role === 'hr_admin' || $this->isAdmin();
    }

    public function isHrStaff(): bool
    {
        $role = is_array($this->profile_data) ? ($this->profile_data['role'] ?? null) : $this->role;

        return $role === 'hr_staff' || $this->isAdmin();
    }

    public function isAdmin(): bool
    {
        if ($this->email === 'admin@naap.edu.ph') {
            return true;
        }

        $role = is_array($this->profile_data) ? ($this->profile_data['role'] ?? null) : $this->role;
        if (in_array($role, ['super_admin', 'hr_admin', 'hr_staff', 'admin'])) {
            return true;
        }

        if (is_array($this->profile_data) && ! empty($this->profile_data['is_admin'])) {
            return true;
        }

        return false;
    }
}
