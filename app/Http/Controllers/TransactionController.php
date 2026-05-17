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

        return DB::transaction(function () use ($validated) {
            $account = Account::with('depositoType')->lockForUpdate()->findOrFail($validated['account_id']);

            // 1. Patokan mutlak kelahiran rekening (pangkas jam detiknya)
            $accountCreatedAt = Carbon::parse($account->created_at)->startOfDay();
            $currentDate = Carbon::parse($validated['transaction_date'])->startOfDay();

            // Aturan Mutlak: Tidak boleh transaksi sebelum rekening dibuat
            if ($currentDate->lt($accountCreatedAt)) {
                return response()->json([
                    'message' => 'Gagal! Tanggal transaksi tidak boleh lebih mundur dari tanggal pembukaan rekening (' . $accountCreatedAt->format('Y-m-d') . ')!'
                ], 400);
            }

            // 🔄 KOREKSI LOGIKA UTAMA:
            // Cari transaksi terakhir yang posisinya SEBELUM atau SAMA DENGAN tanggal yang diinput saat ini
            $lastTransactionBefore = $account->transactions()
                ->where('transaction_date', '<=', $validated['transaction_date'])
                ->latest('transaction_date')
                ->latest('id') // Pengaman tambahan jika ada transaksi di hari yang sama
                ->first();

            // Tentukan titik acuan masa lalu yang valid untuk input tanggal saat ini
            $lastDate = $lastTransactionBefore
                ? Carbon::parse($lastTransactionBefore->transaction_date)->startOfDay()
                : $accountCreatedAt;

            // 🧮 Hitung selisih bulan dari titik acuan yang valid tersebut
            $months = $lastDate->diffInMonths($currentDate);
            $interest = 0;

            if ($months > 0) {
                $yearlyRate = $account->depositoType->yearly_return / 100;
                $interest = ($account->balance * $yearlyRate / 12) * $months;
            }

            // Gabungkan saldo berjalan dengan bunga yang berhak didapatkan pada titik tanggal ini
            $totalBeforeTransaction = $account->balance + $interest;

            // Cek kecukupan saldo untuk tipe WITHDRAW
            if ($validated['type'] === 'WITHDRAW' && $validated['amount'] > $totalBeforeTransaction) {
                return response()->json(['message' => 'Saldo tidak mencukupi untuk penarikan di tanggal ini!'], 400);
            }

            // Update Saldo Baru secara absolut
            if ($validated['type'] === 'WITHDRAW') {
                $account->balance = $totalBeforeTransaction - $validated['amount'];
            } else {
                $account->balance = $totalBeforeTransaction + $validated['amount'];
            }

            $account->save();


            $transaction = $account->transactions()->create([
                'type' => $validated['type'],
                'amount' => $validated['amount'],
                'interest_earned' => $interest,
                'transaction_date' => $validated['transaction_date']
            ]);

            $updatedAccount = Account::with(['transactions' => function ($query) {
                $query->latest('transaction_date')->latest('id');
            }])->findorFail($account->id);

            return response()->json([
                'message' => 'Transaksi berhasil diproses',
                'interest_earned' => $interest,
                'current_balance' => $account->balance,
                'months_calculated' => $months,
                'transactions' => $updatedAccount->transactions
            ]);
        });
    }
}
