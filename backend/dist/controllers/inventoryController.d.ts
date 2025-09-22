import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const logInventoryChange: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getInventoryLogs: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getInventoryReport: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getStockAlerts: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=inventoryController.d.ts.map