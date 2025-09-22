"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegister = exports.validatePassword = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    return password.length >= 6;
};
exports.validatePassword = validatePassword;
const validateRegister = (req, res, next) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({
            message: 'Email, password, and name are required'
        });
    }
    if (!(0, exports.validateEmail)(email)) {
        return res.status(400).json({
            message: 'Please provide a valid email address'
        });
    }
    if (!(0, exports.validatePassword)(password)) {
        return res.status(400).json({
            message: 'Password must be at least 6 characters long'
        });
    }
    if (name.trim().length < 2) {
        return res.status(400).json({
            message: 'Name must be at least 2 characters long'
        });
    }
    next();
};
exports.validateRegister = validateRegister;
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: 'Email and password are required'
        });
    }
    if (!(0, exports.validateEmail)(email)) {
        return res.status(400).json({
            message: 'Please provide a valid email address'
        });
    }
    next();
};
exports.validateLogin = validateLogin;
//# sourceMappingURL=validation.js.map