<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $email = $request->email;
        $password = $request->password;


        if ($email === 'admin@bank.com' && $password === 'admin123') {
            return response()->json([
                'status' => 'success',
                'role' => 'ADMIN',
                'user' => [
                    'name' => 'Administrator System',
                    'email' => 'admin@bank.com'
                ]
            ]);
        }


        $customer = Customer::where('name', 'LIKE', $email)->first();

        if ($customer && $password === 'nasabah123') {
            return response()->json([
                'status' => 'success',
                'role' => 'CUSTOMER',
                'user' => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                ]
            ]);
        }

        return response()->json([
            'message' => 'Kredensial login salah atau akun tidak ditemukan!'
        ], 401);
    }
}
