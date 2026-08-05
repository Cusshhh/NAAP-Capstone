<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
    ];

    /**
     * Get vacancies associated with this department.
     */
    public function vacancies()
    {
        return $this->hasMany(Vacancy::class, 'department', 'name');
    }
}
