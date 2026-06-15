import { db } from "./db.js";
import { users, stok, tracking } from "./schema.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  console.log("Seeding started...");

  // Clear existing data
  console.log("Clearing existing data...");
  await db.delete(tracking);
  await db.delete(stok);
  await db.delete(users);

  // Seed Users
  const userDataPath = path.resolve(__dirname, "../../data/user.json");
  const usersData = JSON.parse(fs.readFileSync(userDataPath, "utf-8"));

  for (const user of usersData) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await db.insert(users).values({
      nama: user.nama,
      email: user.email,
      password: hashedPassword,
      role: user.role,
      lokasi: user.lokasi,
    });
    console.log(`User ${user.nama} inserted.`);
  }

  // Seed Stok
  const bahanAjarPath = path.resolve(__dirname, "../../data/dataBahanAjar.json");
  const bahanAjarData = JSON.parse(fs.readFileSync(bahanAjarPath, "utf-8"));
  
  for (const item of bahanAjarData.stok) {
    await db.insert(stok).values({
      kode: item.kode,
      judul: item.judul,
      kategori: item.kategori,
      upbjj: item.upbjj,
      lokasiRak: item.lokasiRak,
      harga: item.harga,
      qty: item.qty,
      safety: item.safety,
      catatanHTML: item.catatanHTML,
    });
    console.log(`Stok ${item.kode} inserted.`);
  }

  // Seed Tracking
  for (const trackItem of bahanAjarData.tracking) {
    for (const [nomorDO, dataDO] of Object.entries(trackItem)) {
      await db.insert(tracking).values({
        nomorDO: nomorDO,
        nim: dataDO.nim,
        nama: dataDO.nama,
        status: dataDO.status,
        ekspedisi: dataDO.ekspedisi,
        tanggalKirim: dataDO.tanggalKirim,
        paket: dataDO.paket,
        total: dataDO.total,
        perjalanan: JSON.stringify(dataDO.perjalanan || [])
      });
      console.log(`Tracking ${nomorDO} inserted.`);
    }
  }

  console.log("Seeding finished.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
