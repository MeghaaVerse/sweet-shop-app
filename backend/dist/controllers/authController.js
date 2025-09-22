"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const app_1 = require("../app");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        // Check if user already exists
        const existingUser = await app_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(409).json({ message: 'User with this email already exists' });
            return;
        }
        // Hash password
        const hashedPassword = await (0, password_1.hashPassword)(password);
        // Create user
        const user = await app_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'USER'
            }
        });
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role
        });
        // Prepare response (exclude password)
        const response = {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await app_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Check password
        const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role
        });
        // Prepare response (exclude password)
        const response = {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error during login' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        // This will be used later with authentication middleware
        const userId = req.user?.userId;
        const user = await app_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map