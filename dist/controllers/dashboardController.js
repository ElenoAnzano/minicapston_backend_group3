"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getAll = void 0;
const dashboardRepo_1 = require("../repositories/dashboardRepo");
//get
const getAll = async (req, res) => {
    const events = await (0, dashboardRepo_1.getAllEvents)();
    res.json(events);
};
exports.getAll = getAll;
//put
const create = async (req, res) => {
    const { date, items } = req.body;
    const newEvent = await (0, dashboardRepo_1.createEvent)({ date, items });
    res.status(201).json(newEvent);
};
exports.create = create;
//post
const update = async (req, res) => {
    const { id } = req.params;
    const { date, items } = req.body;
    const updated = await (0, dashboardRepo_1.updateEvent)(id, { date, items });
    res.json(updated);
};
exports.update = update;
//delete
const remove = async (req, res) => {
    const { id } = req.params;
    await (0, dashboardRepo_1.deleteEvent)(id);
    res.status(204).send();
};
exports.remove = remove;
//# sourceMappingURL=dashboardController.js.map