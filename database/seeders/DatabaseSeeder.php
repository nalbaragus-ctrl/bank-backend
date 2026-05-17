<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\DepositoType; // 🟢 Pastikan namespace ini dipanggil di atas jika belum ada
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 🟢 Pindahkan ke dalam fungsi run() agar terbaca saat seeding
        DepositoType::create(['name' => 'Bronze', 'yearly_return' => 3]);
        DepositoType::create(['name' => 'Silver', 'yearly_return' => 5]);
        DepositoType::create(['name' => 'Gold', 'yearly_return' => 7]);

        // Pembuatan akun user uji coba
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
