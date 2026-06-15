import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { db } from "./db/db.js";
import { users, stok, tracking } from "./db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

const app = new Hono();

const authMiddleware = async (c, next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];
  if (!token) return c.json({ message: "Unauthorized" }, 401);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    c.set("user", decoded);
    await next();
  } catch (err) {
    return c.json({ message: "Unauthorized" }, 401);
  }
};

app.post("/api/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  const result = await db.select().from(users).where(eq(users.email, email));
  const user = result[0];

  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return c.json({ message: "Invalid password" }, 401);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" },
  );
  return c.json({
    token,
    user: {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      lokasi: user.lokasi,
    },
  });
});

app.post("/api/register", async (c) => {
  try {
    const body = await c.req.json();
    const { nama, email, password, role, lokasi } = body;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length > 0) {
      return c.json({ message: "Email sudah terdaftar" }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      nama,
      email,
      password: hashedPassword,
      role: role || "UPBJJ-UT",
      lokasi: lokasi || "",
    });

    return c.json({ message: "Registrasi berhasil" });
  } catch (err) {
    console.error(err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

app.post("/api/forgot-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length === 0) {
      return c.json({ message: "Email tidak ditemukan" }, 400);
    }

    return c.json({
      message: "Link reset password telah dikirim ke email Anda",
    });
  } catch (err) {
    console.error(err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

app.get("/api/dataBahanAjar", async (c) => {
  try {
    const bahanAjarPath = path.resolve(__dirname, "../data/dataBahanAjar.json");
    const bahanAjarData = JSON.parse(fs.readFileSync(bahanAjarPath, "utf-8"));

    const dbStok = await db.select().from(stok);

    return c.json({
      upbjjList: bahanAjarData.upbjjList,
      kategoriList: bahanAjarData.kategoriList,
      pengirimanList: bahanAjarData.pengirimanList,
      paket: bahanAjarData.paket,
      tracking: bahanAjarData.tracking,
      stok: dbStok,
    });
  } catch (err) {
    console.error(err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

app.get("/api/users", async (c) => {
  const dbUsers = await db
    .select({
      id: users.id,
      nama: users.nama,
      email: users.email,
      role: users.role,
      lokasi: users.lokasi,
    })
    .from(users);
  return c.json(dbUsers);
});

app.get("/api/stok", async (c) => {
  const allStok = await db.select().from(stok);
  return c.json(allStok);
});

app.post("/api/stok", async (c) => {
  const body = await c.req.json();
  const result = await db.insert(stok).values(body);
  return c.json({ message: "Stok created", id: result[0].insertId });
});

app.put("/api/stok/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  await db.update(stok).set(body).where(eq(stok.id, id));
  return c.json({ message: "Stok updated" });
});

app.delete("/api/stok/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(stok).where(eq(stok.id, id));
  return c.json({ message: "Stok deleted" });
});


app.get("/api/tracking", async (c) => {
  try {
    const allTracking = await db.select().from(tracking);
    const formattedTracking = allTracking.map((item) => {
      try {
        item.perjalanan = JSON.parse(item.perjalanan);
      } catch (e) {
        item.perjalanan = [];
      }
      return item;
    });
    return c.json(formattedTracking);
  } catch (err) {
    console.error(err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

app.post("/api/tracking", async (c) => {
  try {
    const body = await c.req.json();
    const {
      nomorDO,
      nim,
      nama,
      status,
      ekspedisi,
      tanggalKirim,
      paket: paketKode,
      total,
      perjalanan,
    } = body;

    const bahanAjarPath = path.resolve(__dirname, "../data/dataBahanAjar.json");
    const bahanAjarData = JSON.parse(fs.readFileSync(bahanAjarPath, "utf-8"));

    const paketDetail = bahanAjarData.paket.find((p) => p.kode === paketKode);
    if (!paketDetail || !paketDetail.isi) {
      return c.json({ message: "Paket tidak valid" }, 400);
    }

    const dbStok = await db.select().from(stok);

    let outOfStockItems = [];
    for (let kode of paketDetail.isi) {
      const stokItem = dbStok.find((s) => s.kode === kode);
      if (!stokItem || stokItem.qty <= 0) {
        outOfStockItems.push(stokItem ? stokItem.judul : kode);
      }
    }

    if (outOfStockItems.length > 0) {
      return c.json(
        {
          message: `Gagal! Stok kosong untuk komponen: ${outOfStockItems.join(", ")}`,
        },
        400,
      );
    }

    for (let kode of paketDetail.isi) {
      const stokItem = dbStok.find((s) => s.kode === kode);
      await db
        .update(stok)
        .set({ qty: stokItem.qty - 1 })
        .where(eq(stok.kode, kode));
    }

    const insertData = {
      nomorDO,
      nim,
      nama,
      status,
      ekspedisi,
      tanggalKirim,
      paket: paketKode,
      total,
      perjalanan: JSON.stringify(perjalanan || []),
    };

    const result = await db.insert(tracking).values(insertData);
    return c.json({
      message: "DO Berhasil Dibuat",
      id: result[0].insertId,
      data: insertData,
    });
  } catch (err) {
    console.error(err);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

app.use("/*", serveStatic({ root: "../" }));

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
