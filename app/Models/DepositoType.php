<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepositoType extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'yearly_return'];

    // Relasi: 1 tipe deposito bisa dipakai oleh banyak Account
    public function accounts()
    {
        return $this->hasMany(Account::class);
    }
}
