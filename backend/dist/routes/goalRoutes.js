"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const goalController_js_1 = require("../controllers/goalController.js");
const router = express_1.default.Router();
router.get('/', goalController_js_1.getGoals);
router.post('/', goalController_js_1.createGoal);
router.put('/:id', goalController_js_1.updateGoal);
router.delete('/:id', goalController_js_1.deleteGoal);
exports.default = router;
