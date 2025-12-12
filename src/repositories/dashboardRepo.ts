import { PrismaClient } from ".prisma/client";

const prisma = new PrismaClient();

export const getAllEvents = () =>
  prisma.dashboardHandler.findMany({
    orderBy: { date: "asc" },
  });

export const createEvent = (data: { date: string; items: string }) =>
  prisma.dashboardHandler.create({ data });

export const updateEvent = (id: string, data: { date: string; items: string }) =>
  prisma.dashboardHandler.update({
    where: { id },
    data,
  });

export const deleteEvent = (id: string) =>

  prisma.dashboardHandler.delete({ where: { id } });
