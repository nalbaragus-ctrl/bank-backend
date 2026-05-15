<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    // Kolom yang boleh diisi secara massal
    protected $fillable = ['name'];

    // Relasi: 1 Customer bisa punya banyak Account
    public function accounts()
    {
        return $this->hasMany(Account::class);
    }
}
