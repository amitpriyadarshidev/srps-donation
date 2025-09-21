<?php

namespace App\Models;

use App\Traits\UuidTrait;
use Illuminate\Database\Eloquent\Model;

class FailedJob extends Model
{
    use UuidTrait;

    protected $table = 'failed_jobs';

    protected $fillable = [
        'id',
        'uuid',
        'connection',
        'queue',
        'payload',
        'exception',
        'failed_at'
    ];
}
