"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.updateExpense = exports.createExpense = exports.getExpenses = void 0;
const Expense_js_1 = __importDefault(require("../models/Expense.js"));
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense_js_1.default.find().sort({ date: -1 });
        res.json(expenses);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getExpenses = getExpenses;
const createExpense = async (req, res) => {
    try {
        const newExpense = new Expense_js_1.default(req.body);
        const savedExpense = await newExpense.save();
        res.status(201).json(savedExpense);
    }
    catch (error) {
        res.status(400).json({ message: 'Bad Request', error });
    }
};
exports.createExpense = createExpense;
const updateExpense = async (req, res) => {
    try {
        const updatedExpense = await Expense_js_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedExpense)
            return res.status(404).json({ message: 'Not Found' });
        res.json(updatedExpense);
    }
    catch (error) {
        res.status(400).json({ message: 'Bad Request', error });
    }
};
exports.updateExpense = updateExpense;
const deleteExpense = async (req, res) => {
    try {
        const deletedExpense = await Expense_js_1.default.findByIdAndDelete(req.params.id);
        if (!deletedExpense)
            return res.status(404).json({ message: 'Not Found' });
        res.json({ message: 'Expense deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.deleteExpense = deleteExpense;
