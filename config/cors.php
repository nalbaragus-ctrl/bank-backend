'paths' => ['api/*', 'sanctum/csrf-cookie'],

'allowed_methods' => ['*'],

// Bagian ini yang paling penting, man!
'allowed_origins' => [
'http://localhost:3000', // Port default jika frontendmu pakai Next.js / React
'http://localhost:5173', // Port default jika frontendmu pakai Vite (Vue / React baru)
'http://localhost:8000', // Berjaga-jaga jika ada pengujian lokal lain
// Nanti kalau frontendmu sudah di-deploy (misal di Vercel/Netlify),
// tinggal tambahkan URL production frontendmu di bawah sini, contoh:
// 'https://bank-frontend.vercel.app',
],

'allowed_origins_patterns' => [],

'allowed_headers' => ['*'],

'exposed_headers' => [],

'max_age' => 0,

'supports_credentials' => true, // Set ke true agar Sanctum/Cookie login bisa lewat nanti