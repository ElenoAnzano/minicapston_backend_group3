"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getAllEvents = void 0;
const client_1 = require(".prisma/client");
const prisma = new client_1.PrismaClient();
const getAllEvents = () => prisma.dashboardHandler.findMany({
    orderBy: { date: "asc" },
});
exports.getAllEvents = getAllEvents;
const createEvent = (data) => prisma.dashboardHandler.create({ data });
exports.createEvent = createEvent;
const updateEvent = (id, data) => prisma.dashboardHandler.update({
    where: { id },
    data,
});
exports.updateEvent = updateEvent;
const deleteEvent = (id) => prisma.dashboardHandler.delete({ where: { id } });
exports.deleteEvent = deleteEvent;
//# sourceMappingURL=dashboardRepo.js.map