<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasFactory;

    protected $fillable = ['packet', 'customer_id', 'deposito_type_id', 'balance'];

    // Relasi: Akun ini milik seorang Customer
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    // Relasi: Akun ini memiliki satu tipe deposito
    public function depositoType()
    {
        return $this->belongsTo(DepositoType::class);
    }

    // Relasi: Satu akun punya banyak riwayat transaksi
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
