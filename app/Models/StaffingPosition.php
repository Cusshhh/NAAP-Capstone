<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffingPosition extends Model
{
    protected $fillable = [
        'campus',
        'office',
        'position',
        'sg',
        'status',
    ];
}
