import { Request, Response, NextFunction } from 'express';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ 
      message: 'Email, password, and name are required' 
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ 
      message: 'Please provide a valid email address' 
    });
  }

  if (!validatePassword(password)) {
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

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email and password are required' 
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ 
      message: 'Please provide a valid email address' 
    });
  }

  next();
};