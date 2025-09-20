import { Request, Response, NextFunction } from 'express';

export const validateCreateSweet = (req: Request, res: Response, next: NextFunction) => {
  const { name, price, category,description, imageUrl, stock } = req.body;

    // Debug log
  console.log('Validation input:', { name, price, category, description, imageUrl, stock });

  // Required fields
  if (!name || !price || !category) {
    return res.status(400).json({
      message: 'Name, price, and category are required',
      received: { name: !!name, price: !!price, category: !!category }
    });
  }

  // Validate name
  if (typeof name !== 'string' || name.trim().length < 1) {
    return res.status(400).json({
      message: 'Name must be a non-empty string'
    });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({
      message: 'Name must be less than 100 characters'
    });
  }

  // Validate price
   
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({
      message: 'Price must be a positive number'
    });
  }

  if (price > 10000) {
    return res.status(400).json({
      message: 'Price cannot exceed $10,000'
    });
  }

  // Validate category
  if (typeof category !== 'string' || category.trim().length < 1) {
    return res.status(400).json({
      message: 'Category must be a non-empty string'
    });
  }

  // Validate optional fields


  if (description !== undefined  && description !== null && description !== '') {
    if (typeof description !== 'string') {
      return res.status(400).json({
        message: 'Description must be a string'
      });
    }
    if (description.length > 1000) {
      return res.status(400).json({
        message: 'Description must be less than 1000 characters'
      });
    }
  }

  if (imageUrl !== undefined) {
    if (typeof imageUrl !== 'string') {
      return res.status(400).json({
        message: 'Image URL must be a string'
      });
    }
    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      return res.status(400).json({
        message: 'Image URL must be a valid URL'
      });
    }
  }

  if (stock !== undefined) {
    if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
      return res.status(400).json({
        message: 'Stock must be a non-negative integer'
      });
    }
  }

  next();
};

export const validateUpdateSweet = (req: Request, res: Response, next: NextFunction) => {
  const { name, price, category, description, imageUrl, stock, isActive } = req.body;

  // At least one field must be provided for update
  if (!name && !price && !category && !description && !imageUrl && stock === undefined && isActive === undefined) {
    return res.status(400).json({
      message: 'At least one field must be provided for update'
    });
  }

  // Validate name if provided
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 1) {
      return res.status(400).json({
        message: 'Name must be a non-empty string'
      });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({
        message: 'Name must be less than 100 characters'
      });
    }
  }

  // Validate price if provided
  if (price !== undefined) {
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        message: 'Price must be a positive number'
      });
    }
    if (price > 10000) {
      return res.status(400).json({
        message: 'Price cannot exceed $10,000'
      });
    }
  }

  // Validate category if provided
  if (category !== undefined) {
    if (typeof category !== 'string' || category.trim().length < 1) {
      return res.status(400).json({
        message: 'Category must be a non-empty string'
      });
    }
  }

  // Validate description if provided
  if (description !== undefined) {
    if (typeof description !== 'string') {
      return res.status(400).json({
        message: 'Description must be a string'
      });
    }
    if (description.length > 1000) {
      return res.status(400).json({
        message: 'Description must be less than 1000 characters'
      });
    }
  }

  // Validate imageUrl if provided
  if (imageUrl !== undefined) {
    if (typeof imageUrl !== 'string') {
      return res.status(400).json({
        message: 'Image URL must be a string'
      });
    }
    if (imageUrl.trim() !== '') {
      try {
        new URL(imageUrl);
      } catch {
        return res.status(400).json({
          message: 'Image URL must be a valid URL'
        });
      }
    }
  }

  // Validate stock if provided
  if (stock !== undefined) {
    if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
      return res.status(400).json({
        message: 'Stock must be a non-negative integer'
      });
    }
  }

  // Validate isActive if provided
  if (isActive !== undefined) {
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'isActive must be a boolean'
      });
    }
  }

  next();
};

export const validateSweetQuery = (req: Request, res: Response, next: NextFunction) => {
  const { page, limit, sortBy, sortOrder } = req.query;

  // Validate page
  if (page !== undefined) {
    const pageNum = parseInt(page as string);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        message: 'Page must be a positive integer'
      });
    }
  }

  // Validate limit
  if (limit !== undefined) {
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        message: 'Limit must be between 1 and 100'
      });
    }
  }

  // Validate sortBy
  if (sortBy !== undefined) {
    const validSortFields = ['name', 'price', 'stock', 'createdAt'];
    if (!validSortFields.includes(sortBy as string)) {
      return res.status(400).json({
        message: `sortBy must be one of: ${validSortFields.join(', ')}`
      });
    }
  }

  // Validate sortOrder
  if (sortOrder !== undefined) {
    const validSortOrders = ['asc', 'desc'];
    if (!validSortOrders.includes(sortOrder as string)) {
      return res.status(400).json({
        message: 'sortOrder must be either "asc" or "desc"'
      });
    }
  }

  next();
};