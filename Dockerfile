FROM php:8.4-fpm-alpine

# Install tools dasar dan extension PostgreSQL untuk PHP 8.4
RUN apk add --no-cache nginx supervisor curl libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Atur folder kerja
WORKDIR /var/www/html
COPY . .

# Ambil composer terbaru
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Jalankan install dependencies Laravel 13
RUN composer install --no-dev --optimize-autoloader --no-scripts

# PENTING: Paksa buka izin folder storage agar tidak Error 500 karena permission
RUN mkdir -p /var/www/html/storage/framework/cache/data \
    && mkdir -p /var/www/html/storage/framework/sessions \
    && mkdir -p /var/www/html/storage/framework/views \
    && chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 8080

# Jalankan server lewat php artisan dan bersihkan cache hantu
CMD php artisan config:clear && php artisan cache:clear && php artisan view:clear && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}