const sequelize = require('./database');
const User = require('../models/User');
const Department = require('../models/Department');
const Employee = require('../models/Employee');

async function initializeDatabase() {
    try {
        // Sync all models with database
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully');

        // Check if admin user exists
        const adminExists = await User.findOne({ where: { role: 'admin' } });
        if (!adminExists) {
            // Create default admin user
            await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin'
            });
            console.log('Default admin user created');
        }

        // Check if any departments exist to avoid adding mock data multiple times
        const departmentCount = await Department.count();
        if (departmentCount === 0) {
            // Add mock departments
            const hrDept = await Department.create({
                name: 'Human Resources',
                description: 'Manages employee relations and recruitment',
                location: 'Building A'
            });

            const itDept = await Department.create({
                name: 'Information Technology',
                description: 'Handles all IT infrastructure and support',
                location: 'Building B'
            });

            const salesDept = await Department.create({
                name: 'Sales',
                description: 'Manages sales operations and client relationships',
                location: 'Building C'
            });
            console.log('Mock departments created');

            // Add mock employees, assigning them to departments
            const adminUser = await User.findOne({ where: { username: 'admin' } }); // Get the admin user to potentially assign as a manager

            await Employee.bulkCreate([
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '111-111-1111',
                    departmentId: hrDept.id,
                    designation: 'HR Manager',
                    hireDate: new Date(),
                    salary: 70000.00,
                    status: 'active',
                    address: '123 Main St, Anytown',
                    emergencyContact: 'Jane Doe (555-123-4567)'
                },
                {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane.smith@example.com',
                    phone: '222-222-2222',
                    departmentId: itDept.id,
                    designation: 'Software Engineer',
                    hireDate: new Date(),
                    salary: 85000.00,
                    status: 'active',
                    address: '456 Oak Ave, Somewhere',
                    emergencyContact: 'John Smith (555-987-6543)'
                },
                {
                    firstName: 'Peter',
                    lastName: 'Jones',
                    email: 'peter.jones@example.com',
                    phone: '333-333-3333',
                    departmentId: salesDept.id,
                    designation: 'Sales Representative',
                    hireDate: new Date(),
                    salary: 60000.00,
                    status: 'active',
                    address: '789 Pine Ln, Nowhere',
                    emergencyContact: 'Mary Jones (555-555-5555)'
                }
            ]);
            console.log('Mock employees created');

            // Optional: Assign one of the employees as a department manager
            const hrManager = await Employee.findOne({ where: { email: 'john.doe@example.com' } });
            if (hrManager) {
                await hrDept.setManager(hrManager);
                console.log('Assigned HR Manager');
            }
        }

        console.log('Database initialization completed');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

module.exports = initializeDatabase; 