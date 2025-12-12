import { Request, Response } from "express";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../repositories/dashboardRepo";
//get
export const getAll = async (req: Request, res: Response) => {
  const events = await getAllEvents();
  res.json(events);
};
//put
export const create = async (req: Request, res: Response) => {
  const { date, items } = req.body;
  const newEvent = await createEvent({ date, items });
  res.status(201).json(newEvent);
};
//post
export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, items } = req.body;
  const updated = await updateEvent(id, { date, items });
  res.json(updated);
};
//delete
export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteEvent(id);
  res.status(204).send();

};
