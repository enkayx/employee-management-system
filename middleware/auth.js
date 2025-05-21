const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error_msg', 'Please log in to access this resource');
    res.redirect('/login');
};

// Middleware to check user role
exports.hasRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            req.flash('error_msg', 'Please log in to access this resource');
            return res.redirect('/login');
        }

        if (roles.includes(req.session.user.role)) {
            return next();
        }

        req.flash('error_msg', 'You do not have permission to access this resource');
        res.redirect('/dashboard');
    };
};

// JWT verification middleware
exports.verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) {
        return res.status(403).json({
            success: false,
            message: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
}; 