import { Request, Response } from 'express';
import { prisma } from '../app';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export const customerRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, address } = req.body;

    const existingCustomer = await prisma.customer.findUnique({
      where: { email }
    });

    if (existingCustomer) {
      res.status(409).json({ message: 'Customer with this email already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const customer = await prisma.customer.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        address
      }
    });

    const token = generateToken({
      userId: customer.id,
      email: customer.email,
      role: 'CUSTOMER'
    });

    res.status(201).json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        role: 'CUSTOMER'
      },
      token
    });
  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
};

export const customerLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const customer = await prisma.customer.findUnique({
      where: { email }
    });

    if (!customer) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await comparePassword(password, customer.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken({
      userId: customer.id,
      email: customer.email,
      role: 'CUSTOMER'
    });

    res.status(200).json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        role: 'CUSTOMER'
      },
      token
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
};