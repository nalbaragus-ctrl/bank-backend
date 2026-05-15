<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('packet'); // Nama paket
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('deposito_type_id')->constrained('deposito_types');
            $table->decimal('balance', 15, 2)->default(0); // Saldo awal
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
