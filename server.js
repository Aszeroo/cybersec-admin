const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const CryptoJS = require("crypto-js");

const secretKey = "dogcatcow";

const app = express();
app.use(bodyParser.json());
const prisma = new PrismaClient();

app.get("/", (req, res) => {
  res.send("Hello World!!");
});

app.get("/user", async (req, res) => {
  const data = await prisma.user.findMany();
  const finalData = await data.map((record) => {
    // const decode = (record.password = CryptoJS.AES.decrypt(
    //   record.password.toString(),
    //   secretKey
    // ));
    // record.password = decode.toString(CryptoJS.enc.Utf8);
    return record;
  });
  res.json({
    message: "OK",
    data: finalData,
  });
});

// app.get("/user-raw", async (req, res) => {
//   const data = await prisma.$queryRaw`SELECT id, username as user FROM User`;
//   res.json({
//     message: "OK",
//     data: data,
//   });
// });

app.post("/user", async (req, res) => {
  console.log(req.body);
  // const response = await prisma.user.create(req.body);
  const encode = CryptoJS.AES.encrypt(req.body.password, secretKey);
  const response = await prisma.user.create({
    data: {
      username: req.body.username,
      password: encode.toString(),
    },
  });
  if (response) {
    res.json({
      message: "add data successfully",
      data: encode,
    });
  } else {
    res.json({
      message: "add data error",
    });
  }
});

app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const encode = CryptoJS.AES.encrypt(req.body.password, secretKey);
  const response = await prisma.user.update({
    where: { id: Number(id) },
    data: {
      username: req.body.username,
      password: encode.toString(),
    },
  });
  if (response) {
    res.json({ message: "User updated successfully", data: response });
  } else {
    res.json({ message: "error" });
  }
});

app.get("/user/search", async (req, res) => {
  console.log(req.query.q);
  // const data = await prisma.$queryRaw`select id,username from user where username like '${req.query.q}%' `
  res.json({
    message: "OK",
    // data
    sql: " select id,username from user where username like '${req.query.q}%' ",
  });
});

app.delete("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.json({ message: "error" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});