"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studySessionController_js_1 = require("../controllers/studySessionController.js");
const router = express_1.default.Router();
router.get('/', studySessionController_js_1.getStudySessions);
router.post('/', studySessionController_js_1.createStudySession);
router.put('/:id', studySessionController_js_1.updateStudySession);
router.delete('/:id', studySessionController_js_1.deleteStudySession);
exports.default = router;
