const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Get all departments
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const departments = await Department.findAll({
            include: [
                {
                    model: Employee,
                    as: 'employees',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Employee,
                    as: 'manager',
                    attributes: ['id', 'firstName', 'lastName']
                }
            ]
        });
        res.render('departments/index', {
            title: 'Departments',
            departments,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error fetching departments');
        res.redirect('/dashboard');
    }
});

// Get department form
router.get('/create', isAuthenticated, hasRole(['admin', 'hr']), async (req, res) => {
    try {
        const employees = await Employee.findAll({
            where: { status: 'active' },
            attributes: ['id', 'firstName', 'lastName']
        });
        res.render('departments/create', {
            title: 'Add New Department',
            employees,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading form');
        res.redirect('/departments');
    }
});

// Create department
router.post('/', isAuthenticated, hasRole(['admin', 'hr']), async (req, res) => {
    try {
        await Department.create(req.body);
        req.flash('success_msg', 'Department added successfully');
        res.redirect('/departments');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error adding department');
        res.redirect('/departments/create');
    }
});

// Get department details
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id, {
            include: [
                {
                    model: Employee,
                    as: 'employees',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'designation']
                },
                {
                    model: Employee,
                    as: 'manager',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
                }
            ]
        });

        if (!department) {
            req.flash('error_msg', 'Department not found');
            return res.redirect('/departments');
        }

        res.render('departments/view', {
            title: 'Department Details',
            department,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error fetching department details');
        res.redirect('/departments');
    }
});

// Get edit form
router.get('/:id/edit', isAuthenticated, hasRole(['admin', 'hr']), async (req, res) => {
    try {
        const [department, employees] = await Promise.all([
            Department.findByPk(req.params.id),
            Employee.findAll({
                where: { status: 'active' },
                attributes: ['id', 'firstName', 'lastName']
            })
        ]);

        if (!department) {
            req.flash('error_msg', 'Department not found');
            return res.redirect('/departments');
        }

        res.render('departments/edit', {
            title: 'Edit Department',
            department,
            employees,
            user: req.session.user
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading form');
        res.redirect('/departments');
    }
});

// Update department
router.put('/:id', isAuthenticated, hasRole(['admin', 'hr']), async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);
        if (!department) {
            req.flash('error_msg', 'Department not found');
            return res.redirect('/departments');
        }

        await department.update(req.body);
        req.flash('success_msg', 'Department updated successfully');
        res.redirect('/departments');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error updating department');
        res.redirect(`/departments/${req.params.id}/edit`);
    }
});

// Delete department
router.delete('/:id', isAuthenticated, hasRole(['admin']), async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Check if department has employees
        const employeeCount = await Employee.count({
            where: { departmentId: department.id }
        });

        if (employeeCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete department with assigned employees'
            });
        }

        await department.destroy();
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting department' });
    }
});

module.exports = router; 