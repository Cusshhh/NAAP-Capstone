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
        'parent_id',
    ];

    /**
     * Parent department / program folder.
     */
    public function parent()
    {
        return $this->belongsTo(Department::class, 'parent_id');
    }

    /**
     * Child subfolders.
     */
    public function children()
    {
        return $this->hasMany(Department::class, 'parent_id');
    }

    /**
     * Get vacancies associated with this department.
     */
    public function vacancies()
    {
        return $this->hasMany(Vacancy::class, 'department', 'name');
    }
}
