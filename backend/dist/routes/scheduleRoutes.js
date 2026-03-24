"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const scheduleController_js_1 = require("../controllers/scheduleController.js");
const router = express_1.default.Router();
router.get('/', scheduleController_js_1.getSchedules);
router.post('/', scheduleController_js_1.createSchedule);
router.put('/:id', scheduleController_js_1.updateSchedule);
router.delete('/:id', scheduleController_js_1.deleteSchedule);
exports.default = router;
