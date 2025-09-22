"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSweetCategories = exports.deleteSweet = exports.updateSweet = exports.getSweetById = exports.getAllSweets = exports.createSweet = void 0;
const app_1 = require("../app");
const createSweet = async (req, res) => {
    console.log('=== CREATE SWEET DEBUG START ===');
    console.log('Auth user:', req.user);
    console.log('Request headers auth:', req.headers.authorization);
    console.log('Request body:', req.body);
    try {
        if (!req.user || !req.user.userId) {
            console.log('No authenticated user found');
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const userId = req.user.userId;
        const { name, description, price, category, imageUrl, stock } = req.body;
        console.log('About to create sweet with userId:', userId);
        console.log('Sweet data:', { name, description, price, category, imageUrl, stock });
        // Test database connection first
        console.log('Testing database connection...');
        await app_1.prisma.$connect();
        console.log('Database connected successfully');
        const sweet = await app_1.prisma.sweet.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                price: typeof price === 'string' ? parseFloat(price) : price,
                category: category.trim(),
                imageUrl: imageUrl?.trim() || null,
                stock: stock ? (typeof stock === 'string' ? parseInt(stock) : stock) : 0,
                createdById: userId
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        console.log('Sweet created successfully:', sweet);
        console.log('=== CREATE SWEET DEBUG END SUCCESS ===');
        res.status(201).json(sweet);
    }
    catch (error) {
        console.log('=== CREATE SWEET DEBUG END ERROR ===');
        console.error('Full error object:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error meta:', error.meta);
        // Send specific error message
        if (error.code === 'P1001') {
            res.status(500).json({ message: 'Database connection failed' });
        }
        if (error.code === 'P2002') {
            res.status(400).json({ message: 'Sweet with this name already exists' });
        }
        res.status(500).json({
            message: 'Internal server error while creating sweet',
            error: error.message,
            code: error.code
        });
    }
};
exports.createSweet = createSweet;
const getAllSweets = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const pageNum = parseInt(page.toString());
        const limitNum = parseInt(limit.toString());
        const skip = (pageNum - 1) * limitNum;
        // Build where clause
        const where = {};
        if (category) {
            where.category = {
                equals: category.toString(),
                mode: 'insensitive'
            };
        }
        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search.toString(),
                        mode: 'insensitive'
                    }
                },
                {
                    description: {
                        contains: search.toString(),
                        mode: 'insensitive'
                    }
                }
            ];
        }
        if (isActive !== undefined) {
            where.isActive = isActive.toString() === 'true';
        }
        // Build orderBy clause
        const orderBy = {};
        orderBy[sortBy] = sortOrder.toString();
        const [sweets, total] = await Promise.all([
            app_1.prisma.sweet.findMany({
                where,
                orderBy,
                skip,
                take: limitNum,
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }),
            app_1.prisma.sweet.count({ where })
        ]);
        const totalPages = Math.ceil(total / limitNum);
        res.status(200).json({
            sweets,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            }
        });
    }
    catch (error) {
        console.error('Get all sweets error:', error);
        res.status(500).json({ message: 'Internal server error while fetching sweets' });
    }
};
exports.getAllSweets = getAllSweets;
const getSweetById = async (req, res) => {
    try {
        const { id } = req.params;
        const sweet = await app_1.prisma.sweet.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                inventoryLogs: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10 // Last 10 inventory changes
                }
            }
        });
        if (!sweet) {
            res.status(404).json({ message: 'Sweet not found' });
            return;
        }
        res.status(200).json(sweet);
    }
    catch (error) {
        console.error('Get sweet by ID error:', error);
        res.status(500).json({ message: 'Internal server error while fetching sweet' });
    }
};
exports.getSweetById = getSweetById;
const updateSweet = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const updateData = req.body;
        // Check if sweet exists and user owns it
        const existingSweet = await app_1.prisma.sweet.findUnique({
            where: { id }
        });
        if (!existingSweet) {
            res.status(404).json({ message: 'Sweet not found' });
            return;
        }
        // Allow admin to update any sweet, or owner to update their own
        if (req.user.role !== 'ADMIN' && existingSweet.createdById !== userId) {
            res.status(403).json({ message: 'You can only update your own sweets' });
            return;
        }
        // Build update data
        const dataToUpdate = {};
        if (updateData.name !== undefined) {
            dataToUpdate.name = updateData.name.trim();
        }
        if (updateData.description !== undefined) {
            dataToUpdate.description = updateData.description?.trim() || null;
        }
        if (updateData.price !== undefined) {
            dataToUpdate.price = updateData.price;
        }
        if (updateData.category !== undefined) {
            dataToUpdate.category = updateData.category.trim();
        }
        if (updateData.imageUrl !== undefined) {
            dataToUpdate.imageUrl = updateData.imageUrl?.trim() || null;
        }
        if (updateData.stock !== undefined) {
            dataToUpdate.stock = updateData.stock;
        }
        if (updateData.isActive !== undefined) {
            dataToUpdate.isActive = updateData.isActive;
        }
        const updatedSweet = await app_1.prisma.sweet.update({
            where: { id },
            data: dataToUpdate,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.status(200).json(updatedSweet);
    }
    catch (error) {
        console.error('Update sweet error:', error);
        res.status(500).json({ message: 'Internal server error while updating sweet' });
    }
};
exports.updateSweet = updateSweet;
const deleteSweet = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        // Check if sweet exists and user owns it
        const existingSweet = await app_1.prisma.sweet.findUnique({
            where: { id }
        });
        if (!existingSweet) {
            res.status(404).json({ message: 'Sweet not found' });
            return;
        }
        // Allow admin to delete any sweet, or owner to delete their own
        if (req.user.role !== 'ADMIN' && existingSweet.createdById !== userId) {
            res.status(403).json({ message: 'You can only delete your own sweets' });
            return;
        }
        // Soft delete by setting isActive to false
        await app_1.prisma.sweet.update({
            where: { id },
            data: { isActive: false }
        });
        res.status(200).json({
            message: 'Sweet deleted successfully',
            id
        });
    }
    catch (error) {
        console.error('Delete sweet error:', error);
        res.status(500).json({ message: 'Internal server error while deleting sweet' });
    }
};
exports.deleteSweet = deleteSweet;
const getSweetCategories = async (req, res) => {
    try {
        const categories = await app_1.prisma.sweet.groupBy({
            by: ['category'],
            where: {
                isActive: true
            },
            _count: {
                category: true
            },
            orderBy: {
                category: 'asc'
            }
        });
        const formattedCategories = categories.map(cat => ({
            name: cat.category,
            count: cat._count.category
        }));
        res.status(200).json({
            categories: formattedCategories,
            total: categories.length
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Internal server error while fetching categories' });
    }
};
exports.getSweetCategories = getSweetCategories;
//# sourceMappingURL=sweetController.js.map