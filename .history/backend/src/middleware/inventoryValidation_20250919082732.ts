import { Request, Response, NextFunction } from 'express';

const validInventoryTypes = ['RESTOCK', 'SALE', 'DAMAGE', 'EXPIRED'];

export const validateInventoryLog = (req: Request, res: Response, next: NextFunction) => {
  const { sweetId, type, quantity, reason } = req.body;

  // Required fields
  if (!sweetId || !type || quantity === undefined) {
    return res.status(400).json({
      message: 'sweetId, type, and quantity are required'
    });
  }

  // Validate sweetId
  if (typeof sweetId !== 'string' || sweetId.trim().length === 0) {
    return res.status(400).json({
      message: 'sweetId must be a non-empty string'
    });
  }

  // Validate type
  if (!validInventoryTypes.includes(type)) {
    return res.status(400).json({
      message: `type must be one of: ${validInventoryTypes.join(', ')}`
    });
  }

  // Validate quantity
  if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
    return res.status(400).json({
      message: 'quantity must be a positive integer'
    });
  }

  if (quantity > 10000) {
    return res.status(400).json({
      message: 'quantity cannot exceed 10,000'
    });
  }

  // Validate reason (optional)
  if (reason !== undefined) {
    if (typeof reason !== 'string') {
      return res.status(400).json({
        message: 'reason must be a string'
      });
    }
    if (reason.length > 500) {
      return res.status(400).json({
        message: 'reason must be less than 500 characters'
      });
    }
  }

  next();
};

export const validateInventoryQuery = (req: Request, res: Response, next: NextFunction) => {
  const { page, limit, type, startDate, endDate, lowStockThreshold, threshold } = req.query;

  // Validate page
  if (page !== undefined) {
    const pageNum = parseInt(page as string);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        message: 'page must be a positive integer'
      });
    }
  }

  // Validate limit
  if (limit !== undefined) {
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        message: 'limit must be between 1 and 100'
      });
    }
  }

  // Validate type
  if (type !== undefined && !validInventoryTypes.includes(type as string)) {
    return res.status(400).json({
      message: `type must be one of: ${validInventoryTypes.join(', ')}`
    });
  }

  // Validate dates
  if (startDate !== undefined) {
    const date = new Date(startDate as string);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        message: 'startDate must be a valid date'
      });
    }
  }

  if (endDate !== undefined) {
    const date = new Date(endDate as string);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        message: 'endDate must be a valid date'
      });
    }
  }

  // Validate thresholds
  if (lowStockThreshold !== undefined) {
    const threshold = parseInt(lowStockThreshold as string);
    if (isNaN(threshold) || threshold < 0) {
      return res.status(400).json({
        message: 'lowStockThreshold must be a non-negative integer'
      });
    }
  }

  if (threshold !== undefined) {
    const thresholdNum = parseInt(threshold as string);
    if (isNaN(thresholdNum) || thresholdNum < 0) {
      return res.status(400).json({
        message: 'threshold must be a non-negative integer'
      });
    }
  }

  next();
};