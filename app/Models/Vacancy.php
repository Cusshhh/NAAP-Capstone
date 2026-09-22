<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vacancy extends Model
{
    protected $fillable = [
        'staffing_id',
        'campus_id',
        'title',
        'plantilla_item',
        'department',
        'employment_type',
        'location',
        'description',
        'competency',
        'responsibilities',
        'requirements',
        'qs_education',
        'qs_experience',
        'qs_eligibility',
        'qs_training',
        'salary_grade',
        'deadline',
        'status',
        'custom_file_requirements',
    ];

    protected $casts = [
        'responsibilities' => 'array',
        'to_follow_docs' => 'array',
        'custom_file_responses' => 'array',
        'requirements' => 'array',
        'deadline' => 'date',
        'custom_file_requirements' => 'array',
    ];

    public function applications()
    {
        return $this->hasMany(Application::class, 'job_id');
    }
}
