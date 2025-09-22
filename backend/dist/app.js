"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const client_1 = require("@prisma/client");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const sweetRoutes_1 = __importDefault(require("./routes/sweetRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
// Initialize Prisma client
exports.prisma = new client_1.PrismaClient();
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? true // Allow all origins in production for now
        : true,
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Sweet Shop API is running!',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            api: '/api',
            auth: '/api/auth',
            sweets: '/api/sweets',
            inventory: '/api/inventory'
        }
    });
});
// Health check endpoint - MUST be before other routes
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Sweet Shop API is running!',
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 3001
    });
});
// API routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/sweets', sweetRoutes_1.default);
app.use('/api/inventory', inventoryRoutes_1.default);
// Catch-all for undefined routes
app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});
// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🍭 Sweet Shop API running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map