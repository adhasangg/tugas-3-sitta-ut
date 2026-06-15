# SITTA - Portal Bahan Ajar UT (Vue.js + Hono API)

Aplikasi ini merupakan hasil pengembangan/refaktor antarmuka aplikasi pemesanan bahan ajar SITTA Universitas Terbuka yang terintegrasi dengan RESTful API (Hono + Drizzle ORM) dan database relasional MySQL.

## Panduan Menjalankan Aplikasi

Backend diletakkan di dalam subdirektori `/api`, yang juga berperan sebagai _web server_ untuk melayani *Static Files* dari frontend Vue.js pada _port_ yang sama.

### 1. Kebutuhan Lingkungan (*Prerequisites*)
- [Node.js](https://nodejs.org/) versi v18 atau yang lebih tinggi.
- MySQL Server yang aktif pada *environment* lokal (contoh: XAMPP, MySQL Workbench, dsb).

### 2. Penyiapan Database MySQL
Buat sebuah database baru pada server MySQL Anda. Anda dapat menjalankannya melalui terminal SQL atau antarmuka phpMyAdmin:
```sql
CREATE DATABASE `sitta-ut`;
```

### 3. Konfigurasi Environment Variable (`.env`)
Aplikasi ini memerlukan akses ke database via *environment variable*. 
1. Masuk ke dalam direktori `api/`.
2. Duplikasikan atau *rename* file `.env.example` menjadi `.env`.
3. Buka `.env` dan atur *connection string* sesuai dengan kredensial server MySQL Anda:
```ini
DATABASE_URL=mysql://[userdb]:[password_user]@localhost:3306/[db_name]
```
*(Contoh: `DATABASE_URL=mysql://root:root@localhost:3306/sitta-ut`)*

### 4. Instalasi Dependensi (*Node Modules*)
Buka *Terminal* atau *Command Prompt*, lalu masuk ke dalam folder `api` dan instal modul NPM yang dibutuhkan:
```bash
cd api
npm install
```

### 5. Sinkronisasi Migrasi Skema dan Seeder Data
Aplikasi tidak perlu membuat tabel secara manual di dalam database. Cukup dorong skema (Push) dengan Drizzle ORM dan jalankan skrip *seeder* untuk mengisi data dari `dataBahanAjar.json` dan `user.json` ke MySQL:
```bash
npm run push
node db/seed.js
```
*Catatan: Pastikan database MySQL aktif saat perintah di atas dieksekusi.*

### 6. Menjalankan Server
Jalankan server aplikasi (dengan _live-reload_ nodemon):
```bash
npm run dev
```

Buka URL berikut melalui peramban (browser) Anda:
👉 **[http://localhost:3000](http://localhost:3000)**

*Untuk melakukan ujicoba pada aplikasi web, Anda bisa melakukan login dengan akun dari seeder. (Contoh: `admin@ut.ac.id` dengan sandi `admin123`).*
