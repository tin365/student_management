"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchedule = exports.updateSchedule = exports.createSchedule = exports.getSchedules = void 0;
const Schedule_js_1 = __importDefault(require("../models/Schedule.js"));
const getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule_js_1.default.find().sort({ startTime: 1 });
        res.json(schedules);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getSchedules = getSchedules;
const createSchedule = async (req, res) => {
    try {
        const newSchedule = new Schedule_js_1.default(req.body);
        const savedSchedule = await newSchedule.save();
        res.status(201).json(savedSchedule);
    }
    catch (error) {
        res.status(400).json({ message: 'Bad Request', error });
    }
};
exports.createSchedule = createSchedule;
const updateSchedule = async (req, res) => {
    try {
        const updatedSchedule = await Schedule_js_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSchedule)
            return res.status(404).json({ message: 'Not Found' });
        res.json(updatedSchedule);
    }
    catch (error) {
        res.status(400).json({ message: 'Bad Request', error });
    }
};
exports.updateSchedule = updateSchedule;
const deleteSchedule = async (req, res) => {
    try {
        const deletedSchedule = await Schedule_js_1.default.findByIdAndDelete(req.params.id);
        if (!deletedSchedule)
            return res.status(404).json({ message: 'Not Found' });
        res.json({ message: 'Schedule deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.deleteSchedule = deleteSchedule;
