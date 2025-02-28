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
    const data = await prisma.user.findMany();
    const finalData = data.map(record => {
        delete record.password;
        return record;
    });
    res.json({ message: 'ok', data: finalData });
});

// Read user by ID
app.get('/user/:id', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(req.params.id) },
        select: { id: true, username: true } // ไม่ดึง password
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: 'ok', data: user });
});

// Create new user
app.post('/user', async (req, res) => {
    const { username, password } = req.body;
    const response = await prisma.user.create({
        data: { username, password }
    });
    res.json({ message: 'User created successfully', data: response });
});


// Update user
app.put('/user/:id', async (req, res) => {
    const { username, password } = req.body;

    try {
        // ตรวจสอบว่าผู้ใช้มีอยู่จริงหรือไม่
        const existingUser = await prisma.user.findUnique({
            where: { id: Number(req.params.id) },
        });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // แสดงข้อมูลผู้ใช้ก่อนการอัพเดต
        console.log('Existing User:', existingUser);

        // หากผู้ใช้มีอยู่แล้ว ให้ดำเนินการอัพเดต
        const updatedUser = await prisma.user.update({
            where: { id: Number(req.params.id) },
            data: { username, password },
        });

        // แสดงข้อมูลผู้ใช้หลังการอัพเดต
        console.log('Updated User:', updatedUser);

        res.json({ message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        console.error('Error:', error); // แสดงข้อผิดพลาดหากมี
        res.status(400).json({ message: 'Error updating user', error: error.message });
    }
});



// Delete user
app.delete('/user/:id', async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting user', error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
