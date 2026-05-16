<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'type' => 'required|in:DEPOSIT,WITHDRAW',
            'amount' => 'required|numeric|min:1',
            'transaction_date' => 'required|date',
        ]);

        // Gunakan Database Transaction agar aman jika ada crash di tengah jalan
        return DB::transaction(function () use ($validated) {
            $account = Account::with('depositoType')->lockForUpdate()->findOrFail($validated['account_id']);

            // Ambil tanggal patokan transaksi terakhir
            $lastTransaction = $account->transactions()->latest('transaction_date')->first();
            $lastDate = $lastTransaction
                ? Carbon::parse($lastTransaction->transaction_date)->startOfDay()
                : Carbon::parse($account->created_at)->startOfDay();

            $currentDate = Carbon::parse($validated['transaction_date'])->startOfDay();

            // Mencegah manipulasi tanggal mundur (Backdated Transaction yang merusak log keuangan)
            if ($currentDate->lt($lastDate)) {
                return response()->json(['message' => 'Tanggal transaksi tidak boleh lebih awal dari transaksi terakhir!'], 400);
            }

            $months = $lastDate->diffInMonths($currentDate);
            $interest = 0;

            if ($months > 0) {
                $yearlyRate = $account->depositoType->yearly_return / 100;
                $interest = ($account->balance * $yearlyRate / 12) * $months;
            }

            // Rumus akumulasi saldo yang presisi
            $totalBeforeTransaction = $account->balance + $interest;

            if ($validated['type'] === 'WITHDRAW' && $validated['amount'] > $totalBeforeTransaction) {
                return response()->json(['message' => 'Saldo tidak mencukupi untuk penarikan ini'], 400);
            }

            // Update Saldo Baru secara absolut
            if ($validated['type'] === 'WITHDRAW') {
                $account->balance = $totalBeforeTransaction - $validated['amount'];
            } else {
                $account->balance = $totalBeforeTransaction + $validated['amount'];
            }

            $account->save();

            // Simpan Log Transaksi
            $transaction = $account->transactions()->create([
                'type' => $validated['type'],
                'amount' => $validated['amount'],
                'interest_earned' => $interest,
                'transaction_date' => $validated['transaction_date']
            ]);

            return response()->json([
                'message' => 'Transaksi berhasil',
                'interest_earned' => $interest,
                'current_balance' => $account->balance,
                'months_calculated' => $months
            ]);
        });
    }
}
