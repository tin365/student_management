"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_js_1 = __importDefault(require("./config/db.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Database Connection
(0, db_js_1.default)();
// Route Imports
const expenseRoutes_js_1 = __importDefault(require("./routes/expenseRoutes.js"));
const goalRoutes_js_1 = __importDefault(require("./routes/goalRoutes.js"));
const studySessionRoutes_js_1 = __importDefault(require("./routes/studySessionRoutes.js"));
const scheduleRoutes_js_1 = __importDefault(require("./routes/scheduleRoutes.js"));
// API Routes
app.use('/api/expenses', expenseRoutes_js_1.default);
app.use('/api/goals', goalRoutes_js_1.default);
app.use('/api/study-sessions', studySessionRoutes_js_1.default);
app.use('/api/schedules', scheduleRoutes_js_1.default);
// Basic Root Route
app.get('/', (req, res) => {
    res.send('Khai API is running...');
});
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
