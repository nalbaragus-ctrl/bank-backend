<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index()
    {
        // Mengambil data account beserta relasi customer dan tipe depositonya
        return response()->json(Account::with(['customer', 'depositoType'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'deposito_type_id' => 'required|exists:deposito_types,id',
            'packet' => 'required|string',
            'balance' => 'required|numeric|min:0'
        ]);

        $account = Account::create($validated);
        return response()->json($account, 201);
    }

    public function show(Account $account)
    {
        return response()->json($account->load(['customer', 'depositoType']));
    }

    public function update(Request $request, Account $account)
    {
        $validated = $request->validate([
            'packet' => 'sometimes|string',
            'deposito_type_id' => 'sometimes|exists:deposito_types,id'
        ]);

        $account->update($validated);
        return response()->json($account);
    }

    public function destroy(Account $account)
    {
        $account->delete();
        return response()->json(['message' => 'Account deleted successfully']);
    }
}
