const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

// Login page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/login', { title: 'Login' });
});

// Login process
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({ where: { username } });
        if (!user) {
            req.flash('error_msg', 'Invalid username or password');
            return res.redirect('/auth/login');
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'Invalid username or password');
            return res.redirect('/auth/login');
        }

        // Set session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error during login');
        res.redirect('/auth/login');
    }
});

// Register page
router.get('/register', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/register', { title: 'Register' });
});

// Register process
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Check if passwords match
        if (password !== confirmPassword) {
            req.flash('error_msg', 'Passwords do not match');
            return res.redirect('/auth/register');
        }

        // Check if username exists
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            req.flash('error_msg', 'Username already taken');
            return res.redirect('/auth/register');
        }

        // Check if email exists
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            req.flash('error_msg', 'Email already registered');
            return res.redirect('/auth/register');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'employee' // Default role
        });

        req.flash('success_msg', 'Registration successful. Please login.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error during registration');
        res.redirect('/auth/register');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router; 