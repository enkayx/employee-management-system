# Employee Management System

A complete Employee Management System built with Node.js, Express.js, and MySQL.

## Features

- User Authentication & Authorization
- Role-Based Access Control (RBAC)
- Employee Management
- Department Management
- Attendance Tracking
- Salary Management
- Reports Generation
- Dark Mode Support

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: HTML + Bootstrap + DataTables
- **Database**: MySQL
- **View Engine**: EJS
- **Authentication**: JWT + Express Sessions
- **Access Control**: Role-Based Access Control (RBAC)

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd employee-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:
   ```
   PORT=3000
   NODE_ENV=development
   SESSION_SECRET=your-super-secret-key
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your-password
   DB_NAME=employee_management
   JWT_SECRET=your-jwt-secret
   ```

4. Create the database:
   ```sql
   CREATE DATABASE employee_management;
   ```

5. Run the application:
   ```bash
   npm run dev
   ```

## Project Structure

```
employee-system/
├── controllers/     # Route controllers
├── routes/         # Express routes
├── models/         # Database models
├── views/          # EJS templates
├── public/         # Static files
├── middleware/     # Custom middleware
├── config/         # Configuration files
└── app.js         # Application entry point
```

## License

MIT 