const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const { isAuthenticated, hasRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Get all employees
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const employees = await Employee.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.render('employees/index', { 
            title: 'Employees',
            employees,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error fetching employees');
        res.redirect('/dashboard');
    }
});

// Get employee form
router.get('/create', isAuthenticated, hasRole(['admin', 'hr']), async (req, res) => {
    try {
        const departments = await Department.findAll();
        res.render('employees/create', {
            title: 'Add New Employee',
            departments,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading employee form');
        res.redirect('/employees');
    }
});

// Create employee
router.post('/', isAuthenticated, hasRole(['admin', 'hr']), upload.single('profilePicture'), async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            departmentId,
            designation,
            hireDate,
            salary,
            address,
            emergencyContact
        } = req.body;

        await Employee.create({
            firstName,
            lastName,
            email,
            phone,
            departmentId: parseInt(departmentId),
            designation,
            hireDate,
            salary,
            address,
            emergencyContact,
            profilePicture: req.file ? req.file.filename : null
        });
        req.flash('success_msg', 'Employee added successfully');
        res.redirect('/employees');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error adding employee');
        res.redirect('/employees/create');
    }
});

// Get employee details
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) {
            req.flash('error_msg', 'Employee not found');
            return res.redirect('/employees');
        }
        res.render('employees/view', {
            title: 'Employee Details',
            employee,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error fetching employee details');
        res.redirect('/employees');
    }
});

// Get edit form
router.get('/:id/edit', isAuthenticated, hasRole(['admin', 'hr']), async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) {
            req.flash('error_msg', 'Employee not found');
            return res.redirect('/employees');
        }
        res.render('employees/edit', {
            title: 'Edit Employee',
            employee,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error fetching employee details');
        res.redirect('/employees');
    }
});

// Update employee
router.put('/:id', isAuthenticated, hasRole(['admin', 'hr']), async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) {
            req.flash('error_msg', 'Employee not found');
            return res.redirect('/employees');
        }
        await employee.update(req.body);
        req.flash('success_msg', 'Employee updated successfully');
        res.redirect('/employees');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error updating employee');
        res.redirect(`/employees/${req.params.id}/edit`);
    }
});

// Delete employee
router.delete('/:id', isAuthenticated, hasRole(['admin']), async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        await employee.destroy();
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting employee' });
    }
});

module.exports = router; 