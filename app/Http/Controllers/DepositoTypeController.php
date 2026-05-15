<?php

namespace App\Http\Controllers;

use App\Models\DepositoType;
use Illuminate\Http\Request;

class DepositoTypeController extends Controller
{
    public function index()
    {
        return response()->json(DepositoType::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:deposito_types,name',
            'yearly_return' => 'required|numeric|min:0'
        ]);
        $type = DepositoType::create($validated);
        return response()->json($type, 201);
    }

    public function show(DepositoType $depositoType)
    {
        return response()->json($depositoType);
    }

    public function update(Request $request, DepositoType $depositoType)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:deposito_types,name,' . $depositoType->id,
            'yearly_return' => 'sometimes|numeric|min:0'
        ]);
        $depositoType->update($validated);
        return response()->json($depositoType);
    }

    public function destroy(DepositoType $depositoType)
    {
        $depositoType->delete();
        return response()->json(['message' => 'Deposito type deleted']);
    }
}
