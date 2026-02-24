const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await prisma.adminUser.findUnique({
            where: { username },
        });

        const storedHash = user ? user.password : null;
        console.log('Entered password:', password);
        console.log('Stored hash:', storedHash);
        const isMatch = user ? await bcrypt.compare(password, user.password) : false;
        console.log('isMatch:', isMatch);

        if (user && isMatch) {
            if (!user.isActive) {
                return res.status(401).json({ message: 'User is inactive' });
            }
            res.json({
                id: user.id,
                username: user.username,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current admin profile
// @route   GET /api/admin/me
// @access  Private
const getMe = async (req, res) => {
    res.json({
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
    });
};

module.exports = { loginAdmin, getMe };
