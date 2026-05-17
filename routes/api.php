<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DepositoTypeController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\TransactionController;

// Route untuk Customer (index, store, show, update, destroy)
Route::apiResource('customers', CustomerController::class);

// Route untuk Deposito Type (index, store, show, update, destroy)
Route::apiResource('deposito-types', DepositoTypeController::class);

// Route untuk Account (index, store, show, update, destroy)
Route::apiResource('accounts', AccountController::class);

// Route untuk Transaksi (Hanya store untuk Deposit & Withdraw)
Route::post('transactions', [TransactionController::class, 'store']);

Route::post('login', [App\Http\Controllers\AuthController::class, 'login']);
