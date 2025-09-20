import { Response } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';
import { CreateSweetRequest, UpdateSweetRequest, SweetQuery, SweetResponse } from '../types/sweet';

export const createSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {

    console.log('Auth user:', req.user);
    console.log('Request headers:', req.headers.authorization);

     if (!req.user || !req.user.userId) {
      console.log('No authenticated user found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user!.userId;
    const { name, description, price, category, imageUrl, stock }: CreateSweetRequest = req.body;

    console.log('Creating sweet with data:', { name, description, price, category, imageUrl, stock, userId });

    const sweet = await prisma.sweet.create({
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
    res.status(201).json(sweet);
  } catch (error) {
    console.error('Create sweet error:', error);
    res.status(500).json({ message: 'Internal server error while creating sweet' });
  }
};

export const getAllSweets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    }: SweetQuery = req.query as any;

    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

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
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder.toString();

    const [sweets, total] = await Promise.all([
      prisma.sweet.findMany({
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
      prisma.sweet.count({ where })
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
  } catch (error) {
    console.error('Get all sweets error:', error);
    res.status(500).json({ message: 'Internal server error while fetching sweets' });
  }
};

export const getSweetById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const sweet = await prisma.sweet.findUnique({
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
  } catch (error) {
    console.error('Get sweet by ID error:', error);
    res.status(500).json({ message: 'Internal server error while fetching sweet' });
  }
};

export const updateSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const updateData: UpdateSweetRequest = req.body;

    // Check if sweet exists and user owns it
    const existingSweet = await prisma.sweet.findUnique({
      where: { id }
    });

    if (!existingSweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    // Allow admin to update any sweet, or owner to update their own
    if (req.user!.role !== 'ADMIN' && existingSweet.createdById !== userId) {
      res.status(403).json({ message: 'You can only update your own sweets' });
      return;
    }

    // Build update data
    const dataToUpdate: any = {};
    
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

    const updatedSweet = await prisma.sweet.update({
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
  } catch (error) {
    console.error('Update sweet error:', error);
    res.status(500).json({ message: 'Internal server error while updating sweet' });
  }
};

export const deleteSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if sweet exists and user owns it
    const existingSweet = await prisma.sweet.findUnique({
      where: { id }
    });

    if (!existingSweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    // Allow admin to delete any sweet, or owner to delete their own
    if (req.user!.role !== 'ADMIN' && existingSweet.createdById !== userId) {
      res.status(403).json({ message: 'You can only delete your own sweets' });
      return;
    }

    // Soft delete by setting isActive to false
    await prisma.sweet.update({
      where: { id },
      data: { isActive: false }
    });

    res.status(200).json({ 
      message: 'Sweet deleted successfully',
      id 
    });
  } catch (error) {
    console.error('Delete sweet error:', error);
    res.status(500).json({ message: 'Internal server error while deleting sweet' });
  }
};

export const getSweetCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.sweet.groupBy({
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
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error while fetching categories' });
  }
};