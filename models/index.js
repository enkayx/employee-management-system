const Department = require('./Department');
const Employee = require('./Employee');

// Define relationships
Department.hasMany(Employee, {
    foreignKey: 'departmentId',
    as: 'employees'
});

Employee.belongsTo(Department, {
    foreignKey: 'departmentId',
    as: 'department'
});

Department.belongsTo(Employee, {
    foreignKey: 'managerId',
    as: 'manager'
});

module.exports = {
    Department,
    Employee
}; 