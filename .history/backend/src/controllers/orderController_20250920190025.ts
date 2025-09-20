import { Response } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.userId;
    const { items } = req.body; // [{ sweetId, quantity }]

    if (!items || items.length === 0) {
      res.status(400).json({ message: 'Order items are required' });
      return;
    }

    let totalAmount = 0;
    const orderItemsData = [];

    // Process each item and calculate total
    for (const item of items) {
      const sweet = await prisma.sweet.findUnique({
        where: { id: item.sweetId }
      });

      if (!sweet) {
        res.status(404).json({ message: `Sweet not found: ${item.sweetId}` });
        return;
      }

      if (sweet.stock < item.quantity) {
        res.status(400).json({ 
          message: `Insufficient stock for ${sweet.name}. Available: ${sweet.stock}` 
        });
        return;
      }

      const itemTotal = sweet.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        sweetId: item.sweetId,
        quantity: item.quantity,
        price: sweet.price
      });
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          customerId,
          totalAmount,
          status: 'COMPLETED',
          orderItems: {
            create: orderItemsData
          }
        },
        include: {
          orderItems: {
            include: {
              sweet: true
            }
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Update stock levels and create inventory logs
      for (const item of items) {
        await tx.sweet.update({
          where: { id: item.sweetId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        // Log the sale in inventory
        await tx.inventoryLog.create({
          data: {
            sweetId: item.sweetId,
            type: 'SALE',
            quantity: item.quantity,
            reason: `Customer purchase - Order #${newOrder.id}`
          }
        });
      }

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error while creating order' });
  }
};

export const getCustomerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user!.userId;

    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        orderItems: {
          include: {
            sweet: {
              select: {
                id: true,
                name: true,
                category: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Internal server error while fetching orders' });
  }
};

export const purchaseSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sweetId, quantity = 1 } = req.body;
    const customerId = req.user!.userId;

    const sweet = await prisma.sweet.findUnique({
      where: { id: sweetId }
    });

    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    if (!sweet.isActive) {
      res.status(400).json({ message: 'Sweet is not available for purchase' });
      return;
    }

    if (sweet.stock < quantity) {
      res.status(400).json({ 
        message: `Insufficient stock. Available: ${sweet.stock}` 
      });
      return;
    }

    const totalAmount = sweet.price * quantity;

    // Create order with single item
    const order = await createOrder(req, res);
    
  } catch (error) {
    console.error('Purchase sweet error:', error);
    res.status(500).json({ message: 'Internal server error while purchasing sweet' });
  }
};