const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
const prisma = new PrismaClient();

app.get('/', (req, res) => {
    res.send('Hello world');
});

// Read all users
app.get('/user', async (req, res) => {
    const users = await prisma.user.findMany();
    users.forEach(user => delete user.password); // ลบ password ก่อนส่งกลับ
    res.json({ message: 'ok', data: users });
});

// Read user by ID
app.get('/user/:id', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: +req.params.id }, // ใช้ + เพื่อแปลงเป็น number
        select: { id: true, username: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: 'ok', data: user });
});

// Create new user
app.post('/user', async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma.user.create({ data: { username, password } });
    res.json({ message: 'User created successfully', data: user });
});

// Update user
app.put('/user/:id', async (req, res) => {
    const { username, password } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: +req.params.id },
            data: { username, password },
        });
        res.json({ message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        res.status(400).json({ message: 'Error updating user', error: error.message });
    }
});

// Delete user
app.delete('/user/:id', async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: +req.params.id } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting user', error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
