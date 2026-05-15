<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;

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

        $account = Account::with('depositoType')->findOrFail($validated['account_id']);

        // Ambil tanggal transaksi terakhir atau tanggal buat akun
        $lastTransaction = $account->transactions()->latest('transaction_date')->first();
        $lastDate = $lastTransaction
            ? Carbon::parse($lastTransaction->transaction_date)->startOfDay()
            : Carbon::parse($account->created_at)->startOfDay();

        $currentDate = Carbon::parse($validated['transaction_date'])->startOfDay();

        // Hitung bunga jika ada selisih bulan
        $months = $lastDate->diffInMonths($currentDate);
        $interest = 0;

        if ($months > 0) {
            $yearlyRate = $account->depositoType->yearly_return / 100;
            $interest = ($account->balance * $yearlyRate / 12) * $months;
        }

        // Cek kecukupan saldo jika penarikan
        $totalAvailable = $account->balance + $interest;
        if ($validated['type'] === 'WITHDRAW' && $validated['amount'] > $totalAvailable) {
            return response()->json(['message' => 'Saldo tidak mencukupi untuk penarikan ini'], 400);
        }

        // Update Saldo
        if ($validated['type'] === 'WITHDRAW') {
            $account->balance = $totalAvailable - $validated['amount'];
        } else {
            $account->balance = $totalAvailable + $validated['amount'];
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
            'interest_earned' => number_format($interest, 2),
            'current_balance' => $account->balance,
            'months_calculated' => $months
        ]);
    }
}
