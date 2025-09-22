import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const createSweet: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllSweets: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSweetById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateSweet: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteSweet: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSweetCategories: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=sweetController.d.ts.map