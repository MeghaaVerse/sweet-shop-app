import { Response } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';
import { InventoryLogRequest } from '../types/inventory';

export const logInventoryChange = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sweetId, type, quantity, reason }: InventoryLogRequest = req.body;

    // Check if sweet exists
    const sweet = await prisma.sweet.findUnique({
      where: { id: sweetId }
    });

    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    // Calculate new stock based on operation type
    let newStock = sweet.stock;
    
    if (type === 'RESTOCK') {
      newStock += quantity;
    } else if (type === 'SALE' || type === 'DAMAGE' || type === 'EXPIRED') {
      // Check if we have enough stock for reduction operations
      if (sweet.stock < quantity) {
        res.status(400).json({ 
          message: `Insufficient stock. Available: ${sweet.stock}, Requested: ${quantity}` 
        });
        return;
      }
      newStock -= quantity;
    }

    // Create inventory log and update sweet stock in a transaction
    const [inventoryLog] = await prisma.$transaction([
      prisma.inventoryLog.create({
        data: {
          sweetId,
          type,
          quantity,
          reason: reason || null
        },
        include: {
          sweet: {
            select: {
              id: true,
              name: true,
              category: true,
              stock: true
            }
          }
        }
      }),
      prisma.sweet.update({
        where: { id: sweetId },
        data: { stock: newStock }
      })
    ]);

    // Return the log with updated stock info
    const response = {
      ...inventoryLog,
      sweet: {
        ...inventoryLog.sweet,
        currentStock: newStock
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Log inventory change error:', error);
    res.status(500).json({ message: 'Internal server error while logging inventory change' });
  }
};

export const getInventoryLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      sweetId,
      type,
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (sweetId) {
      where.sweetId = sweetId.toString();
    }

    if (type) {
      where.type = type.toString();
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate.toString());
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate.toString());
      }
    }

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNum,
        include: {
          sweet: {
            select: {
              id: true,
              name: true,
              category: true,
              stock: true
            }
          }
        }
      }),
      prisma.inventoryLog.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      logs,
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
    console.error('Get inventory logs error:', error);
    res.status(500).json({ message: 'Internal server error while fetching inventory logs' });
  }
};

export const getInventoryReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lowStockThreshold = 10 } = req.query;
    const threshold = parseInt(lowStockThreshold.toString());

    // Get total sweets and value
    const sweets = await prisma.sweet.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        stock: true
      }
    });

    const totalSweets = sweets.length;
    const totalValue = sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.stock), 0);

    // Get low stock items
    const lowStockItems = sweets
      .filter(sweet => sweet.stock <= threshold)
      .map(sweet => ({
        id: sweet.id,
        name: sweet.name,
        category: sweet.category,
        currentStock: sweet.stock,
        price: sweet.price
      }));

    // Get recent inventory activities (last 20)
    const recentActivities = await prisma.inventoryLog.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 20,
      include: {
        sweet: {
          select: {
            id: true,
            name: true,
            category: true,
            stock: true
          }
        }
      }
    });

    // Get category breakdown
    const categoryStats = await prisma.sweet.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: {
        category: true
      },
      _avg: {
        stock: true,
        price: true
      },
      _sum: {
        stock: true
      }
    });

    const categoryBreakdown = categoryStats.map(stat => ({
      category: stat.category,
      totalItems: stat._count.category,
      totalValue: Math.round(((stat._avg.price || 0) * (stat._sum.stock || 0)) * 100) / 100,
      averageStock: Math.round((stat._avg.stock || 0) * 100) / 100
    }));

    const report = {
      totalSweets,
      totalValue: Math.round(totalValue * 100) / 100,
      lowStockItems,
      recentActivities,
      categoryBreakdown
    };

    res.status(200).json(report);
  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({ message: 'Internal server error while generating inventory report' });
  }
};

export const getStockAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { threshold = 10 } = req.query;
    const thresholdNum = parseInt(threshold.toString());

    const sweets = await prisma.sweet.findMany({
      where: { 
        isActive: true,
        stock: {
          lte: thresholdNum
        }
      },
      select: {
        id: true,
        name: true,
        stock: true
      },
      orderBy: {
        stock: 'asc'
      }
    });

    const alerts = sweets.map(sweet => {
      let severity: 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
      
      if (sweet.stock === 0) {
        severity = 'OUT_OF_STOCK';
      } else if (sweet.stock <= thresholdNum * 0.3) {
        severity = 'CRITICAL';
      } else {
        severity = 'LOW';
      }

      return {
        sweetId: sweet.id,
        sweetName: sweet.name,
        currentStock: sweet.stock,
        threshold: thresholdNum,
        severity
      };
    });

    res.status(200).json({
      alerts,
      total: alerts.length,
      summary: {
        outOfStock: alerts.filter(a => a.severity === 'OUT_OF_STOCK').length,
        critical: alerts.filter(a => a.severity === 'CRITICAL').length,
        low: alerts.filter(a => a.severity === 'LOW').length
      }