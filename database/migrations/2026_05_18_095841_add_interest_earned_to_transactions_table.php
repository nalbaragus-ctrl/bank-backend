<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        if (!Schema::hasColumn('transactions', 'interest_earned')) {
            Schema::table('transactions', function (Blueprint $table) {
                // Jika belum ada, baru buat kolomnya setelah 'amount'
                $table->decimal('interest_earned', 15, 2)->default(0)->after('amount');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        if (Schema::hasColumn('transactions', 'interest_earned')) {
            Schema::table('transactions', function (Blueprint $table) {
                // Jika ada, baru hapus kolomnya saat php artisan migrate:rollback
                $table->dropColumn('interest_earned');
            });
        }
    }
};
