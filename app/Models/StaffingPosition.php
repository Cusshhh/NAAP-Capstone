<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffingPosition extends Model
{
    protected $fillable = [
        'campus',
        'office',
        'position',
        'plantilla_item',
        'employment_type',
        'location',
        'sg',
        'qs_education',
        'qs_experience',
        'qs_eligibility',
        'qs_training',
        'description',
        'competency',
        'responsibilities',
        'requirements',
        'deadline',
        'custom_file_requirements',
        'status',
    ];

    protected $casts = [
        'responsibilities' => 'array',
        'requirements' => 'array',
        'custom_file_requirements' => 'array',
        'deadline' => 'date',
    ];
}
