import { mysqlTable, int, varchar, text } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  nama: varchar('nama', { length: 255 }),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }),
  role: varchar('role', { length: 50 }),
  lokasi: varchar('lokasi', { length: 255 }),
});

export const stok = mysqlTable('stok', {
  id: int('id').primaryKey().autoincrement(),
  kode: varchar('kode', { length: 50 }).unique(),
  judul: varchar('judul', { length: 255 }),
  kategori: varchar('kategori', { length: 50 }),
  upbjj: varchar('upbjj', { length: 50 }),
  lokasiRak: varchar('lokasiRak', { length: 50 }),
  harga: int('harga'),
  qty: int('qty'),
  safety: int('safety'),
  catatanHTML: text('catatanHTML'),
});

export const tracking = mysqlTable('tracking', {
  id: int('id').primaryKey().autoincrement(),
  nomorDO: varchar('nomorDO', { length: 50 }).unique(),
  nim: varchar('nim', { length: 50 }),
  nama: varchar('nama', { length: 255 }),
  status: varchar('status', { length: 50 }),
  ekspedisi: varchar('ekspedisi', { length: 50 }),
  tanggalKirim: varchar('tanggalKirim', { length: 50 }),
  paket: varchar('paket', { length: 50 }),
  total: int('total'),
  perjalanan: text('perjalanan') // Disimpan sebagai JSON string
});
