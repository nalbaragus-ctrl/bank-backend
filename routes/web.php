<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Di sini kita mengarahkan semua rute halaman web ke frontend Vue.
|
*/

// Ambil file index.html hasil build Vue yang sudah kamu paste di folder public
Route::any('{any}', function () {
    $path = public_path('index.html');

    if (!file_exists($path)) {
        return response()->json([
            'status' => 'error',
            'message' => 'Folder dist Vue belum di-copy ke folder public Laravel!'
        ], 404);
    }

    return file_get_contents($path);
})->where('any', '.*');
