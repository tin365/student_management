"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudySession = exports.updateStudySession = exports.createStudySession = exports.getStudySessions = void 0;
const StudySession_js_1 = __importDefault(require("../models/StudySession.js"));
const getStudySessions = async (req, res) => {
    try {
        const sessions = await StudySession_js_1.default.find().sort({ date: -1 });
        res.json(sessions);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getStudySessions = getStudySessions;
const createStudySession = async (req, res) => {
    try {
        const newSession = new StudySession_js_1.default(req.body);
        const savedSession = await newSession.save();
        res.status(201).json(savedSession);
    }
    catch (error) {
        res.status(400).json({ message: 'Bad Request', error });
    }
};
exports.createStudySession = createStudySession;
const updateStudySession = async (req, res) => {
    try {
        const updatedSession = await StudySession_js_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedSession)
            return res.status(404).json({ message: 'Not Found' });
        res.json(updatedSession);
    }
    catch (error) {
        res.status(400).json({ message: 'Bad Request', error });
    }
};
exports.updateStudySession = updateStudySession;
const deleteStudySession = async (req, res) => {
    try {
        const deletedSession = await StudySession_js_1.default.findByIdAndDelete(req.params.id);
        if (!deletedSession)
            return res.status(404).json({ message: 'Not Found' });
        res.json({ message: 'Study Session deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.deleteStudySession = deleteStudySession;
