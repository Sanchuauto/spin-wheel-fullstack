const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all admin users
// @route   GET /api/admin/users
// @access  Private/SuperAdmin
const getUsers = async (req, res) => {
    try {
        const users = await prisma.adminUser.findMany({
            select: { id: true, username: true, role: true, isActive: true, createdAt: true },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new admin user
// @route   POST /api/admin/users
// @access  Private/SuperAdmin
const registerUser = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const userExists = await prisma.adminUser.findUnique({
            where: { username },
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.adminUser.create({
            data: {
                username,
                password: hashedPassword,
                role,
            },
        });

        res.status(201).json({
            id: user.id,
            username: user.username,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Deactivate user
// @route   PATCH /api/admin/users/:id/deactivate
// @access  Private/SuperAdmin
const deactivateUser = async (req, res) => {
    try {
        const user = await prisma.adminUser.update({
            where: { id: req.params.id },
            data: { isActive: false },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUsers, registerUser, deactivateUser };
