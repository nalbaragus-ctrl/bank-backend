<?php

namespace App\Http\Controllers;

use App\Models\DepositoType;
use Illuminate\Http\Request;

class DepositoTypeController extends Controller
{
    public function index()
    {
        return response()->json(DepositoType::withCount('accounts')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:deposito_types,name',
            'yearly_return' => 'required|numeric|min:0'
        ]);

        $type = DepositoType::create($validated);


        return response()->json($type->loadCount('accounts'), 201);
    }

    public function show(DepositoType $depositoType)
    {

        return response()->json($depositoType->loadCount('accounts'));
    }

    public function update(Request $request, DepositoType $depositoType)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:deposito_types,name,' . $depositoType->id,
            'yearly_return' => 'sometimes|numeric|min:0'
        ]);

        $depositoType->update($validated);


        return response()->json($depositoType->loadCount('accounts'));
    }

    public function destroy(DepositoType $depositoType)
    {

        if ($depositoType->accounts()->count() > 0) {
            return response()->json([
                'message' => 'Tidak bisa menghapus tipe deposito yang masih digunakan oleh rekening aktif!'
            ], 422);
        }

        $depositoType->delete();
        return response()->json(['message' => 'Deposito type deleted']);
    }
}
