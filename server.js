const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const CryptoJS = require("crypto-js");

const secretKey = "dogcatcow";
const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

// ดึงข้อมูล User
app.get("/user", async (req, res) => {
  try {
    const data = await prisma.user.findMany();
    const finalData = data.map((record) => {
      // ถอดรหัสรหัสผ่าน
      const bytes = CryptoJS.AES.decrypt(record.password, secretKey);
      record.password = bytes.toString(CryptoJS.enc.Utf8);
      return record;
    });

    res.json({ message: "OK", data: finalData });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

// เพิ่ม User
app.post("/user", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // เข้ารหัสรหัสผ่าน
    const encodedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();

    const response = await prisma.user.create({
      data: { username, password: encodedPassword },
    });

    res.json({ message: "User added successfully", data: response });
  } catch (error) {
    res.status(500).json({ message: "Error adding user", error: error.message });
  }
});

// แก้ไข User
app.put("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const encodedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();

    const response = await prisma.user.update({
      where: { id: Number(id) },
      data: { username, password: encodedPassword },
    });

    res.json({ message: "User updated successfully", data: response });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

// ค้นหา User
app.get("/user/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    const data = await prisma.$queryRaw`SELECT id, username FROM User WHERE username LIKE ${q + "%"}`;
    
    res.json({ message: "OK", data });
  } catch (error) {
    res.status(500).json({ message: "Error searching users", error: error.message });
  }
});

// ลบ User
app.delete("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});

// เริ่มเซิร์ฟเวอร์
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
