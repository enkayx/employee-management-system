const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            req.flash('error_msg', 'Invalid credentials');
            return res.redirect('/login');
        }

        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            req.flash('error_msg', 'Invalid credentials');
            return res.redirect('/login');
        }

        // Create session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred');
        res.redirect('/login');
    }
});

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [sequelize.Op.or]: [{ email }, { username }]
            }
        });

        if (existingUser) {
            req.flash('error_msg', 'User already exists');
            return res.redirect('/register');
        }

        // Create new user
        await User.create({
            username,
            email,
            password,
            role: role || 'employee'
        });

        req.flash('success_msg', 'Registration successful. Please login.');
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred during registration');
        res.redirect('/register');
    }
});

// Logout route
router.get('/logout', isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

module.exports = router; 