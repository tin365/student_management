"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGoal = exports.updateGoal = exports.createGoal = exports.getGoals = void 0;
const Goal_js_1 = __importDefault(require("../models/Goal.js"));
const getGoals = async (req, res) => {
    try {
        const goals = await Goal_js_1.default.find().sort({ createdAt: -1 });
        res.json(goals);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getGoals = getGoals;
const createGoal = async (req, res) => {
    try {
        const newGoal = new Goal_js_1.default(req.body);
        const savedGoal = await newGoal.save();
        res.status(201).json(savedGoal);
    }
    catch (error) {
        res.status(400).json({ message: 'Bad Request', error });
    }
};
exports.createGoal = createGoal;
const updateGoal = async (req, res) => {
    try {
        const updatedGoal = await Goal_js_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedGoal)
            return res.status(404).json({ message: 'Not Found' });
        res.json(updatedGoal);
    }
    catch (error) {
        res.status(400).json({ message: 'Bad Request', error });
    }
};
exports.updateGoal = updateGoal;
const deleteGoal = async (req, res) => {
    try {
        const deletedGoal = await Goal_js_1.default.findByIdAndDelete(req.params.id);
        if (!deletedGoal)
            return res.status(404).json({ message: 'Not Found' });
        res.json({ message: 'Goal deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.deleteGoal = deleteGoal;
