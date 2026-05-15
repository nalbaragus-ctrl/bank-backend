<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

\App\Models\DepositoType::create(['name' => 'Bronze', 'yearly_return' => 3]);
\App\Models\DepositoType::create(['name' => 'Silver', 'yearly_return' => 5]);
\App\Models\DepositoType::create(['name' => 'Gold', 'yearly_return' => 7]);

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */

    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
